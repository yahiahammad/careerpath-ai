import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Brain, BarChart3, BookOpen, Briefcase, TrendingUp } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">CareerPath AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">About CareerPath AI</h1>
            <p className="text-lg text-muted-foreground">
              Your intelligent companion for career growth and professional development
            </p>
          </div>

          {/* Mission Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CareerPath AI is designed to revolutionize how individuals navigate their career journeys. 
              We believe that everyone deserves access to personalized career guidance powered by artificial 
              intelligence, helping you make informed decisions about your professional future.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform combines advanced AI technology with comprehensive career data to provide you 
              with actionable insights, personalized recommendations, and a clear path forward in your 
              career development.
            </p>
          </Card>

          {/* What We Offer Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Resume Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered insights into your resume, identifying strengths and areas for improvement 
                  to help you stand out to employers.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Skill Gap Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Understand exactly what skills you have and what you need to develop to reach your 
                  career goals.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Course Recommendations</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive personalized learning recommendations from top educational platforms like 
                  Coursera and LinkedIn Learning.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Career Path Matching</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Discover career paths that align with your skills, interests, and professional aspirations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Progress Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor your learning journey, track your progress, and celebrate milestones as you 
                  advance in your career.
                </p>
              </div>
            </div>
          </Card>

          {/* How It Works Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Upload Your Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by uploading your resume. Our AI analyzes your experience, skills, and background.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Get Personalized Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed analysis of your profile, including skill gaps and career opportunities.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Follow Your Path</h3>
                  <p className="text-sm text-muted-foreground">
                    Get recommended courses, track your progress, and follow a clear path to your career goals.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Career Journey?</h2>
            <p className="text-muted-foreground mb-6">
              Join CareerPath AI today and take the first step towards achieving your professional goals.
            </p>
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

