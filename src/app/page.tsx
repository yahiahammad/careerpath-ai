import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Brain, BarChart3, BookOpen, Briefcase, TrendingUp } from "lucide-react"

export default function Home() {
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              AI-Powered Career Guidance, Personalized for You.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Analyze your resume, discover your ideal career path, and close your skill gaps with intelligent
              recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 flex items-center justify-center min-h-96">
            <div className="text-center">
              <Brain className="w-24 h-24 text-primary/40 mx-auto mb-4" />
              <p className="text-muted-foreground">AI Analysis Visualization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Resume Analysis",
                desc: "AI-powered analysis of your resume to identify strengths and opportunities",
              },
              {
                icon: BarChart3,
                title: "Skill Gap Report",
                desc: "Detailed breakdown of skills you have and skills you need to develop",
              },
              {
                icon: BookOpen,
                title: "Course Recommendations",
                desc: "Personalized learning paths from top providers like Coursera and LinkedIn",
              },
              {
                icon: Briefcase,
                title: "Job Matching",
                desc: "Discover career paths that align with your profile and goals",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                desc: "Monitor your learning journey and celebrate milestones",
              },
              {
                icon: Brain,
                title: "Dashboard Tracking",
                desc: "Centralized hub for all your career development activities",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Career Changer",
                quote:
                  "CareerPath AI helped me transition into tech with confidence. The skill gap analysis was incredibly accurate.",
              },
              {
                name: "Marcus Johnson",
                role: "Recent Graduate",
                quote:
                  "The course recommendations saved me hours of research. I found exactly what I needed to land my first job.",
              },
              {
                name: "Elena Rodriguez",
                role: "Career Advancement",
                quote: "The personalized career paths showed me opportunities I never considered. Highly recommend!",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 bg-muted/50">
                <p className="text-foreground mb-4 leading-relaxed italic">"{testimonial.quote}"</p>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">CareerPath AI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Your AI-powered career companion</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Contact Us</p>
                <p className="text-sm text-muted-foreground">aicareerpath@gmail.com</p>
                <p className="text-sm text-muted-foreground">+20 1154668222</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <button type="button" className="hover:text-primary transition-colors text-left">
                    How it Works
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-primary transition-colors text-left">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground">Careers</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Cookies Policy</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 CareerPath AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
