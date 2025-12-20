"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { BarChart3, BookOpen, TrendingUp, Brain, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { SkillsManager } from "@/components/skills-manager"

export default function DashboardPage() {
  const [assessmentStatus, setAssessmentStatus] = useState("Not Started")
  const [skillCount, setSkillCount] = useState(0)
  const [careerPath, setCareerPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Check Assessment Status
      const { data: assessmentData } = await supabase
        .from('career_assessments')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (assessmentData && assessmentData.length > 0) {
        setAssessmentStatus("Completed")
      }

      // 2. Get Skill Count & List
      try {
        const { count, data: skillsData } = await supabase
          .from('user_skills')
          .select('*, skill:skills(name)', { count: 'exact' })
          .eq('user_id', user.id)
          .order('last_updated', { ascending: false })
          .limit(5)

        if (count !== null) setSkillCount(count)
      } catch (e) {
        console.error("Error fetching skills:", e)
      }

      // 3. Get Career Profile for Path
      const { data: profile } = await supabase
        .from('career_profiles')
        .select('expected_careerpath')
        .eq('user_id', user.id)
        .single()

      if (profile) setCareerPath(profile.expected_careerpath)

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const stats = [
    {
      label: "Assessment Status",
      value: isLoading ? "..." : assessmentStatus,
      icon: Brain,
      color: assessmentStatus === "Completed" ? "bg-green-50" : "bg-blue-50",
      textColor: assessmentStatus === "Completed" ? "text-green-600" : "text-blue-600",
    },
    {
      label: "Skills Identified",
      value: isLoading ? "..." : skillCount.toString(),
      icon: BarChart3,
      color: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Target Path",
      value: isLoading ? "..." : (careerPath || "Not Set"),
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
              {stat.value === "..." ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-foreground truncate">{stat.value}</p>
              )}
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
              <div className="text-muted-foreground min-h-[48px]">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                ) : (
                  <p>
                    {assessmentStatus === "Completed"
                      ? "Retake the assessment to update your skill profile."
                      : "Take our AI-powered assessment to identify your strengths and career opportunities"}
                  </p>
                )}
              </div>
            </div>
            <Brain className="w-8 h-8 text-primary/40" />
          </div>
          <Link href="/dashboard/assessment">
            {isLoading ? (
              <Skeleton className="h-10 w-40 mt-4" />
            ) : (
              <Button className="mt-4">
                {assessmentStatus === "Completed" ? "Retake Assessment" : "Start Assessment"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
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
      <div className="mt-8">
        <SkillsManager />
      </div>
    </div>
  )
}
