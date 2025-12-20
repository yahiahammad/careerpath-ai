import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';
import { pipeline } from '@xenova/transformers';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Embedding pipeline singleton
let extractor: any = null;
async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Course {
    id: string;
    title: string;
    provider: string;
    url?: string;
    duration_hours?: number;
    rating?: number;
    user_count?: number;
    difficulty_level?: string;
    skills?: string[];
}

// Keywords that suggest user wants course recommendations
const COURSE_KEYWORDS = [
    'course', 'courses', 'learn', 'learning', 'study', 'training',
    'tutorial', 'class', 'certification', 'certificate', 'recommend',
    'skill', 'skills', 'what should i learn', 'how to learn', 'resources',
    'where can i', 'udemy', 'coursera', 'linkedin learning'
];

function shouldFetchCourses(messages: Message[]): boolean {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return false;

    const lowerContent = lastUserMessage.content.toLowerCase();
    return COURSE_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json() as { messages: Message[] };

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's skills with proficiency
        const { data: userSkills } = await supabase
            .from('user_skills')
            .select('proficiency_level, skill:skills(name)')
            .eq('user_id', user.id);

        const skillsList = userSkills?.map((us: any) =>
            `${us.skill?.name} (${us.proficiency_level})`
        ).join(', ') || 'No skills recorded';

        // Fetch career profile
        const { data: careerProfile } = await supabase
            .from('career_profiles')
            .select('current_position, expected_careerpath, education_level')
            .eq('user_id', user.id)
            .single();

        const currentPosition = careerProfile?.current_position || 'Unknown';
        const targetCareer = careerProfile?.expected_careerpath || 'Not specified';
        const education = careerProfile?.education_level || 'Not specified';

        // Fetch courses if the query is course-related
        let courses: Course[] = [];
        if (shouldFetchCourses(messages)) {
            try {
                const lastUserMessage = messages.filter(m => m.role === 'user').pop();

                // 1. Ask LLM to generate a better search query
                const queryGenCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert at refining search queries for career courses. 
Based on the user's profile and request, generate a SINGLE, keywords-focused search query to find the most relevant courses.
Do not include words like "course" or "learn". Focus on specific skills, technologies, or roles.
User Target Path: ${targetCareer}
User Skills: ${skillsList}`
                        },
                        {
                            role: 'user',
                            content: lastUserMessage?.content || ''
                        }
                    ],
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 50,
                    temperature: 0.3,
                });

                const refinedQuery = queryGenCompletion.choices[0]?.message?.content?.trim() || `${targetCareer} skills`;
                console.log('Generated Search Query:', refinedQuery);

                // 2. Generate embedding for the refined query
                const pipe = await getExtractor();
                const output = await pipe(refinedQuery, { pooling: 'mean', normalize: true });
                const embedding = Array.from(output.data);

                // Query matching courses
                const { data: matchedCourses } = await supabase.rpc('match_courses', {
                    query_embedding: embedding,
                    match_threshold: 0.3,
                    match_count: 5
                });

                if (matchedCourses && matchedCourses.length > 0) {
                    // Fetch additional course details including skills
                    const courseIds = matchedCourses.map((c: any) => c.id);
                    const { data: coursesWithSkills } = await supabase
                        .from('courses')
                        .select(`
                            id, title, provider, url, duration_hours, rating, user_count, difficulty_level,
                            course_skills (skill:skills(name))
                        `)
                        .in('id', courseIds);

                    courses = coursesWithSkills?.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        provider: c.provider,
                        url: c.url,
                        duration_hours: c.duration_hours,
                        rating: c.rating,
                        user_count: c.user_count,
                        difficulty_level: c.difficulty_level,
                        skills: c.course_skills?.map((cs: any) => cs.skill?.name).filter(Boolean) || []
                    })) || [];
                }
            } catch (courseError) {
                console.error('Error fetching courses:', courseError);
                // Continue without courses
            }
        }

        // Build system prompt with user context
        const courseContext = courses.length > 0
            ? `\n\n**NOTE:** I have found ${courses.length} relevant courses that will be displayed as cards below your response. Reference them naturally in your advice (e.g., "I've found some great courses for you" or "check out the recommended courses below").`
            : '';

        const systemPrompt = `You are an expert AI career counselor with deep knowledge of career development, learning paths, and industry trends. You help users navigate their career journey.

**USER PROFILE:**
- Current Position: ${currentPosition}
- Target Career Path: ${targetCareer}
- Education Level: ${education}
- Current Skills: ${skillsList}

**YOUR CAPABILITIES:**
1. Analyze skill gaps between current and desired positions
2. Recommend specific learning paths and courses
3. Visualize career trajectories using Mermaid diagrams
4. Suggest alternative career paths based on existing skills
5. Provide actionable advice for career advancement

**IMPORTANT GUIDELINES:**
- Always personalize advice based on the user's profile
- Be encouraging but realistic about timelines
- When discussing career paths or trajectories, include a Mermaid diagram
- For trajectory diagrams, use the TD (top-down) direction
- Keep responses concise but comprehensive
- Focus on English-language courses and resources
${courseContext}

**MERMAID DIAGRAM INSTRUCTIONS:**
When asked to visualize a career path, learning journey, or trajectory, include a Mermaid diagram using this format:

\`\`\`mermaid
graph TD
    A["Current Role"] --> B["Next Step"]
    B --> C["Target Role"]
\`\`\`

**CRITICAL SYNTAX RULES:**
1. **ALWAYS** enclose node labels in double quotes. Example: \`id["Label (Extra Info)"]\`.
2. Do NOT use unquoted text with parentheses or special characters.
3. Use the \`graph TD\` (Top-Down) orientation.
4. Keep diagrams simple and readable.

Make diagrams clear, logical, and actionable. Use descriptive labels.`;

        // Prepare messages for the API call
        const apiMessages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: apiMessages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2048,
        });

        const assistantMessage = completion.choices[0]?.message?.content ||
            "I'm sorry, I couldn't generate a response. Please try again.";

        return NextResponse.json({
            message: assistantMessage,
            role: 'assistant',
            courses: courses.length > 0 ? courses : undefined
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
