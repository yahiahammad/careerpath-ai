"use client"
import { Button } from "@/components/ui/button"

interface QuestionOption {
  id: string
  text: string
}

interface QuizQuestionProps {
  question: string
  options: QuestionOption[]
  selectedOption: string | null
  onSelect: (optionId: string) => void
  onNext: () => void
  isLast: boolean
}

export function QuizQuestion({ question, options, selectedOption, onSelect, onNext, isLast }: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{question}</h2>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedOption === option.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            }`}
          >
            <span className="font-medium text-foreground">{option.text}</span>
          </button>
        ))}
      </div>

      <Button onClick={onNext} disabled={!selectedOption} className="w-full" size="lg">
        {isLast ? "Complete Assessment" : "Next Question"}
      </Button>
    </div>
  )
}
