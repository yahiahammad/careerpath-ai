import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, CheckCircle2, Play } from "lucide-react"

interface EnrolledCourseCardProps {
  title: string
  provider: string
  progress: number
  completedLessons: number
  totalLessons: number
  estimatedTimeLeft: string
  status: "in-progress" | "completed" | "not-started"
}

export function EnrolledCourseCard({
  title,
  provider,
  progress,
  completedLessons,
  totalLessons,
  estimatedTimeLeft,
  status,
}: EnrolledCourseCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{provider}</p>
        </div>
        {status === "completed" && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Completed</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {completedLessons} of {totalLessons} lessons
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {estimatedTimeLeft} left
        </div>
      </div>

      <Button className="w-full" variant={status === "completed" ? "outline" : "default"}>
        {status === "completed" ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Review Course
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Continue Learning
          </>
        )}
      </Button>
    </Card>
  )
}
