import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, TrendingUp, ArrowRight } from "lucide-react"

interface CareerPathCardProps {
  title: string
  description: string
  currentRole: string
  targetRole: string
  skillsNeeded: string[]
  timeframe: string
  matchScore: number
}

export function CareerPathCard({
  title,
  description,
  currentRole,
  targetRole,
  skillsNeeded,
  timeframe,
  matchScore,
}: CareerPathCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
          <span className="text-lg font-bold text-green-600">{matchScore}%</span>
        </div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Current Role</p>
            <p className="text-sm font-medium text-foreground">{currentRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Target Role</p>
            <p className="text-sm font-medium text-foreground">{targetRole}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-foreground mb-2">Skills to Develop</p>
        <div className="flex flex-wrap gap-2">
          {skillsNeeded.map((skill) => (
            <span key={skill} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <span className="text-sm text-muted-foreground">Estimated timeframe: {timeframe}</span>
      </div>

      <Button className="w-full">
        Explore Path <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  )
}
