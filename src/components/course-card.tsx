import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Star } from "lucide-react"

interface CourseCardProps {
  title: string
  provider: string
  duration: string | number
  level: string
  rating: number
  students: number
  description: string
  tags: string[]
  url?: string
}

export function CourseCard({ title, provider, duration, level, rating, students, description, tags, url }: CourseCardProps) {
  // Format students count (e.g. 1200 -> 1.2k)
  const formatCount = (num: number) => {
    if (!num) return "0"
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "k"
    return num.toString()
  }

  // Format duration
  const displayDuration = typeof duration === 'number' ? `${Math.round(duration)} hours` : duration

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 mr-2">
          <h3 className="font-bold text-foreground mb-1 line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{provider}</p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded shrink-0">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-yellow-700">{rating ? rating.toFixed(1) : "N/A"}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3 flex-grow">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-muted-foreground px-1 py-1">+{tags.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {displayDuration}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {formatCount(students)}
        </div>
        <div className="px-2 py-1 bg-muted rounded capitalize">{level}</div>
      </div>

      <Button className="w-full bg-transparent" variant="outline" size="sm" asChild>
        <a href={url || "#"} target="_blank" rel="noopener noreferrer">
          <BookOpen className="w-4 h-4 mr-2" />
          View Course
        </a>
      </Button>
    </Card>
  )
}
