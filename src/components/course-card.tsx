import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Star } from "lucide-react"

interface CourseCardProps {
  title: string
  provider: string
  duration: string
  level: string
  rating: number
  students: number
  description: string
  tags: string[]
}

export function CourseCard({ title, provider, duration, level, rating, students, description, tags }: CourseCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{provider}</p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-yellow-700">{rating}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {duration}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {students}
        </div>
        <div className="px-2 py-1 bg-muted rounded">{level}</div>
      </div>

      <Button className="w-full bg-transparent" variant="outline" size="sm">
        <BookOpen className="w-4 h-4 mr-2" />
        View Course
      </Button>
    </Card>
  )
}
