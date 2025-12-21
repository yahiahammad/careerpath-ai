"use client"

import { useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { PersonalInfo } from "../constants"

interface SkillEntry {
    name: string;
    level: string;
}

export function useAssessmentLogic() {
    const supabase = createSupabaseClient()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [searchResults, setSearchResults] = useState<string[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // DB Fetchers
    const searchJobTitles = async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        console.log("SEARCHING FOR:", query)

        try {
            const { data, error } = await supabase
                .from('job_titles')
                .select('"Job Title"')
                .ilike('"Job Title"', `%${query}%`)
                .limit(10)

            console.log("SUPABASE RESULT:", { data, error })

            if (error) {
                console.error("Supabase Error searching jobs:", JSON.stringify(error, null, 2))
                // Fallback for demo if DB is empty or connection fails
                setSearchResults([query, "Software Engineer", "Data Scientist", "Product Manager"].filter(j => j.toLowerCase().includes(query.toLowerCase())))
            } else {
                const jobs = data?.map((item: any) => item['Job Title']) || []
                console.log("MAPPED JOBS:", jobs)
                setSearchResults(jobs)
            }
        } catch (e: any) {
            console.error("Exception searching jobs:", e.message || e)
        } finally {
            setIsSearching(false)
        }
    }

    const searchSkills = async (query: string) => {
        if (!query || query.length < 1) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        try {
            // Basic mock fallback + DB search attempt
            const { data, error } = await supabase
                .from('skills')
                .select('name')
                .ilike('name', `${query}%`)
                .limit(10)

            if (error || !data || data.length === 0) {
                // Fallback or custom add
                setSearchResults([query])
            } else {
                setSearchResults(data.map((d: any) => d.name))
            }
        } catch (e) {
            setSearchResults([query])
        }
        setIsSearching(false)
    }

    // Handlers
    const handleFileUpload = async (
        file: File,
        setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>,
        setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>,
        selectedSkills: Record<string, SkillEntry[]>,
        setSelectedSkills: React.Dispatch<React.SetStateAction<Record<string, SkillEntry[]>>>,
        setStarted: (started: boolean) => void
    ) => {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || "Failed to parse resume")
            }

            const data = await response.json()
            console.log("Parsed Resume Data:", data)

            // Map parsed data to state
            if (data.personalInfo) {
                setPersonalInfo(prev => ({
                    ...prev,
                    currentJobTitle: data.personalInfo.currentJobTitle || prev.currentJobTitle,
                    yearsExperience: data.personalInfo.yearsExperience || prev.yearsExperience,
                    educationLevel: data.personalInfo.educationLevel || prev.educationLevel,
                }))

                setAnswers(prev => ({
                    ...prev,
                    q_current_job: data.personalInfo.currentJobTitle,
                    q_experience: data.personalInfo.yearsExperience,
                    q_education: data.personalInfo.educationLevel,
                    q_target_path: data.suggestedPath
                }))
            }

            if (data.technicalSkills) {
                const newSkills: Record<string, SkillEntry[]> = { ...selectedSkills }

                // Helper to map and merge skills
                const mergeSkills = (categoryKey: string, source: any[]) => {
                    if (!source || !Array.isArray(source)) return;
                    const mapped = source.map((s: any) => ({
                        name: s.name,
                        level: s.level || "Intermediate"
                    }));
                    newSkills[categoryKey] = [...(newSkills[categoryKey] || []), ...mapped];
                }

                if (Array.isArray(data.technicalSkills)) {
                    // Direct mapping for flat list
                    const mapped = data.technicalSkills.map((s: any) => ({
                        name: s.name,
                        level: s.level || "Intermediate"
                    }));
                    const newSkills: Record<string, SkillEntry[]> = { ...selectedSkills };
                    newSkills['q_technical_skills'] = mapped;
                    setSelectedSkills(newSkills);
                } else {
                    console.warn("Received structured data instead of array for skills");
                    const flattened = [
                        ...(data.technicalSkills?.languages || []),
                        ...(data.technicalSkills?.frameworks || []),
                        ...(data.technicalSkills?.tools || [])
                    ];
                    const mapped = flattened.map((s: any) => ({
                        name: s.name,
                        level: s.level || "Intermediate"
                    }));
                    const newSkills: Record<string, SkillEntry[]> = { ...selectedSkills };
                    newSkills['q_technical_skills'] = mapped;
                    setSelectedSkills(newSkills);
                }
            }

            toast.success("Resume processed! We've pre-filled your assessment.")
            setStarted(true) // Auto-start

        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error(error.message)
        } finally {
            setIsUploading(false)
        }
    }

    const submitAssessment = async (
        answers: Record<string, any>,
        personalInfo: PersonalInfo,
        selectedSkills: Record<string, SkillEntry[]>,
        setCompleted: (completed: boolean) => void
    ) => {
        setIsSubmitting(true)
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to save results.")
                setIsSubmitting(false)
                return
            }

            // 2. Consolidate Data
            const fullProfile = {
                current_position: answers['q_current_job'] || personalInfo.currentJobTitle,
                education_level: answers['q_education'],
                expected_careerpath_id: null as string | null,
                expected_careerpath: answers['q_target_path'] || personalInfo.targetCareerPath,
                updated_at: new Date().toISOString()
            }

            const allSkills = [
                ...(selectedSkills['q_technical_skills'] || [])
            ]

            // 3. DB Operations

            // Update Career Profile
            const { error: profileError } = await supabase
                .from('career_profiles')
                .upsert({
                    user_id: user.id,
                    current_position: fullProfile.current_position,
                    education_level: fullProfile.education_level,
                    expected_careerpath: fullProfile.expected_careerpath,
                    expected_careerpath_id: null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })

            if (profileError) throw new Error("Failed to update profile: " + profileError.message)

            // Insert Skills (Best Effort)
            const uniqueSkillNames = Array.from(new Set(allSkills.map(s => s.name)))
            console.log("Unique Skill Names to Save:", uniqueSkillNames)

            // RESET SKILLS FOR RETAKE: Delete all existing skills for this user
            const { error: deleteError } = await supabase
                .from('user_skills')
                .delete()
                .eq('user_id', user.id)

            if (deleteError) {
                console.error("Error clearing old skills:", deleteError)
            }

            if (uniqueSkillNames.length > 0) {
                const { data: allDbSkills, error: fetchSkillsError } = await supabase
                    .from('skills')
                    .select('id, name')

                if (fetchSkillsError) {
                    console.error("Error fetching skill IDs:", fetchSkillsError)
                } else if (allDbSkills && allDbSkills.length > 0) {

                    // Create a lookup map (lowercase -> skill record)
                    const skillMap = new Map<string, { id: any, name: string }>()
                    allDbSkills.forEach(s => {
                        if (s.name) skillMap.set(s.name.toLowerCase(), s)
                    })

                    // Identify and Create Missing Skills
                    const missingSkills = uniqueSkillNames.filter(name => !skillMap.has(name.toLowerCase()))

                    if (missingSkills.length > 0) {
                        console.log("Found missing skills, creating:", missingSkills)

                        // Validate: Trim and limit length
                        const skillsToInsert = missingSkills
                            .map(name => ({ name: name.trim() }))
                            .filter(s => s.name.length > 0 && s.name.length <= 50)

                        if (skillsToInsert.length > 0) {
                            const { data: newSkills, error: createError } = await supabase
                                .from('skills')
                                .insert(skillsToInsert)
                                .select('id, name')

                            if (createError) {
                                console.error("Error creating new skills:", createError)
                                toast.error("Some new skills could not be saved to the database.")
                            } else if (newSkills) {
                                // Add new skills to our map so they can be linked
                                newSkills.forEach(s => {
                                    if (s.name) skillMap.set(s.name.toLowerCase(), s)
                                })
                                console.log("Successfully created and mapped new skills:", newSkills.length)
                            }
                        }
                    }

                    // Map names to IDs with Level (Case Insensitive)
                    const startStats = uniqueSkillNames.map(userSkillName => {
                        const lowerName = userSkillName.toLowerCase()
                        const dbSkill = skillMap.get(lowerName)

                        if (!dbSkill) {
                            console.warn(`Skipping skill "${userSkillName}" - Failed to find or create in DB`)
                            return null
                        }

                        // Find the original user selection object to get the level
                        const userSelection = allSkills.find(s => s.name.toLowerCase() === lowerName)

                        return {
                            user_id: user.id,
                            skill_id: dbSkill.id,
                            proficiency_level: userSelection?.level || "Intermediate",
                            last_updated: new Date().toISOString()
                        }
                    }).filter(item => item !== null) // Remove nulls

                    console.log("PAYLOAD for user_skills:", startStats)

                    const { error: skillInsertError } = await supabase
                        .from('user_skills')
                        .upsert(startStats)

                    if (skillInsertError) console.error("Error inserting user_skills:", JSON.stringify(skillInsertError, null, 2))
                } else {
                    console.log("No matching skills found in 'skills' table for:", uniqueSkillNames)
                }
            }

            // Save Assessment Record
            const { error: assessmentError } = await supabase
                .from('career_assessments')
                .upsert({
                    user_id: user.id,
                    responses: {
                        ...answers,
                        personalInfo,
                        selectedSkills,
                        timestamp: new Date().toISOString()
                    },
                    ai_summary: "Pending Analysis"
                }, { onConflict: 'user_id' })

            if (assessmentError) throw new Error("Failed to save assessment: " + assessmentError.message)

            // Trigger Recommendation Generation (Background)
            fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPosition: fullProfile.current_position,
                    desiredCareerPath: fullProfile.expected_careerpath,
                    skills: uniqueSkillNames
                })
            }).then(res => {
                if (!res.ok) console.error("Failed to trigger background recommendation generation")
                else console.log("Recommendation generation triggered successfully")
            }).catch(err => console.error("Error triggering recommendations:", err))

            setCompleted(true)
            toast.success("Assessment saved and recommendations updated!")

        } catch (error: any) {
            console.error("Submission error:", error)
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isSubmitting,
        isUploading,
        searchResults,
        isSearching,
        setSearchResults,
        searchJobTitles,
        searchSkills,
        handleFileUpload,
        submitAssessment
    }
}
