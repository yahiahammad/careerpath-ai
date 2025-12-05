"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Camera } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    company: "",
    bio: "",
    education: "",
    skills: "",
    linkedin: "",
    website: "",
  })

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        
        if (currentUser) {
          setUser(currentUser)
          setProfileData({
            fullName: currentUser.user_metadata?.full_name || "",
            email: currentUser.email || "",
            phone: currentUser.user_metadata?.phone || "",
            location: currentUser.user_metadata?.location || "",
            jobTitle: currentUser.user_metadata?.job_title || "",
            company: currentUser.user_metadata?.company || "",
            bio: currentUser.user_metadata?.bio || "",
            education: currentUser.user_metadata?.education || "",
            skills: currentUser.user_metadata?.skills || "",
            linkedin: currentUser.user_metadata?.linkedin || "",
            website: currentUser.user_metadata?.website || "",
          })
        }
      } catch (err) {
        setError("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess(false)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone,
          location: profileData.location,
          job_title: profileData.jobTitle,
          company: profileData.company,
          bio: profileData.bio,
          education: profileData.education,
          skills: profileData.skills,
          linkedin: profileData.linkedin,
          website: profileData.website,
        },
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="Profile" description="Edit your profile information" />
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title="Profile" description="Edit your profile information" />

      <div className="max-w-4xl space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            Profile updated successfully!
          </div>
        )}

        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {profileData.fullName || "Your Name"}
              </h2>
              <p className="text-muted-foreground">{profileData.jobTitle || "Your Job Title"}</p>
              {profileData.company && (
                <p className="text-sm text-muted-foreground mt-1">{profileData.company}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleChange}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={profileData.phone}
                onChange={handleChange}
                className="mt-1"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleChange}
                className="mt-1"
                placeholder="City, Country"
              />
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={profileData.jobTitle}
                onChange={handleChange}
                className="mt-1"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={profileData.company}
                onChange={handleChange}
                className="mt-1"
                placeholder="Company Name"
              />
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Bio</h3>
          <Textarea
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
            className="resize-none"
          />
        </Card>

        {/* Education & Skills */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education & Skills
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                name="education"
                value={profileData.education}
                onChange={handleChange}
                className="mt-1"
                placeholder="Bachelor's in Computer Science, University Name"
              />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={profileData.skills}
                onChange={handleChange}
                className="mt-1"
                placeholder="JavaScript, React, Node.js, Python"
              />
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Social Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                value={profileData.linkedin}
                onChange={handleChange}
                className="mt-1"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={profileData.website}
                onChange={handleChange}
                className="mt-1"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

