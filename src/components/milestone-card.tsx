import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

interface MilestoneCardProps {
  title: string
  description: string
  completed: boolean
  completedDate?: string
}

export function MilestoneCard({ title, description, completed, completedDate }: MilestoneCardProps) {
  return (
    <Card className={`p-4 ${completed ? "bg-green-50/50 border-green-200" : ""}`}>
      <div className="flex items-start gap-3">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {completed && completedDate && <p className="text-xs text-green-600 mt-2">Completed on {completedDate}</p>}
        </div>
      </div>
    </Card>
  )
}
