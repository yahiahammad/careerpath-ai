"use client"

import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CheckCircle, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Question } from "../constants"
import { Dispatch, SetStateAction } from "react"

interface SkillEntry {
    name: string
    level: string
}

interface QuestionRendererProps {
    question: Question
    answers: Record<string, any>
    setAnswers: Dispatch<SetStateAction<Record<string, any>>>
    selectedSkills: Record<string, SkillEntry[]>
    setSelectedSkills: Dispatch<SetStateAction<Record<string, SkillEntry[]>>>
    searchQuery: string
    setSearchQuery: (query: string) => void
    searchResults: string[]
    isSearching: boolean
    searchOpen: boolean
    setSearchOpen: (open: boolean) => void
    onSearchJobTitles: (query: string) => void
    onSearchSkills: (query: string) => void
}

export function QuestionRenderer({
    question: q,
    answers,
    setAnswers,
    selectedSkills,
    setSelectedSkills,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchOpen,
    setSearchOpen,
    onSearchJobTitles,
    onSearchSkills
}: QuestionRendererProps) {

    switch (q.type) {
        case 'choice':
        case 'rating':
            return (
                <div className="space-y-3">
                    {q.options?.map((option) => (
                        <button
                            key={option}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: option }))}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${answers[q.id] === option
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-foreground hover:border-primary/50"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )

        case 'multi-choice':
            const currentSelected = (answers[q.id] as string[]) || []
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options?.map((option) => {
                        const isSelected = currentSelected.includes(option)
                        return (
                            <button
                                key={option}
                                onClick={() => {
                                    const newSelected = isSelected
                                        ? currentSelected.filter(i => i !== option)
                                        : [...currentSelected, option]
                                    setAnswers(prev => ({ ...prev, [q.id]: newSelected }))
                                }}
                                className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-card text-foreground hover:border-primary/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {isSelected && <CheckCircle className="w-4 h-4" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )

        case 'job-search':
            return (
                <div className="space-y-4">
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={q.placeholder}
                                    value={answers[q.id] || searchQuery}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        setSearchQuery(val)
                                        setAnswers(prev => ({ ...prev, [q.id]: val }))
                                        onSearchJobTitles(val)
                                        setSearchOpen(true)
                                    }}
                                    className="pl-9 h-12 text-lg"
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                            <div className="max-h-[200px] overflow-y-auto p-1">
                                {isSearching ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">No results found</div>
                                ) : (
                                    searchResults.map((job) => (
                                        <button
                                            key={job}
                                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                            onClick={() => {
                                                setAnswers(prev => ({ ...prev, [q.id]: job }))
                                                setSearchQuery("")
                                                setSearchOpen(false)
                                            }}
                                        >
                                            {job}
                                        </button>
                                    ))
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <p className="text-sm text-muted-foreground">
                        Select from the list or type your own.
                    </p>
                </div>
            )

        case 'skill-search':
            const currentSkills = selectedSkills[q.id] || []
            return (
                <div className="space-y-4">
                    {/* Selected Skills Tags */}
                    <div className="flex flex-col gap-3 min-h-[40px]">
                        {currentSkills.map((skillObj) => (
                            <div key={skillObj.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                <div className="font-medium">{skillObj.name}</div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={skillObj.level}
                                        onValueChange={(val) => {
                                            setSelectedSkills(prev => ({
                                                ...prev,
                                                [q.id]: prev[q.id].map(s => s.name === skillObj.name ? { ...s, level: val } : s)
                                            }))
                                        }}
                                    >
                                        <SelectTrigger className="w-[130px] h-8 text-xs">
                                            <SelectValue placeholder="Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                            <SelectItem value="Expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <button
                                        onClick={() => setSelectedSkills(prev => ({
                                            ...prev,
                                            [q.id]: prev[q.id].filter(s => s.name !== skillObj.name)
                                        }))}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={q.placeholder}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        onSearchSkills(e.target.value)
                                        setSearchOpen(true)
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                            <div className="max-h-[200px] overflow-y-auto p-1">
                                {searchResults.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">No results found</div>
                                ) : (
                                    searchResults.map((skill) => (
                                        <button
                                            key={skill}
                                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                            onClick={() => {
                                                if (!currentSkills.some(s => s.name === skill)) {
                                                    setSelectedSkills(prev => ({
                                                        ...prev,
                                                        [q.id]: [...prev[q.id], { name: skill, level: "Intermediate" }]
                                                    }))
                                                }
                                                setSearchQuery("")
                                                setSearchOpen(false)
                                            }}
                                        >
                                            {skill}
                                        </button>
                                    ))
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            )

        default:
            return null
    }
}
