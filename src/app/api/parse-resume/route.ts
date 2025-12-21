import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import Groq from "groq-sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

        // deletes any other resume that is already in the database
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
            }
        }

        // uploads the new resume to database
        const timestamp = Date.now();
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

        // gets the public url of the uploaded resume
        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);

        // updates the career profile with the new resume
        const { error: dbError } = await supabase
            .from('career_profiles')
            .upsert({
                user_id: user.id,
                resume_url: publicUrl,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (dbError) {
            console.error("DB update error:", dbError);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") { // we use pdf2json if the file is pdf
            const PDFParser = require("pdf2json");
            const pdfParser = new PDFParser(null, 1); // 1 = text only

            text = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
                pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                    // pdf2json returns URL encoded text sometimes, but rawTextContent is usually best
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if ( //if word we use mammoth
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
      4. technicalSkills: A single list of all technical skills found (languages, frameworks, tools). Each skill has a "name" and "level" (Beginner/Intermediate/Advanced/Expert).
      5. softSkills: A list of soft skills found.
      6. suggestedPath: A suggested target career path based on their background (e.g., "Full Stack Developer", "Data Scientist").

      Return ONLY valid JSON in the following format, with no markdown formatting:
      {
        "personalInfo": {
          "currentJobTitle": "string",
          "yearsExperience": "string",
          "educationLevel": "string"
        },
        "technicalSkills": [
          { "name": "string", "level": "string" }
        ],
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
