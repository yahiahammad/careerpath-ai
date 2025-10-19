"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CareerPathCard } from "@/components/career-path-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Briefcase, Filter } from "lucide-react"

const RECOMMENDED_COURSES = [
  {
    title: "The Complete Web Development Bootcamp",
    provider: "Udemy",
    duration: "60 hours",
    level: "Intermediate",
    rating: 4.8,
    students: "1.2M",
    description: "Master modern web development with HTML, CSS, JavaScript, React, and Node.js",
    tags: ["Web Development", "JavaScript", "React"],
  },
  {
    title: "Google Cloud Professional Data Engineer",
    provider: "Coursera",
    duration: "40 hours",
    level: "Advanced",
    rating: 4.7,
    students: "250K",
    description: "Prepare for the Google Cloud Professional Data Engineer certification",
    tags: ["Cloud", "Data Engineering", "GCP"],
  },
  {
    title: "Machine Learning Specialization",
    provider: "Coursera",
    duration: "80 hours",
    level: "Advanced",
    rating: 4.9,
    students: "500K",
    description: "Learn machine learning fundamentals from Andrew Ng",
    tags: ["Machine Learning", "AI", "Python"],
  },
  {
    title: "Product Management Fundamentals",
    provider: "LinkedIn Learning",
    duration: "20 hours",
    level: "Beginner",
    rating: 4.6,
    students: "150K",
    description: "Essential skills for aspiring and current product managers",
    tags: ["Product Management", "Leadership"],
  },
]

const CAREER_PATHS = [
  {
    title: "Software Engineer to Tech Lead",
    description: "Progress from individual contributor to technical leadership",
    currentRole: "Software Engineer",
    targetRole: "Tech Lead / Engineering Manager",
    skillsNeeded: ["System Design", "Team Leadership", "Architecture", "Communication"],
    timeframe: "2-3 years",
    matchScore: 92,
  },
  {
    title: "Data Analyst to Data Scientist",
    description: "Transition from analytics to advanced data science and ML",
    currentRole: "Data Analyst",
    targetRole: "Data Scientist",
    skillsNeeded: ["Machine Learning", "Python", "Statistics", "Deep Learning"],
    timeframe: "1-2 years",
    matchScore: 85,
  },
  {
    title: "Career Transition to Product Management",
    description: "Move into product management from a technical background",
    currentRole: "Software Engineer",
    targetRole: "Product Manager",
    skillsNeeded: ["Product Strategy", "User Research", "Analytics", "Communication"],
    timeframe: "1-2 years",
    matchScore: 78,
  },
]

export default function RecommendationsPage() {
  return (
    <div>
      <DashboardHeader
        title="Recommendations"
        description="Personalized courses and career paths based on your assessment"
      />

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Career Paths
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recommended Courses</h2>
              <p className="text-muted-foreground mt-1">Curated learning paths to develop the skills you need</p>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RECOMMENDED_COURSES.map((course, i) => (
              <CourseCard key={i} {...course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Career Paths</h2>
            <p className="text-muted-foreground mt-1">Explore potential career trajectories aligned with your goals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CAREER_PATHS.map((path, i) => (
              <CareerPathCard key={i} {...path} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Skill Gap Analysis */}
      <Card className="mt-8 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Your Skill Gap Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Current Strengths</h4>
            <ul className="space-y-2">
              {["Problem Solving", "Communication", "Technical Foundation"].map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Skills to Develop</h4>
            <ul className="space-y-2">
              {["Advanced System Design", "Leadership Skills", "Cloud Architecture"].map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
