"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Brain, CheckCircle, ArrowRight, ArrowLeft, Search, X, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- Types & Constants ---

interface PersonalInfo {
  currentStatus: string
  currentJobTitle: string
  targetCareerPath: string
  yearsExperience: string
  educationLevel: string
}

interface Question {
  id: string
  question: string
  type: 'choice' | 'multi-choice' | 'text' | 'job-search' | 'skill-search' | 'rating'
  options?: string[]
  placeholder?: string
}

const ASSESSMENT_QUESTIONS: Question[] = [
  // Section 1: Baseline & Goals
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

  // Section 2: Technical Skill Inventory
  {
    id: "q_languages",
    question: "Which programming languages are you proficient in?",
    type: "skill-search",
    placeholder: "e.g., Python, JavaScript, Java..."
  },
  {
    id: "q_frameworks",
    question: "Which frameworks & libraries can you build with?",
    type: "skill-search",
    placeholder: "e.g., React, Django, Spring Boot..."
  },
  {
    id: "q_tools",
    question: "Which tools & platforms do you use regularly?",
    type: "skill-search",
    placeholder: "e.g., Git, Docker, AWS, Figma..."
  },
  {
    id: "q_confidence",
    question: "How would you rate your overall technical problem-solving ability?",
    type: "rating",
    options: ["1 - Beginner", "2 - Learning", "3 - Competent", "4 - Advanced", "5 - Expert"]
  },

  // Section 3: Soft Skills & Methodology
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

  // Section 4: Learning Preferences
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

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  // State
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Data Stores
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    currentStatus: "",
    currentJobTitle: "",
    targetCareerPath: "",
    yearsExperience: "",
    educationLevel: ""
  })
  // Generic answers for choice/text questions
  const [answers, setAnswers] = useState<Record<string, any>>({})
  // Skill Entry Type
  type SkillEntry = { name: string; level: string }

  // Specific store for multi-select skills to keep them organized
  const [selectedSkills, setSelectedSkills] = useState<Record<string, SkillEntry[]>>({
    q_languages: [],
    q_frameworks: [],
    q_tools: []
  })

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // --- Actions ---

  const handleNext = () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1)
      setSearchQuery("") // Reset search
      setSearchResults([]) // Clear to prevent cache issues
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setSearchQuery("")
      setSearchResults([]) // Clear to prevent cache issues
    }
  }

  // --- DB Fetchers ---

  const searchJobTitles = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    console.log("SEARCHING FOR:", query)

    try {
      const { data, error } = await supabase
        .from('job_titles')
        .select('"Job Title"')
        .ilike('"Job Title"', `%${query}%`)
        .limit(10)

      console.log("SUPABASE RESULT:", { data, error })

      if (error) {
        console.error("Supabase Error searching jobs:", JSON.stringify(error, null, 2))
        // Fallback for demo if DB is empty or connection fails
        setSearchResults([query, "Software Engineer", "Data Scientist", "Product Manager"].filter(j => j.toLowerCase().includes(query.toLowerCase())))
      } else {
        const jobs = data?.map((item: any) => item['Job Title']) || []
        console.log("MAPPED JOBS:", jobs)
        setSearchResults(jobs)
      }
    } catch (e: any) {
      console.error("Exception searching jobs:", e.message || e)
    } finally {
      setIsSearching(false)
    }
  }

  const searchSkills = async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      // Basic mock fallback + DB search attempt
      const { data, error } = await supabase
        .from('skills')
        .select('name')
        .ilike('name', `${query}%`)
        .limit(10)

      if (error || !data || data.length === 0) {
        // Fallback or custom add
        setSearchResults([query])
      } else {
        setSearchResults(data.map((d: any) => d.name))
      }
    } catch (e) {
      setSearchResults([query])
    }
    setIsSearching(false)
  }

  // --- Atomic Submit Logic ---

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to save results.")
        setIsSubmitting(false)
        return
      }

      // 2. Consolidate Data
      // Map question IDs to state values
      const fullProfile = {
        current_position: answers['q_current_job'] || personalInfo.currentJobTitle,
        education_level: answers['q_education'],
        // We will set this after creating the path
        expected_careerpath_id: null as string | null,
        expected_careerpath: answers['q_target_path'] || personalInfo.targetCareerPath,
        updated_at: new Date().toISOString()
      }

      const allSkills = [
        ...(selectedSkills['q_languages'] || []),
        ...(selectedSkills['q_frameworks'] || []),
        ...(selectedSkills['q_tools'] || [])
      ]

      // 3. DB Operations

      // A. Create/Find Career Path
      let careerPathId = null
      /*
      // User requested to NOT create a career path entry yet.
      if (fullProfile.expected_careerpath) {
        console.log("Creating/Finding career path for:", fullProfile.expected_careerpath)
        // We create a new personal career path entry for this user
        const { data: pathData, error: pathError } = await supabase
          .from('career_path')
          .insert({
            user_id: user.id,
            title: fullProfile.expected_careerpath,
            description: "Generated from Assessment",
            ai_confidence_score: 0,
            market_demand_score: 0
          })
          .select('career_path_id')
          .single()

        if (pathError) {
          console.error("Error creating career path:", JSON.stringify(pathError, null, 2))
          toast.error("Could not save career path details. (Check RLS policies)")
        } else {
          careerPathId = pathData.career_path_id
        }
      }
      */

      // B. Update Career Profile
      const { error: profileError } = await supabase
        .from('career_profiles')
        .upsert({
          user_id: user.id,
          current_position: fullProfile.current_position,
          education_level: fullProfile.education_level,
          expected_careerpath: fullProfile.expected_careerpath,
          expected_careerpath_id: careerPathId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (profileError) throw new Error("Failed to update profile: " + profileError.message)

      // C. Insert Skills (Best Effort)
      const uniqueSkillNames = Array.from(new Set(allSkills.map(s => s.name)))
      console.log("Unique Skill Names to Save:", uniqueSkillNames)

      if (uniqueSkillNames.length > 0) {
        // 1. Fetch IDs for these names
        const { data: existingSkills, error: fetchSkillsError } = await supabase
          .from('skills')
          .select('id, name')
          .in('name', uniqueSkillNames)

        console.log("Existing Skills Found in DB:", existingSkills)

        if (fetchSkillsError) {
          console.error("Error computing skill IDs:", fetchSkillsError)
        } else if (existingSkills && existingSkills.length > 0) {
          // 2. Map names to IDs with LeveL
          const startStats = existingSkills.map(s => {
            const userSelection = allSkills.find(userS => userS.name === s.name)
            console.log(`Mapping skill ${s.name}: user selected`, userSelection)
            return {
              user_id: user.id,
              skill_id: s.id,
              proficiency_level: userSelection?.level || "Intermediate",
              last_updated: new Date().toISOString()
            }
          })

          console.log("PAYLOAD for user_skills:", startStats) // Debug Log

          const { error: skillInsertError } = await supabase
            .from('user_skills')
            .upsert(startStats)

          if (skillInsertError) console.error("Error inserting user_skills:", JSON.stringify(skillInsertError, null, 2))
        } else {
          console.log("No matching skills found in 'skills' table for:", uniqueSkillNames)
        }
      }

      // D. Save Assessment Record
      const { error: assessmentError } = await supabase
        .from('career_assessments')
        .upsert({
          user_id: user.id,
          responses: {
            ...answers,
            personalInfo,
            selectedSkills,
            timestamp: new Date().toISOString()
          },
          ai_summary: "Pending Analysis"
        }, { onConflict: 'user_id' })

      if (assessmentError) throw new Error("Failed to save assessment: " + assessmentError.message)

      setCompleted(true)
      toast.success("Assessment saved successfully!")

    } catch (error: any) {
      console.error("Submission error:", error)
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Render Helpers ---

  const renderQuestionInput = (q: Question) => {
    switch (q.type) {
      case 'choice':
      case 'rating':
        return (
          <div className="space-y-3">
            {q.options?.map((option) => (
              <button
                key={option}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: option }))}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${answers[q.id] === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'multi-choice':
        const currentSelected = (answers[q.id] as string[]) || []
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options?.map((option) => {
              const isSelected = currentSelected.includes(option)
              return (
                <button
                  key={option}
                  onClick={() => {
                    const newSelected = isSelected
                      ? currentSelected.filter(i => i !== option)
                      : [...currentSelected, option]
                    setAnswers(prev => ({ ...prev, [q.id]: newSelected }))
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'job-search':
        return (
          <div className="space-y-4">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={q.placeholder}
                    value={answers[q.id] || searchQuery}
                    onChange={(e) => {
                      const val = e.target.value
                      setSearchQuery(val)
                      setAnswers(prev => ({ ...prev, [q.id]: val }))
                      searchJobTitles(val)
                      setSearchOpen(true)
                    }}
                    className="pl-9 h-12 text-lg"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {isSearching ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No results found</div>
                  ) : (
                    searchResults.map((job) => (
                      <button
                        key={job}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          setAnswers(prev => ({ ...prev, [q.id]: job }))
                          setSearchQuery("")
                          setSearchOpen(false)
                        }}
                      >
                        {job}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              Select from the list or type your own.
            </p>
          </div>
        )

      case 'skill-search':
        const currentSkills = selectedSkills[q.id] || []
        return (
          <div className="space-y-4">
            {/* Selected Skills Tags */}
            <div className="flex flex-col gap-3 min-h-[40px]">
              {currentSkills.map((skillObj) => (
                <div key={skillObj.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="font-medium">{skillObj.name}</div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={skillObj.level}
                      onValueChange={(val) => {
                        setSelectedSkills(prev => ({
                          ...prev,
                          [q.id]: prev[q.id].map(s => s.name === skillObj.name ? { ...s, level: val } : s)
                        }))
                      }}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => setSelectedSkills(prev => ({
                        ...prev,
                        [q.id]: prev[q.id].filter(s => s.name !== skillObj.name)
                      }))}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={q.placeholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchSkills(e.target.value)
                      setSearchOpen(true)
                    }}
                    className="pl-9"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {searchResults.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No results found</div>
                  ) : (
                    searchResults.map((skill) => (
                      <button
                        key={skill}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          if (!currentSkills.some(s => s.name === skill)) {
                            setSelectedSkills(prev => ({
                              ...prev,
                              [q.id]: [...prev[q.id], { name: skill, level: "Intermediate" }]
                            }))
                          }
                          setSearchQuery("")
                          setSearchOpen(false)
                        }}
                      >
                        {skill}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )

      default:
        return null
    }
  }

  // --- Main Render ---

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
            <Button size="lg" onClick={() => setStarted(true)} className="w-full md:w-auto px-8 text-lg h-12">
              Start Assessment <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
            <Link href="/dashboard/career-path">
              <Button className="w-full h-12 text-lg">
                View My Career Path <ArrowRight className="ml-2" />
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

  // Validation for internal Next button state
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
            {renderQuestionInput(question)}
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
