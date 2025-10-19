"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizProgress } from "@/components/quiz-progress"
import { QuizQuestion } from "@/components/quiz-question"
import { Brain, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question: string
  options: Array<{ id: string; text: string }>
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
    options: [
      { id: "technical", text: "Technical / Programming" },
      { id: "analytical", text: "Analytical / Data" },
      { id: "creative", text: "Creative / Design" },
      { id: "leadership", text: "Leadership / Management" },
    ],
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
      { id: "5", text: "Less than 5 hours" },
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
          />
        </Card>
      </div>
    </div>
  )
}
