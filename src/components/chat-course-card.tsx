"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Star, ExternalLink } from "lucide-react"

export interface ChatCourse {
    id: string
    title: string
    provider: string
    url?: string
    duration_hours?: number
    rating?: number
    user_count?: number
    difficulty_level?: string
    skills?: string[]
}

interface ChatCourseCardProps {
    course: ChatCourse
}

export function ChatCourseCard({ course }: ChatCourseCardProps) {
    const formatCount = (num: number) => {
        if (!num) return "0"
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
        if (num >= 1000) return (num / 1000).toFixed(1) + "k"
        return num.toString()
    }

    const displayDuration = course.duration_hours
        ? `${Math.round(course.duration_hours)}h`
        : "Self-paced"

    return (
        <Card className="p-3 hover:shadow-md transition-all duration-200 border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">
                        {course.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                        {course.provider}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                        {course.rating && (
                            <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {course.rating.toFixed(1)}
                            </span>
                        )}
                        <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {displayDuration}
                        </span>
                        {course.user_count && (
                            <span className="flex items-center gap-0.5">
                                <Users className="w-3 h-3" />
                                {formatCount(course.user_count)}
                            </span>
                        )}
                        {course.difficulty_level && (
                            <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] capitalize">
                                {course.difficulty_level}
                            </span>
                        )}
                    </div>

                    {/* Skills tags */}
                    {course.skills && course.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {course.skills.slice(0, 3).map((skill) => (
                                <span
                                    key={skill}
                                    className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* View button */}
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    asChild
                >
                    <a href={course.url || "#"} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </div>
        </Card>
    )
}

interface ChatCourseListProps {
    courses: ChatCourse[]
}

export function ChatCourseList({ courses }: ChatCourseListProps) {
    if (!courses || courses.length === 0) return null

    return (
        <div className="space-y-2 mt-3">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                Recommended Courses
            </p>
            {courses.map((course) => (
                <ChatCourseCard key={course.id} course={course} />
            ))}
        </div>
    )
}
