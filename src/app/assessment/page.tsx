"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const assessmentQuestions = [
  {
    question: "What is your primary programming language?",
    options: ["JavaScript", "Python", "Java", "C++", "Other"],
  },
  {
    question: "How many years of professional experience do you have?",
    options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
  },
  {
    question: "Which area interests you most?",
    options: ["Frontend", "Backend", "Full Stack", "DevOps", "Data Science"],
  },
  {
    question: "What is your current employment status?",
    options: ["Employed", "Unemployed", "Student", "Freelancer", "Career Changer"],
  },
  {
    question: "What is your primary career goal?",
    options: ["Promotion", "Career Change", "Skill Development", "Entrepreneurship", "Work-Life Balance"],
  },
]

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handleSelectOption = (option: string) => {
    const newAnswers = [...answers]
    newAnswers[currentStep] = option
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    // TODO: Send assessment results to backend
  }

  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Assessment Complete!</h1>
          <p className="text-muted-foreground mb-6">
            We're analyzing your responses to create personalized recommendations.
          </p>

          <Link href="/career-paths">
            <Button className="w-full gap-2">
              View Recommendations <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const question = assessmentQuestions[currentStep]
  const selectedAnswer = answers[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center gap-2 mb-8 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Career Assessment</h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Question {currentStep + 1} of {assessmentQuestions.length}
              </p>
              <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6">{question.question}</h2>

          <div className="space-y-3 mb-8">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(option)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                  selectedAnswer === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === assessmentQuestions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={!selectedAnswer} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!selectedAnswer} className="flex-1">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
