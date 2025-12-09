import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface QuestionOption {
  id: string
  text: string
}

interface QuizQuestionProps {
  question: string
  options?: QuestionOption[]
  selectedOption: string | null
  onSelect: (optionId: string) => void
  onNext: () => void
  isLast: boolean
  type?: 'choice' | 'text'
  multiSelect?: boolean
  onSearch?: (query: string) => Promise<string[]>
}

export function QuizQuestion({
  question,
  options = [],
  selectedOption,
  onSelect,
  onNext,
  isLast,
  type = 'choice',
  multiSelect = false,
  onSearch
}: QuizQuestionProps) {
  const [inputValue, setInputValue] = useState(type === 'text' && !multiSelect ? (selectedOption || "") : "")
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    type === 'text' && multiSelect && selectedOption ? selectedOption.split(',') : []
  )
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Ref to keep track of latest inputValue for the timeout closure
  const inputValueRef = useRef(inputValue)

  useEffect(() => {
    inputValueRef.current = inputValue
  }, [inputValue])

  useEffect(() => {
    if (type === 'text') {
      if (multiSelect && selectedOption) {
        setSelectedSkills(selectedOption.split(',').filter(Boolean))
      } else if (!multiSelect && selectedOption) {
        setInputValue(selectedOption)
      }
    }
  }, [type, selectedOption, multiSelect])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.length > 0 && onSearch) {
      setIsSearching(true)
      try {
        const results = await onSearch(value)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error("Search failed", error)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    if (multiSelect) {
      if (!selectedSkills.includes(suggestion)) {
        const newSkills = [...selectedSkills, suggestion]
        setSelectedSkills(newSkills)
        onSelect(newSkills.join(','))
      }
      setInputValue("")
      setSuggestions([])
    } else {
      setInputValue(suggestion)
      onSelect(suggestion)
    }
    setShowSuggestions(false)
  }

  const handleManualInput = () => {
    if (inputValueRef.current.trim()) {
      const val = inputValueRef.current.trim()
      if (multiSelect) {
        if (!selectedSkills.includes(val)) {
          const newSkills = [...selectedSkills, val]
          setSelectedSkills(newSkills)
          onSelect(newSkills.join(','))
        }
        setInputValue("")
      } else {
        onSelect(val)
      }
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove)
    setSelectedSkills(newSkills)
    onSelect(newSkills.join(','))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{question}</h2>

      {type === 'choice' ? (
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedOption === option.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
                }`}
            >
              <span className="font-medium text-foreground">{option.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4" ref={wrapperRef}>
          {multiSelect && selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleManualInput()
                }
              }}
              onBlur={() => setTimeout(() => handleManualInput(), 200)}
              placeholder={multiSelect && selectedSkills.length > 0 ? "Add another skill..." : "Type to search skills (e.g. JavaScript, Design...)"}
              className="pl-9"
            />

            {showSuggestions && inputValue.length > 0 && (
              <div className="absolute z-[100] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No results found
                  </div>
                )}
                {/* Debug Info inside dropdown if needed, or remove */}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {multiSelect ? "Type to add multiple skills." : "Type to search for your top skill."} Select from suggestions or type your own.
          </p>
        </div>
      )}

      <Button onClick={onNext} disabled={!selectedOption} className="w-full" size="lg">
        {isLast ? "Complete Assessment" : "Next Question"}
      </Button>
    </div>
  )
}
