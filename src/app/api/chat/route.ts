import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic'; // Prevent static analysis build crashes

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Singleton for embedding model
let extractor: any = null;
async function getExtractor() {
    if (!extractor) {
        const { pipeline } = await import('@xenova/transformers');
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

const COURSE_KEYWORDS = [
    'course', 'courses', 'learn', 'learning', 'study', 'training',
    'tutorial', 'class', 'certification', 'certificate', 'recommend',
    'skill', 'skills', 'what should i learn', 'how to learn', 'resources',
    'where can i', 'udemy', 'coursera', 'linkedin learning'
];
// deteccts when it should respond with courses
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
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }


        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const context = await getUserContext(supabase, user.id);


        const courses = await findRelevantCourses(supabase, messages, context);

        const systemPrompt = buildSystemPrompt(context, courses);

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// --- Helper Functions ---

interface UserContext {
    skillsList: string;
    currentPosition: string;
    targetCareer: string;
    education: string;
}

async function getUserContext(supabase: any, userId: string): Promise<UserContext> {
    const [skillsResult, profileResult] = await Promise.all([
        supabase
            .from('user_skills')
            .select('proficiency_level, skill:skills(name)')
            .eq('user_id', userId),
        supabase
            .from('career_profiles')
            .select('current_position, expected_careerpath, education_level')
            .eq('user_id', userId)
            .single()
    ]);

    const skillsList = skillsResult.data?.map((us: any) =>
        `${us.skill?.name} (${us.proficiency_level})`
    ).join(', ') || 'No skills recorded';

    const profile = profileResult.data;

    return {
        skillsList,
        currentPosition: profile?.current_position || 'Unknown',
        targetCareer: profile?.expected_careerpath || 'Not specified',
        education: profile?.education_level || 'Not specified'
    };
}

async function findRelevantCourses(supabase: any, messages: Message[], context: UserContext): Promise<Course[]> {
    if (!shouldFetchCourses(messages)) return [];

    try {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage) return [];

        // A. Refine Search Query
        const queryGenCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at refining search queries for career courses. 
Based on the user's profile and request, generate a SINGLE, keywords-focused search query to find the most relevant courses.
Do not include words like "course" or "learn". Focus on specific skills, technologies, or roles.
User Target Path: ${context.targetCareer}
User Skills: ${context.skillsList}`
                },
                { role: 'user', content: lastUserMessage.content }
            ],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 50,
            temperature: 0.3,
        });

        const refinedQuery = queryGenCompletion.choices[0]?.message?.content?.trim() || `${context.targetCareer} skills`;
        console.log('Generated Search Query:', refinedQuery);

        // B. Generate Embedding
        const pipe = await getExtractor();
        const output = await pipe(refinedQuery, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);

        // C. Match Courses
        const { data: matchedCourses } = await supabase.rpc('match_courses', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 5
        });

        if (!matchedCourses || matchedCourses.length === 0) return [];

        // D. Hydrate Course Details
        const courseIds = matchedCourses.map((c: any) => c.id);
        const { data: coursesWithSkills } = await supabase
            .from('courses')
            .select(`
                id, title, provider, url, duration_hours, rating, user_count, difficulty_level,
                course_skills (skill:skills(name))
            `)
            .in('id', courseIds);

        return coursesWithSkills?.map((c: any) => ({
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

    } catch (courseError) {
        console.error('Error fetching courses:', courseError);
        return [];
    }
}

function buildSystemPrompt(context: UserContext, courses: Course[]): string {
    const courseContext = courses.length > 0
        ? `\n\n**NOTE:** I have found ${courses.length} relevant courses that will be displayed as cards below your response. Reference them naturally in your advice (e.g., "I've found some great courses for you" or "check out the recommended courses below").`
        : '';

    return `You are an expert AI career counselor with deep knowledge of career development, learning paths, and industry trends. You help users navigate their career journey.

**USER PROFILE:**
- Current Position: ${context.currentPosition}
- Target Career Path: ${context.targetCareer}
- Education Level: ${context.education}
- Current Skills: ${context.skillsList}

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

**SCOPE & LIMITATIONS (CRITICAL):**
- You are strictly a Career Counselor AI.
- **DO NOT** answer questions unrelated to careers, jobs, education, skills, resume building, or professional development.
- If a user asks about general topics (e.g., "Write a poem about cats", "What is the capital of France?", "Coding help not related to career"), politely decline and steer them back to their career path.
- Example refusal: "I specialize in career counseling and professional development. I can help you plan your next career move or find relevant courses, but I can't assist with that."

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
}
