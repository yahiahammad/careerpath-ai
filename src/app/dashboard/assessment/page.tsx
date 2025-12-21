"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, ArrowRight, ArrowLeft, Loader2, UploadCloud } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ASSESSMENT_QUESTIONS, PersonalInfo } from "./constants"
import { QuestionRenderer } from "./components/QuestionRenderer"
import { useAssessmentLogic } from "./hooks/useAssessmentLogic"

export default function AssessmentPage() {
  const router = useRouter()

  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    currentStatus: "",
    currentJobTitle: "",
    targetCareerPath: "",
    yearsExperience: "",
    educationLevel: ""
  })
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [searchQuery, setSearchQuery] = useState("")

  type SkillEntry = { name: string; level: string }
  const [selectedSkills, setSelectedSkills] = useState<Record<string, SkillEntry[]>>({
    q_technical_skills: []
  })

  const {
    isSubmitting,
    isUploading,
    searchResults,
    isSearching,
    setSearchResults,
    searchJobTitles,
    searchSkills,
    handleFileUpload,
    submitAssessment
  } = useAssessmentLogic()

  const handleNext = () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1)
      setSearchQuery("")
      setSearchResults([])
    } else {
      submitAssessment(answers, personalInfo, selectedSkills, setCompleted)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setSearchQuery("")
      setSearchResults([])
    }
  }


  if (!started) {
    return (
      <div>
        <DashboardHeader
          title="Career Assessment"
          description="Identify your skill gaps and find your path"
        />
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="p-8 text-center border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Skill Gap Analysis</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-lg max-w-lg mx-auto">
              Our AI will analyze your current skills against your dream role to create a personalized learning roadmap.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-background/50 p-4 rounded-lg border">
                <span className="text-xl font-bold text-primary block mb-1">15</span>
                <span className="text-sm text-muted-foreground">Questions</span>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border">
                <span className="text-xl font-bold text-primary block mb-1">5m</span>
                <span className="text-sm text-muted-foreground">Estimated Time</span>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border">
                <span className="text-xl font-bold text-primary block mb-1">AI</span>
                <span className="text-sm text-muted-foreground">Powered Reports</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => setStarted(true)} className="w-full sm:w-auto px-8 text-lg h-12">
                Start Assessment <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(
                        e.target.files[0],
                        setPersonalInfo,
                        setAnswers,
                        selectedSkills,
                        setSelectedSkills,
                        setStarted
                      );
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isUploading}
                />
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 text-lg h-12 gap-2" disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                  {isUploading ? "Analyzing..." : "Upload Resume"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, DOCX (Max 5MB)
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <Card className="p-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Analysis Complete!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We've generated your profile and are calculating your skill gaps now.
          </p>
          <div className="space-y-4">
            <Link href="/dashboard/chat">
              <Button className="w-full h-12 text-lg">
                Talk to AI Coach <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const question = ASSESSMENT_QUESTIONS[currentStep]
  const isLastQuestion = currentStep === ASSESSMENT_QUESTIONS.length - 1
  const progress = ((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100

  // Validation
  const isCurrentStepValid = () => {
    if (question.type === 'skill-search') {
      return (selectedSkills[question.id]?.length || 0) > 0
    }
    if (question.type === 'multi-choice') {
      const val = answers[question.id]
      return Array.isArray(val) && val.length > 0
    }
    return !!answers[question.id] && answers[question.id].length > 0
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Question {currentStep + 1} of {ASSESSMENT_QUESTIONS.length}</span>
          <span className="font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 md:p-8 min-h-[400px] flex flex-col">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">{question.question}</h1>

          <div className="py-4">
            <QuestionRenderer
              question={question}
              answers={answers}
              setAnswers={setAnswers}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              searchOpen={searchOpen}
              setSearchOpen={setSearchOpen}
              onSearchJobTitles={searchJobTitles}
              onSearchSkills={searchSkills}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="w-1/3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isCurrentStepValid() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : isLastQuestion ? (
              <>Complete Assessment <CheckCircle className="ml-2 h-4 w-4" /></>
            ) : (
              <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
