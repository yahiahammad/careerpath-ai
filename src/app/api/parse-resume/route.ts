import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import Groq from "groq-sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";
// import imports moved inside handler

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 1. Clean up old resumes to enforce single-file policy
        const { data: existingFiles } = await supabase.storage
            .from('resumes')
            .list(user.id);

        if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map(f => `${user.id}/${f.name}`);
            const { error: removeError } = await supabase.storage
                .from('resumes')
                .remove(filesToRemove);

            if (removeError) {
                console.error("Error removing old resume:", removeError);
                // We continue even if delete fails, to strictly allow the new upload
            }
        }

        // 2. Upload to Supabase Storage
        const timestamp = Date.now();
        // Sanitize filename to avoid issues with special characters
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user.id}/${timestamp}_${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw new Error(`Failed to upload resume file: ${uploadError.message}`);
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);

        // 3. Update Career Profile
        const { error: dbError } = await supabase
            .from('career_profiles')
            .upsert({
                user_id: user.id,
                resume_url: publicUrl,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (dbError) {
            console.error("DB update error:", dbError);
            // We don't stop the whole process if this fails, but it's good to know
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") {
            const pdf = require("pdf-parse");
            const data = await pdf(buffer);
            text = data.text;
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            const mammoth = require("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            return NextResponse.json({ error: "Unsupported file type. Please upload PDF or DOCX." }, { status: 400 });
        }

        // Truncate text if too long to avoid token limits (rough safety net)
        const truncatedText = text.slice(0, 20000);

        const systemPrompt = `
      You are an expert career counselor AI. Your task is to extract structured data from a resume to pre-fill a career assessment form.
      
      Extract the following fields:
      1. currentJobTitle: The candidate's most recent or current job title.
      2. yearsExperience: Map to one of ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"].
      3. educationLevel: Map to one of ["High School", "Bootcamp / Certificate", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Self-Taught"].
      4. technicalSkills: Object containing three arrays: "languages", "frameworks", "tools". Each skill has a "name" and "level" (Beginner/Intermediate/Advanced/Expert).
      5. softSkills: A list of soft skills found.
      6. suggestedPath: A suggested target career path based on their background (e.g., "Full Stack Developer", "Data Scientist").

      Return ONLY valid JSON in the following format, with no markdown formatting:
      {
        "personalInfo": {
          "currentJobTitle": "string",
          "yearsExperience": "string",
          "educationLevel": "string"
        },
        "technicalSkills": {
          "languages": [{ "name": "string", "level": "string" }],
          "frameworks": [{ "name": "string", "level": "string" }],
          "tools": [{ "name": "string", "level": "string" }]
        },
        "softSkills": ["string"],
        "suggestedPath": "string"
      }
    `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the resume text:\n\n${truncatedText}` },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const jsonResponse = completion.choices[0]?.message?.content;

        if (!jsonResponse) {
            throw new Error("Failed to generate analysis from Groq");
        }

        return NextResponse.json(JSON.parse(jsonResponse));
    } catch (error: any) {
        console.error("Resume parse error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process resume" },
            { status: 500 }
        );
    }
}
