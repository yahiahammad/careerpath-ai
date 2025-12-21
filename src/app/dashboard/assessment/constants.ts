export interface PersonalInfo {
    currentStatus: string
    currentJobTitle: string
    targetCareerPath: string
    yearsExperience: string
    educationLevel: string
}

export interface Question {
    id: string
    question: string
    type: 'choice' | 'multi-choice' | 'text' | 'job-search' | 'skill-search' | 'rating'
    options?: string[]
    placeholder?: string
}

export const ASSESSMENT_QUESTIONS: Question[] = [
    {
        id: "q_status",
        question: "What best describes your current situation?",
        type: "choice",
        options: ["Student", "Working in Tech", "Working in Non-Tech", "Job Seeking", "Freelancer"]
    },
    {
        id: "q_current_job",
        question: "What is your current job title?",
        type: "job-search",
        placeholder: "Search job titles..."
    },
    {
        id: "q_target_path",
        question: "What is your goal career path?",
        type: "job-search",
        placeholder: "Search for your dream role..."
    },
    {
        id: "q_experience",
        question: "How many years of relevant experience do you have?",
        type: "choice",
        options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"]
    },
    {
        id: "q_education",
        question: "What is your highest relevant education?",
        type: "choice",
        options: ["High School", "Bootcamp / Certificate", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Self-Taught"]
    },

    {
        id: "q_technical_skills",
        question: "What technical skills are you proficient in?",
        type: "skill-search",
        placeholder: "e.g., Python, React, AWS, Docker..."
    },
    {
        id: "q_confidence",
        question: "How would you rate your overall technical problem-solving ability?",
        type: "rating",
        options: ["1 - Beginner", "2 - Learning", "3 - Competent", "4 - Advanced", "5 - Expert"]
    },

    {
        id: "q_soft_skills",
        question: "Select your strongest professional traits",
        type: "multi-choice",
        options: ["Communication", "Leadership", "Teamwork", "Problem Solving", "Time Management", "Adaptability", "Creativity", "Critical Thinking"]
    },
    {
        id: "q_work_style",
        question: "Do you prefer independent work or deep collaboration?",
        type: "choice",
        options: ["Mostly Independent", "Mix of Both", "Mostly Collaborative"]
    },

    {
        id: "q_learning_style",
        question: "How do you learn best?",
        type: "choice",
        options: ["Video Tutorials", "Written Documentation", "Interactive Courses", "Building Projects", "Mentorship"]
    },
    {
        id: "q_time_commitment",
        question: "How many hours per week can you dedicate to upskilling?",
        type: "choice",
        options: ["Less than 5 hours", "5-10 hours", "10-20 hours", "20+ hours"]
    },
    {
        id: "q_motivation",
        question: "What drives your career change/growth?",
        type: "choice",
        options: ["Higher Salary", "Remote Work Flexibility", "Passion for Tech", "Job Stability", "Career Advancement"]
    },
    {
        id: "q_timeline",
        question: "When do you hope to achieve your career goal?",
        type: "choice",
        options: ["ASAP", "Within 3 months", "3-6 months", "6-12 months", "1+ year"]
    }
]
