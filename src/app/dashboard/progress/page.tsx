"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { EnrolledCourseCard } from "@/components/enrolled-course-card"
import { MilestoneCard } from "@/components/milestone-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, BookOpen, Award } from "lucide-react"

const ENROLLED_COURSES = [
  {
    title: "The Complete Web Development Bootcamp",
    provider: "Udemy",
    progress: 65,
    completedLessons: 26,
    totalLessons: 40,
    estimatedTimeLeft: "15 hours",
    status: "in-progress" as const,
  },
  {
    title: "Google Cloud Professional Data Engineer",
    provider: "Coursera",
    progress: 100,
    completedLessons: 32,
    totalLessons: 32,
    estimatedTimeLeft: "0 hours",
    status: "completed" as const,
  },
  {
    title: "Machine Learning Specialization",
    provider: "Coursera",
    progress: 35,
    completedLessons: 14,
    totalLessons: 40,
    estimatedTimeLeft: "25 hours",
    status: "in-progress" as const,
  },
]

const MILESTONES = [
  {
    title: "Complete First Course",
    description: "Finish your first online course",
    completed: true,
    completedDate: "Oct 15, 2024",
  },
  {
    title: "Learn 5 New Skills",
    description: "Master 5 different technical skills",
    completed: true,
    completedDate: "Oct 18, 2024",
  },
  {
    title: "Complete 100 Hours of Learning",
    description: "Dedicate 100 hours to professional development",
    completed: false,
  },
  {
    title: "Earn a Certification",
    description: "Complete and pass a professional certification",
    completed: false,
  },
]

const LEARNING_STATS = [
  { month: "Jan", hours: 5 },
  { month: "Feb", hours: 8 },
  { month: "Mar", hours: 12 },
  { month: "Apr", hours: 15 },
  { month: "May", hours: 18 },
  { month: "Jun", hours: 22 },
]

const SKILL_PROGRESS = [
  { skill: "JavaScript", progress: 75 },
  { skill: "React", progress: 65 },
  { skill: "Python", progress: 55 },
  { skill: "Data Analysis", progress: 45 },
  { skill: "Cloud Computing", progress: 80 },
]

export default function ProgressPage() {
  const totalHours = LEARNING_STATS.reduce((sum, stat) => sum + stat.hours, 0)
  const completedCourses = ENROLLED_COURSES.filter((c) => c.status === "completed").length
  const inProgressCourses = ENROLLED_COURSES.filter((c) => c.status === "in-progress").length

  return (
    <div>
      <DashboardHeader title="Progress Tracking" description="Monitor your learning journey and skill development" />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Learning Hours</p>
              <p className="text-3xl font-bold text-foreground">{totalHours}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Courses Completed</p>
              <p className="text-3xl font-bold text-foreground">{completedCourses}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <p className="text-3xl font-bold text-foreground">{inProgressCourses}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Enrolled Courses</h2>
            <p className="text-muted-foreground">Track your progress across all courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ENROLLED_COURSES.map((course, i) => (
              <EnrolledCourseCard key={i} {...course} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Hours Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Learning Hours Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={LEARNING_STATS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Skill Progress Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Skill Development</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SKILL_PROGRESS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="skill" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Bar dataKey="progress" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Learning Milestones</h2>
            <p className="text-muted-foreground">Celebrate your achievements and track upcoming goals</p>
          </div>

          <div className="space-y-3">
            {MILESTONES.map((milestone, i) => (
              <MilestoneCard key={i} {...milestone} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
