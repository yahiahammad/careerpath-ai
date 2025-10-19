"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bookmark } from "lucide-react"

const careerPaths = [
  {
    title: "Full Stack Developer",
    matchScore: 85,
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    description: "Build end-to-end web applications with modern technologies",
  },
  {
    title: "Frontend Engineer",
    matchScore: 78,
    skills: ["React", "TypeScript", "CSS", "Web Performance"],
    description: "Specialize in creating beautiful and responsive user interfaces",
  },
  {
    title: "Backend Engineer",
    matchScore: 72,
    skills: ["Node.js", "PostgreSQL", "System Design", "APIs"],
    description: "Focus on server-side development and scalable systems",
  },
  {
    title: "DevOps Engineer",
    matchScore: 65,
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    description: "Manage infrastructure and deployment pipelines",
  },
]

export default function CareerPathsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Career Path Recommendations</h1>
              <p className="text-muted-foreground">Based on your resume and skills analysis</p>
            </div>

            <div className="space-y-4">
              {careerPaths.map((path, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{path.title}</h3>
                      <p className="text-muted-foreground mb-4">{path.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.skills.map((skill, j) => (
                          <Badge key={j} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold text-primary mb-1">{path.matchScore}%</div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="gap-2">
                      View Details <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Re-run Analysis
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
