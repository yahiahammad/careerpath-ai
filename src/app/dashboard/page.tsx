"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { BarChart3, BookOpen, TrendingUp, Brain, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [assessmentStatus, setAssessmentStatus] = useState("Not Started")

  useEffect(() => {
    // Check if assessment has been completed
    const isCompleted = localStorage.getItem("assessmentCompleted") === "true"
    if (isCompleted) {
      setAssessmentStatus("Completed")
    }
  }, [])

  const stats = [
    {
      label: "Assessment Status",
      value: assessmentStatus,
      icon: Brain,
      color: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Skills Identified",
      value: "0",
      icon: BarChart3,
      color: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Courses Recommended",
      value: "0",
      icon: BookOpen,
      color: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Progress",
      value: "0%",
      icon: TrendingUp,
      color: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ]

  return (
    <div>
      <DashboardHeader title="Welcome to CareerPath AI" description="Your personalized career development dashboard" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-6">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start Assessment */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Career Assessment</h3>
              <p className="text-muted-foreground">
                Take our AI-powered assessment to identify your strengths and career opportunities
              </p>
            </div>
            <Brain className="w-8 h-8 text-primary/40" />
          </div>
          <Link href="/dashboard/assessment">
            <Button className="mt-4">
              Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>

        {/* View Recommendations */}
        <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized course and career path recommendations based on your profile
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-accent/40" />
          </div>
          <Link href="/dashboard/recommendations">
            <Button variant="outline" className="mt-4 bg-transparent">
              View Recommendations <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No activity yet. Start your career journey by taking the assessment!</p>
        </div>
      </Card>
    </div>
  )
}
