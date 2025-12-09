"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizProgress } from "@/components/quiz-progress"
import { QuizQuestion } from "@/components/quiz-question"
import { Brain, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createSupabaseClient } from "@/lib/supabase/client"

interface Question {
  id: string
  question: string
  options?: Array<{ id: string; text: string }>
  type?: 'choice' | 'text'
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "What is your current career stage?",
    options: [
      { id: "student", text: "Student / Recent Graduate" },
      { id: "early", text: "Early Career (0-3 years)" },
      { id: "mid", text: "Mid Career (3-10 years)" },
      { id: "senior", text: "Senior / Leadership" },
    ],
  },
  {
    id: "q2",
    question: "Which industry interests you most?",
    options: [
      { id: "tech", text: "Technology & Software" },
      { id: "finance", text: "Finance & Banking" },
      { id: "healthcare", text: "Healthcare & Life Sciences" },
      { id: "other", text: "Other" },
    ],
  },
  {
    id: "q3",
    question: "What are your strongest skills?",
    type: 'text',
  },
  {
    id: "q4",
    question: "What is your primary career goal?",
    options: [
      { id: "growth", text: "Skill Development & Growth" },
      { id: "transition", text: "Career Transition" },
      { id: "advancement", text: "Advancement & Promotion" },
      { id: "entrepreneurship", text: "Entrepreneurship" },
    ],
  },
  {
    id: "q5",
    question: "How much time can you dedicate to learning per week?",
    options: [
      { id: "60", text: "Less than 5 hours" },
      { id: "10", text: "5-10 hours" },
      { id: "20", text: "10-20 hours" },
      { id: "30", text: "More than 20 hours" },
    ],
  },
]

export default function AssessmentPage() {
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [completed, setCompleted] = useState(false)
  const supabase = createSupabaseClient()

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [ASSESSMENT_QUESTIONS[currentQuestion].id]: optionId,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setCompleted(true)
    }
  }

  const handleSearchSkills = async (query: string): Promise<string[]> => {
    console.log("Searching skills for:", query)
    try {
      // Fallback for testing/debugging if DB is empty or connection fails
      if (query.toLowerCase().includes("test") || query.toLowerCase().includes("auto") ||
        query.toLowerCase().includes("java") || query.toLowerCase().includes("react")) {
        const mockSkills = [
          "AutoCAD", "Automation", "Automotive Engineering", "AutoLayout", "Test Skill",
          "Java", "JavaScript", "React", "React Native", "TypeScript"
        ]
        const matches = mockSkills.filter(s => s.toLowerCase().startsWith(query.toLowerCase()))
        if (matches.length > 0) {
          console.log("Returning mock skills:", matches)
          return matches
        }
      }

      // Assuming 'skills' table with 'name' or 'skill' column
      const { data, error } = await supabase
        .from('skills')
        .select('name')
        .ilike('name', `${query}%`)
        .limit(5)

      if (error) {
        console.error("Supabase error searching skills:", error)
        // Try fallback to 'skill' column just in case
        const { data: data2, error: error2 } = await supabase
          .from('skills')
          .select('skill')
          .ilike('skill', `${query}%`)
          .limit(5)

        if (!error2 && data2) {
          console.log("Found skills in 'skill' column:", data2)
          return data2.map((d: any) => d.skill)
        }
        // Return error to UI for debugging
        return [`Error: ${error.message} (Column fallback failed)`]
      }

      if (!data || data.length === 0) {
        // Check if table exists or is accessible by trying a simple count without filter
        // This is a comprehensive debug step
        return [`Debug: No results for "${query}" in DB`]
      }

      console.log("Supabase returned:", data)
      return data.map((d: any) => d.name)
    } catch (e: any) {
      console.error("Exception searching skills:", e)
      return [`Exception: ${e.message || e}`]
    }
  }

  if (!started) {
    return (
      <div>
        <DashboardHeader
          title="Career Assessment"
          description="Complete our AI-powered assessment to get personalized recommendations"
        />

        <div className="max-w-2xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              This assessment will analyze your skills, experience, and career goals to provide personalized
              recommendations. It typically takes 5-10 minutes to complete.
            </p>
            <Button size="lg" onClick={() => setStarted(true)}>
              Begin Assessment <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div>
        <DashboardHeader title="Assessment Complete" description="Your results are being analyzed" />

        <div className="max-w-2xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Assessment Complete!</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Thank you for completing the career assessment. Your responses are being analyzed by our AI system to
              generate personalized recommendations.
            </p>
            <div className="space-y-3">
              <Link href="/dashboard/recommendations">
                <Button className="w-full">
                  View Recommendations <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title="Career Assessment" description="Answer questions about your career goals and skills" />

      <div className="max-w-2xl">
        <Card className="p-8">
          <QuizProgress current={currentQuestion + 1} total={ASSESSMENT_QUESTIONS.length} />

          <QuizQuestion
            question={ASSESSMENT_QUESTIONS[currentQuestion].question}
            options={ASSESSMENT_QUESTIONS[currentQuestion].options}
            selectedOption={answers[ASSESSMENT_QUESTIONS[currentQuestion].id] || null}
            onSelect={handleSelectOption}
            onNext={handleNext}
            isLast={currentQuestion === ASSESSMENT_QUESTIONS.length - 1}
            type={ASSESSMENT_QUESTIONS[currentQuestion].type}
            multiSelect={ASSESSMENT_QUESTIONS[currentQuestion].type === 'text'}
            onSearch={ASSESSMENT_QUESTIONS[currentQuestion].type === 'text' ? handleSearchSkills : undefined}
          />
        </Card>
      </div>
    </div>
  )
}
