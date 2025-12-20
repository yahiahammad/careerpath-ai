# Career Chatbot Implementation Plan

## Goal Description
Create a dedicated AI-powered chatbot page (`/dashboard/chat`) that acts as a career counselor. It will analyze the user's current skills (persisted in Supabase), recommend courses, and visually map out career trajectories and alternatives using Mermaid.js graphs.

## User Review Required
> [!IMPORTANT]
> **Mermaid.js Dependency**: I will need to install `mermaid` to render the visual graphs on the frontend.

## Proposed Changes

### Frontend
#### [NEW] [page.tsx](file:///c:/Users/yahia/WebstormProjects/careerpath/src/app/dashboard/chat/page.tsx)
- **Description**: A new full-height page layout for the chat interface.
- **Features**:
    - Chat message history container.
    - Sticky input area at the bottom.
    - Markdown rendering support for messages (to handle bold text, lists).
    - **Custom Mermaid Renderer**: A component to detect `mermaid` code blocks in the AI response and render them as diagrams.

#### [NEW] [chat-service.ts](file:///c:/Users/yahia/WebstormProjects/careerpath/src/lib/chat-service.ts)
- **Description**: Helper functions to handle API calls to `/api/chat`, managing message history state.

### Backend
#### [NEW] [route.ts](file:///c:/Users/yahia/WebstormProjects/careerpath/src/app/api/chat/route.ts)
- **Description**: The API endpoint handling the conversation.
- **Logic**:
    1. **Context & Skill Gap Analysis**:
        - Retrieve user's `current skills` from DB.
        - **LLM Step 1**: Ask LLM to identify *missing skills* for the requested `Target Information` (Role/Trajectory).
    2. **Intelligent Course Retrieval** (The "Think Harder" part):
        - Perform a **structured query** against `course_skills` or use embedding similarity.
        - **Critical**: Fetch a larger pool of candidates (e.g., top 20) to allow for filtering.
        - valid_courses = `SELECT * ... WHERE s.name IN (missing_skills)`.
    3. **Trajectory Construction & Language Filter**:
        - **LLM Step 2**: Feed the `valid_courses` list (JSON) to the LLM.
        - System Prompt Modification: "**STRICTLY EXCLUDE** any courses where the title is not in English. Choose the next best English alternative from the list."
        - Prompt: "Construct a learning path using *only* these specific English courses..."
    4. **Response Generation**:
        - Generate the standard text response.
        - Generate the **Mermaid.js** graph code, where nodes represent concrete steps (e.g., "Step 1: Learn React" -> "Course: React for Beginners").
    3. **LLM Call**: Use Groq (Llama-3.3-70b-versatile) to generate the response.
    4. **Response**: Return the text (including markdown/mermaid) to the frontend.

### Database / Integration
- Reuse existing `courses` table and embeddings for context if specific course info is needed, but primarily reliance on the LLM's general knowledge for "career trajectories".
- The chatbot will fetch *current skills* from the `user_skills` or `career_assessments` tables (need to confirm exact table structure during implementation) to personalize the advice.

## Verification Plan

### Automated Tests
- N/A (Project doesn't have a rigid test suite setup yet).

### Manual Verification
1. **Chat Interaction**:
    - Go to `/dashboard/chat`.
    - Send a message: "What should I learn next?".
    - Verify AI mentions my *actual* tabulated skills.
2. **Trajectory Visualization**:
    - Ask: "Draw me a career path to become a CTO".
    - Verify a Mermaid graph renders visually (not just code).
3. **Alternative Paths**:
    - Ask: "What else can I do with my skills?".
    - Verify it suggests divergent paths (e.g. backend dev -> data engineer) with a visual graph.
