"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CareerPathCard } from "@/components/career-path-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Briefcase, Filter, RefreshCw } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

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
]

export default function RecommendationsPage() {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userData, setUserData] = useState<{ currentPosition: string, desiredCareerPath: string } | null>(null)

  const ITEMS_PER_PAGE = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchRecommendations()
  }, [page])

  async function fetchRecommendations() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch User Profile for context header
      const { data: profile } = await supabase
        .from('career_profiles')
        .select('current_position, expected_careerpath')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setUserData({
          currentPosition: profile.current_position || "Unknown",
          desiredCareerPath: profile.expected_careerpath || "Unknown"
        })
      }

      // 2. Fetch Saved Recommendations from Database (Pagination)
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      // We need to join: user_courses -> courses -> course_skills -> skills
      const { data, error, count } = await supabase
        .from('user_courses')
        .select(`
            *,
            course:courses (
                id, title, provider, description, url, 
                difficulty_level, duration_hours, rating, user_count,
                course_skills (
                    skill:skills (name)
                )
            )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'recommended')
        .range(from, to)

      if (error) throw error

      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE))
      }

      // Map the nested response to our flat structure
      const mappedCourses = data?.map((item: any) => {
        const c = item.course
        // Flatten skills
        const skills = c.course_skills?.map((cs: any) => cs.skill.name) || []

        return {
          id: c.id,
          title: c.title,
          provider: c.provider,
          description: c.description,
          url: c.url,
          difficulty_level: c.difficulty_level,
          duration_hours: c.duration_hours,
          rating: c.rating,
          user_count: c.user_count,
          skills: skills
        }
      }) || []

      setRecommendations(mappedCourses)

    } catch (error) {
      console.error(error)
      toast.error("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <DashboardHeader
        title="Recommendations"
        description="Personalized courses and career paths based on your assessment"
      />

      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recommended Courses</h2>
            <p className="text-muted-foreground mt-1">
              {userData ? `Based on moving from ${userData.currentPosition} to ${userData.desiredCareerPath}` : "Curated learning paths"}
            </p>
          </div>

        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 h-[250px] flex flex-col justify-between">
                <div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  provider={course.provider || "Unknown Provider"}
                  duration={course.duration_hours || "Self-paced"}
                  level={course.difficulty_level || "All Levels"}
                  rating={course.rating || 0}
                  students={course.user_count || 0}
                  description={course.description}
                  tags={course.skills || []}
                  url={course.url}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No recommendations found. Try updating your profile or assessment.
          </div>
        )}
      </div>
    </div>
  )
}
