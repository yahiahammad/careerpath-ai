"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, ChevronsUpDown, Check, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Skill {
    id: string
    name: string
}

interface UserSkill {
    skill_id: string
    proficiency_level: string
    skill: {
        name: string
    }
}

const PROFICIENCY_LEVELS = ["Novice", "Intermediate", "Expert", "Professional"]

export function SkillsManager() {
    const [userSkills, setUserSkills] = useState<UserSkill[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Skill[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const supabase = createSupabaseClient()

    useEffect(() => {
        fetchUserSkills()
    }, [])

    const fetchUserSkills = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('user_skills')
                .select('*, skill:skills(name)')
                .eq('user_id', user.id)
                .order('last_updated', { ascending: false })

            if (error) throw error
            setUserSkills(data || [])
        } catch (error) {
            console.error('Error fetching skills:', error)
            toast.error("Failed to load skills")
        } finally {
            setLoading(false)
        }
    }

    const searchSkills = async (query: string) => {
        if (!query || query.length < 1) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('id, name')
                .ilike('name', `${query}%`)
                .limit(10)

            if (error) throw error
            setSearchResults(data || [])
        } catch (error) {
            console.error('Error searching skills:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const addSkill = async (skillName: string, skillId?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in")
                return
            }

            const trimmedName = skillName.trim()
            if (!trimmedName) return

            // Check if already added (client-side check)
            if (userSkills.some(us => us.skill.name.toLowerCase() === trimmedName.toLowerCase())) {
                toast.error(`You already have ${trimmedName} in your list`)
                return
            }

            let targetSkillId = skillId

            // If skill doesn't exist (no ID provided from search), try to find or create it
            if (!targetSkillId) {
                // 1. Try to find it first (exact match, case insensitive)
                const { data: existingSkill } = await supabase
                    .from('skills')
                    .select('id')
                    .ilike('name', trimmedName)
                    .single()

                if (existingSkill) {
                    targetSkillId = existingSkill.id
                } else {
                    // 2. Create it
                    const { data: newSkill, error: createError } = await supabase
                        .from('skills')
                        .insert({ name: trimmedName })
                        .select()
                        .single()

                    if (createError) {
                        // If unique constraint failed, try finding it one last time
                        if (createError.code === '23505') { // Unique violation
                            const { data: retrySkill } = await supabase
                                .from('skills')
                                .select('id')
                                .ilike('name', trimmedName)
                                .single()
                            if (retrySkill) targetSkillId = retrySkill.id
                        } else {
                            throw createError
                        }
                    } else {
                        targetSkillId = newSkill.id
                    }
                }
            }

            if (!targetSkillId) {
                throw new Error("Could not find or create skill")
            }

            // Add to user_skills using upsert to prevent unique violations
            // assuming (user_id, skill_id) is unique
            const { error: linkError } = await supabase
                .from('user_skills')
                .upsert({
                    user_id: user.id,
                    skill_id: targetSkillId,
                    proficiency_level: "Novice", // Default
                    last_updated: new Date().toISOString()
                }, { onConflict: 'user_id,skill_id' })

            if (linkError) throw linkError

            toast.success(`Added ${trimmedName}`)
            setSearchQuery("")
            setOpen(false)
            fetchUserSkills()
        } catch (error: any) {
            console.error('Error adding skill:', error)
            toast.error(error.message || "Failed to add skill")
        }
    }

    const updateProficiency = async (skillId: string, newLevel: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Optimistic update
            setUserSkills(prev => prev.map(us =>
                us.skill_id === skillId ? { ...us, proficiency_level: newLevel } : us
            ))

            const { error } = await supabase
                .from('user_skills')
                .update({ proficiency_level: newLevel, last_updated: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('skill_id', skillId)

            if (error) {
                fetchUserSkills() // Revert on error
                throw error
            }
            toast.success("Proficiency updated")
        } catch (error) {
            console.error('Error updating proficiency:', error)
            toast.error("Failed to update proficiency")
        }
    }

    const removeSkill = async (skillId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Optimistic update
            setUserSkills(prev => prev.filter(us => us.skill_id !== skillId))

            const { error } = await supabase
                .from('user_skills')
                .delete()
                .eq('user_id', user.id)
                .eq('skill_id', skillId)

            if (error) {
                fetchUserSkills() // Revert on error
                throw error
            }
            toast.success("Skill removed")
        } catch (error) {
            console.error('Error removing skill:', error)
            toast.error("Failed to remove skill")
        }
    }

    if (loading) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Identified Skills</h3>
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Identified Skills</h3>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Skill
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[250px]" align="end">
                        <Command>
                            <CommandInput
                                placeholder="Search skills..."
                                value={searchQuery}
                                onValueChange={(val) => {
                                    setSearchQuery(val)
                                    searchSkills(val)
                                }}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {searchQuery.length > 0 && (
                                        <button
                                            className="w-full p-2 text-sm text-center text-primary hover:underline"
                                            onClick={() => addSkill(searchQuery)}
                                        >
                                            Create "{searchQuery}"
                                        </button>
                                    )}
                                </CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    {searchResults.map((skill) => (
                                        <CommandItem
                                            key={skill.id}
                                            onSelect={() => addSkill(skill.name, skill.id)}
                                        >
                                            {skill.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {userSkills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No skills identified yet. Add some skills to track your progress!
                </div>
            ) : (
                <div className="space-y-3">
                    {userSkills.map((us) => (
                        <div key={us.skill_id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                            <span className="font-medium">{us.skill.name}</span>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={us.proficiency_level}
                                    onValueChange={(val) => updateProficiency(us.skill_id, val)}
                                >
                                    <SelectTrigger className="h-8 w-[130px] text-xs bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROFICIENCY_LEVELS.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeSkill(us.skill_id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
