"use client"

import { useState, useRef, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { MermaidRenderer, parseContentWithMermaid } from '@/components/mermaid-renderer'
import { ChatCourseList } from '@/components/chat-course-card'
import { sendMessage, ChatMessage, generateMessageId, formatMessagesForApi } from '@/lib/chat-service'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const SUGGESTED_PROMPTS = [
    "What should I learn next?",
    "Draw me a career path to become a CTO",
    "What skills am I missing for my target role?",
    "What alternative careers match my skills?",
]

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (messageText?: string) => {
        const text = messageText || input.trim()
        if (!text || isLoading) return

        // Add user message
        const userMessage: ChatMessage = {
            id: generateMessageId(),
            role: 'user',
            content: text,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Format all messages for API
            const allMessages = [...messages, userMessage]
            const apiMessages = formatMessagesForApi(allMessages)

            const response = await sendMessage(apiMessages)

            // Add assistant message with courses
            const assistantMessage: ChatMessage = {
                id: generateMessageId(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
                courses: response.courses
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error: any) {
            console.error('Chat error:', error)
            toast.error(error.message || 'Failed to send message')
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const renderMessageContent = (content: string) => {
        const segments = parseContentWithMermaid(content)

        return segments.map((segment, index) => {
            if (segment.type === 'mermaid') {
                return (
                    <MermaidRenderer
                        key={index}
                        chart={segment.content}
                        className="my-4"
                    />
                )
            }

            // Render text with basic markdown-like formatting
            return (
                <div
                    key={index}
                    className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: formatMarkdown(segment.content)
                    }}
                />
            )
        })
    }

    const formatMarkdown = (text: string): string => {
        return text
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Code inline
            .replace(/`([^`]+)`/g, '<code class="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs font-mono">$1</code>')
            // Headers
            .replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold mt-3 mb-1 text-foreground border-b border-border/50 pb-0.5">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-base font-bold mt-3 mb-1 text-foreground">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mt-3 mb-2 text-foreground">$1</h1>')
            // Numbered lists
            .replace(/^(\d+)\. (.*$)/gm, '<div class="flex gap-2 my-1"><span class="flex-shrink-0 w-5 h-5 bg-primary/15 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">$1</span><span class="flex-1">$2</span></div>')
            // Bullet lists
            .replace(/^- (.*$)/gm, '<div class="flex gap-1.5 my-1 items-start"><span class="flex-shrink-0 w-1 h-1 bg-primary rounded-full mt-1.5"></span><span class="flex-1">$1</span></div>')
            // Line breaks
            .replace(/\n\n/g, '</p><p class="mt-2">')
            .replace(/\n/g, '<br/>')
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <DashboardHeader
                title="AI Career Coach"
                description=""
            />

            <Card className="flex-1 flex flex-col mt-4 overflow-hidden min-h-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-in fade-in-0 duration-500">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl flex items-center justify-center mb-4 shadow-lg ring-1 ring-primary/10">
                                <Sparkles className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Welcome to Your AI Career Coach
                            </h3>
                            <p className="text-muted-foreground mb-5 max-w-md text-sm leading-relaxed">
                                I'm here to help you navigate your career journey. Ask me about learning paths,
                                skill gaps, or let me visualize your career trajectory.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                                {SUGGESTED_PROMPTS.map((prompt, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSend(prompt)}
                                        className="text-xs rounded-full px-3 py-1 h-auto hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
                                    >
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-2">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        } animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-primary/10">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-xl px-3 py-2.5 shadow-sm ${message.role === 'user'
                                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                                            : 'bg-card border border-border/50'
                                            }`}
                                    >
                                        {message.role === 'assistant'
                                            ? (
                                                <>
                                                    <div className="text-[13px] leading-relaxed">{renderMessageContent(message.content)}</div>
                                                    {message.courses && message.courses.length > 0 && (
                                                        <ChatCourseList courses={message.courses} />
                                                    )}
                                                </>
                                            )
                                            : <p className="whitespace-pre-wrap text-[13px]">{message.content}</p>
                                        }
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
                                            <User className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-primary/10">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-xl px-3 py-2.5 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t bg-background/80 backdrop-blur-sm p-4">
                    <div className="flex gap-3 items-end">
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your career path, skills, or learning journey..."
                            className="min-h-[48px] max-h-32 resize-none rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="h-12 w-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-2 text-center">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </div>
            </Card>
        </div>
    )
}
