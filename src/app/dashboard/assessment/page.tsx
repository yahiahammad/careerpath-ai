"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Brain, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Common job titles
const JOB_TITLES = [
  "Software Developer",
  "Software Engineer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "Business Analyst",
  "Product Manager",
  "Project Manager",
  "UI/UX Designer",
  "Graphic Designer",
  "Marketing Manager",
  "Sales Manager",
  "Accountant",
  "Financial Analyst",
  "HR Manager",
  "Operations Manager",
  "Customer Service Representative",
  "Teacher",
  "Nurse",
  "Doctor",
  "Lawyer",
  "Consultant",
  "Student",
  "Unemployed",
  "Freelancer",
  "Entrepreneur",
  "Content Writer",
  "Social Media Manager",
  "DevOps Engineer",
  "System Administrator",
  "Network Engineer",
  "Cybersecurity Analyst",
  "QA Engineer",
  "Technical Writer",
  "Research Scientist",
]

// Countries list
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Portugal",
  "Greece",
  "Ireland",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Indonesia",
  "Philippines",
  "Vietnam",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "South Africa",
  "Egypt",
  "Nigeria",
  "Kenya",
  "United Arab Emirates",
  "Saudi Arabia",
  "Israel",
  "Turkey",
  "Russia",
  "Ukraine",
  "Czech Republic",
  "Romania",
  "Hungary",
  "New Zealand",
]

interface PersonalInfo {
  name: string
  age: string
  currentPosition: string
  yearsOfExperience: string
  country: string
}

const assessmentQuestions = [
  {
    question: "What are you looking for - part-time or full-time?",
    options: ["Part-time", "Full-time", "Both", "Not sure yet"],
  },
  {
    question: "What is your level of experience with solving technical or analytical problems?",
    options: [
      "Beginner - I'm just starting to learn",
      "Some experience - I've solved a few problems",
      "Intermediate - I can handle most problems independently",
      "Advanced - I excel at complex problem-solving",
      "Expert - I'm a go-to person for technical challenges",
    ],
  },
  {
    question: "How comfortable are you using digital tools like Excel, Google Sheets, or Notion?",
    options: [
      "Not comfortable - I rarely use these tools",
      "Somewhat comfortable - I know the basics",
      "Comfortable - I use them regularly",
      "Very comfortable - I'm proficient with multiple tools",
      "Expert - I can create complex solutions with these tools",
    ],
  },
  {
    question: "Can you explain a project you completed and the steps you took?",
    options: [
      "I haven't completed any significant projects yet",
      "I've done small projects but struggle to explain the process",
      "I can explain basic projects with some guidance",
      "I can clearly explain projects and the steps I took",
      "I excel at explaining complex projects and methodologies",
    ],
  },
  {
    question: "How fast can you learn new tools or technologies?",
    options: [
      "Slow - I need a lot of time and guidance",
      "Moderate - I learn at an average pace",
      "Fast - I pick up new things quickly",
      "Very fast - I'm a quick learner",
      "Extremely fast - I master new tools rapidly",
    ],
  },
  {
    question: "How confident are you presenting ideas to others?",
    options: [
      "Not confident - I avoid presentations",
      "Somewhat confident - I can present with preparation",
      "Confident - I'm comfortable presenting",
      "Very confident - I enjoy presenting",
      "Extremely confident - I excel at presentations",
    ],
  },
  {
    question: "When working with a group, do you take the lead or prefer supporting roles?",
    options: [
      "I always prefer supporting roles",
      "I usually support but can lead if needed",
      "I'm flexible - I can do both equally",
      "I usually take the lead",
      "I always take the lead",
    ],
  },
  {
    question: "Can you explain a complex topic in simple words?",
    options: [
      "No - I struggle with this",
      "Sometimes - with simple topics",
      "Usually - I can simplify most topics",
      "Yes - I'm good at breaking down complexity",
      "Excellent - I excel at making complex topics accessible",
    ],
  },
  {
    question: "How do you handle tasks with tight deadlines?",
    options: [
      "I get overwhelmed and struggle",
      "I can handle it but with stress",
      "I manage reasonably well",
      "I handle it well and stay organized",
      "I thrive under pressure and deliver quality work",
    ],
  },
  {
    question: "How do you react when you face challenges or unexpected changes?",
    options: [
      "I get stressed and need help",
      "I adapt but it takes time",
      "I adapt reasonably well",
      "I adapt quickly and find solutions",
      "I embrace challenges and excel in change",
    ],
  },
  {
    question: "Are you able to work independently without supervision?",
    options: [
      "No - I need constant guidance",
      "Sometimes - I need regular check-ins",
      "Usually - I can work independently most of the time",
      "Yes - I work well independently",
      "Excellent - I'm highly self-directed and productive",
    ],
  },
]

export default function AssessmentPage() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    age: "",
    currentPosition: "",
    yearsOfExperience: "",
    country: "",
  })
  const [completed, setCompleted] = useState(false)
  const [positionOpen, setPositionOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [yearsError, setYearsError] = useState<string>("")
  const [ageError, setAgeError] = useState<string>("")

  const handleSelectOption = (option: string) => {
    const newAnswers = [...answers]
    newAnswers[currentStep - 1] = option // Adjust index since step 0 is personal info
    setAnswers(newAnswers)
  }

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    if (field === "yearsOfExperience") {
      const numValue = parseFloat(value)
      if (value === "" || value === "-") {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setYearsError("")
      } else if (isNaN(numValue)) {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setYearsError("Please enter a valid number")
      } else if (numValue < 0) {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setYearsError("Years of experience cannot be negative")
      } else {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setYearsError("")
      }
    } else if (field === "age") {
      const numValue = parseFloat(value)
      if (value === "" || value === "-") {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setAgeError("")
      } else if (isNaN(numValue)) {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setAgeError("Please enter a valid number")
      } else if (numValue < 0) {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setAgeError("Age cannot be negative")
      } else if (numValue > 120) {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setAgeError("Please enter a valid age")
      } else {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
        setAgeError("")
      }
    } else {
      setPersonalInfo((prev) => ({ ...prev, [field]: value }))
    }
  }

  const isPersonalInfoComplete = () => {
    const yearsValue = parseFloat(personalInfo.yearsOfExperience)
    const hasValidYears = personalInfo.yearsOfExperience.trim() !== "" && !isNaN(yearsValue) && yearsValue >= 0
    
    const ageValue = parseFloat(personalInfo.age)
    const hasValidAge = personalInfo.age.trim() !== "" && !isNaN(ageValue) && ageValue >= 0 && ageValue <= 120
    
    return (
      personalInfo.name.trim() !== "" &&
      hasValidAge &&
      personalInfo.currentPosition.trim() !== "" &&
      hasValidYears &&
      personalInfo.country.trim() !== "" &&
      yearsError === "" &&
      ageError === ""
    )
  }

  const filteredJobTitles = personalInfo.currentPosition
    ? JOB_TITLES.filter((job) =>
        job.toLowerCase().includes(personalInfo.currentPosition.toLowerCase())
      )
    : JOB_TITLES

  const filteredCountries = personalInfo.country
    ? COUNTRIES.filter((country) =>
        country.toLowerCase().includes(personalInfo.country.toLowerCase())
      )
    : COUNTRIES

  const handleNext = () => {
    if (currentStep === 0) {
      // Moving from personal info to first question
      if (isPersonalInfoComplete()) {
        setCurrentStep(1)
      }
    } else if (currentStep < assessmentQuestions.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setCompleted(true)
    // TODO: Send assessment results to backend
    console.log("Personal Info:", personalInfo)
    console.log("Answers:", answers)
  }

  const totalSteps = assessmentQuestions.length + 1 // +1 for personal info step
  const progress = ((currentStep + 1) / totalSteps) * 100

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

  const isPersonalInfoStep = currentStep === 0
  const question = !isPersonalInfoStep ? assessmentQuestions[currentStep - 1] : null
  const selectedAnswer = !isPersonalInfoStep ? answers[currentStep - 1] : null
  const isLastQuestion = currentStep === assessmentQuestions.length

  return (
    <div>
      <DashboardHeader
        title="Career Assessment"
        description={isPersonalInfoStep ? "Tell us about yourself" : "Answer questions about your skills and preferences"}
      />

      <div className="max-w-2xl">
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {isPersonalInfoStep ? "Personal Information" : `Question ${currentStep} of ${assessmentQuestions.length}`}
              </p>
              <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {isPersonalInfoStep ? (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-6">Tell us about yourself</h2>
              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="space-y-1">
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={personalInfo.age}
                      onChange={(e) => handlePersonalInfoChange("age", e.target.value)}
                      min="1"
                      max="120"
                      className={cn(ageError && "border-destructive")}
                    />
                    {ageError && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span>{ageError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPosition">Current Position</Label>
                  <Popover open={positionOpen} onOpenChange={setPositionOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          id="currentPosition"
                          type="text"
                          placeholder="e.g., Software Developer, Student, Unemployed"
                          value={personalInfo.currentPosition}
                          onChange={(e) => {
                            handlePersonalInfoChange("currentPosition", e.target.value)
                            setPositionOpen(true)
                          }}
                          onFocus={() => setPositionOpen(true)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search job titles..." />
                        <CommandList>
                          <CommandEmpty>No job titles found.</CommandEmpty>
                          <CommandGroup>
                            {filteredJobTitles.slice(0, 10).map((job) => (
                              <CommandItem
                                key={job}
                                value={job}
                                onSelect={() => {
                                  handlePersonalInfoChange("currentPosition", job)
                                  setPositionOpen(false)
                                }}
                              >
                                {job}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <div className="space-y-1">
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      placeholder="Enter years of experience"
                      value={personalInfo.yearsOfExperience}
                      onChange={(e) => handlePersonalInfoChange("yearsOfExperience", e.target.value)}
                      min="0"
                      step="0.5"
                      className={cn(yearsError && "border-destructive")}
                    />
                    {yearsError && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span>{yearsError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          id="country"
                          type="text"
                          placeholder="Enter your country"
                          value={personalInfo.country}
                          onChange={(e) => {
                            handlePersonalInfoChange("country", e.target.value)
                            setCountryOpen(true)
                          }}
                          onFocus={() => setCountryOpen(true)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search countries..." />
                        <CommandList>
                          <CommandEmpty>No countries found.</CommandEmpty>
                          <CommandGroup>
                            {filteredCountries.slice(0, 10).map((country) => (
                              <CommandItem
                                key={country}
                                value={country}
                                onSelect={() => {
                                  handlePersonalInfoChange("country", country)
                                  setCountryOpen(false)
                                }}
                              >
                                {country}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-6">{question?.question}</h2>

              <div className="space-y-3 mb-8">
                {question?.options.map((option, i) => (
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
            </>
          )}

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

            {isLastQuestion ? (
              <Button onClick={handleSubmit} disabled={!selectedAnswer} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isPersonalInfoStep ? !isPersonalInfoComplete() : !selectedAnswer}
                className="flex-1"
              >
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
