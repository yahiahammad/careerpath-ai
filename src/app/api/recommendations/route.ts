import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';
import { pipeline } from '@xenova/transformers';

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Singleton for the embedding pipeline to avoid reloading on every request (in valid environments)
// Note: In serverless, this might still reload, but it helps in some runtimes.
let extractor: any = null;

async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

export async function POST(req: NextRequest) {
    try {
        const { currentPosition, desiredCareerPath, skills } = await req.json();

        if (!currentPosition || !desiredCareerPath) {
            return NextResponse.json(
                { error: 'Missing currentPosition or desiredCareerPath' },
                { status: 400 }
            );
        }

        const currentSkills = skills && skills.length > 0 ? skills.join(', ') : 'None listed';

        // 1. Refine the query using Groq
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert career counselor. Analyze the skill gap between the user current position (and their existing skills) and the desired career path. Return a single, concise search query that covers the most critical technical skills MISSING. Do not suggest skills they already have. Do not include quotes or explanations, just the query text.'
                },
                {
                    role: 'user',
                    content: `Current Position: ${currentPosition}\nCurrent Skills: ${currentSkills}\nDesired Career Path: ${desiredCareerPath}`
                }
            ],
            model: 'llama-3.3-70b-versatile', // Updated to supported model
        });

        const searchQuery = completion.choices[0]?.message?.content?.trim() || `${desiredCareerPath} skills`;
        console.log('Generated Search Query:', searchQuery);

        // 2. Generate Embedding for the query
        const pipe = await getExtractor();
        const output = await pipe(searchQuery, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);

        // 3. Query Supabase
        const supabase = await createSupabaseServerClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Call the RPC function we defined in SQL
        const { data: courses, error } = await supabase.rpc('match_courses', {
            query_embedding: embedding,
            match_threshold: 0.3, // Adjust based on testing
            match_count: 30
        });

        if (error) {
            console.error('Supabase RPC Error:', error);
            return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
        }

        // 4. Save to user_courses table
        if (courses && courses.length > 0) {
            const userCourses = courses.map((course: any) => ({
                user_id: user.id,
                course_id: course.id,
                status: 'recommended',
                progress_percent: 0,
                started_at: new Date().toISOString()
            }));

            const { error: upsertError } = await supabase
                .from('user_courses')
                .upsert(userCourses, { onConflict: 'course_id, user_id' });

            if (upsertError) {
                console.error('Error saving user courses:', upsertError);
                // We don't fail the request if saving fails, but we log it
            }
        }

        return NextResponse.json({
            query: searchQuery,
            recommendations: courses
        });

    } catch (error) {
        console.error('Recommendation API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
