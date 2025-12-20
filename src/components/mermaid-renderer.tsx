"use client"

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidRendererProps {
    chart: string
    className?: string
}

// Initialize mermaid with dark theme support
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: true,
    },
})

// Helper to auto-fix common Mermaid syntax errors (like missing quotes around labels)
function cleanMermaidCode(code: string): string {
    let cleaned = code

    // Fix 1: Wrap unquoted [label] content in quotes
    // Matches: id[Label text] -> id["Label text"]
    // Avoids: id["Label"] (already quoted)
    cleaned = cleaned.replace(/([a-zA-Z0-9_]+)\s*\[\s*([^"\[\]\n]+?)\s*\]/g, '$1["$2"]')

    // Fix 2: Wrap unquoted (label) content in quotes (Round edges)
    // Matches: id(Label text) -> id("Label text")
    cleaned = cleaned.replace(/([a-zA-Z0-9_]+)\s*\(\s*([^"()\n]+?)\s*\)/g, '$1("$2")')

    return cleaned
}

export function MermaidRenderer({ chart, className = '' }: MermaidRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !containerRef.current) return

            // 1. Try rendering the original chart first (best fidelity)
            // 2. If that fails, try rendering the cleaned version

            const generateSvg = async (code: string, id: string) => {
                const { svg: renderedSvg } = await mermaid.render(id, code)
                return renderedSvg
            }

            const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            try {
                // Try original first
                const renderedSvg = await generateSvg(chart, id)
                setSvg(renderedSvg)
                setError(null)
            } catch (err: any) {
                console.warn('Initial Mermaid render failed, attempting auto-fix...', err)

                try {
                    // Try with sanitized code
                    const cleanedChart = cleanMermaidCode(chart)
                    // We need a new ID for the retry or mermaid cache might conflict
                    const retryId = `${id}-retry`
                    const renderedSvg = await generateSvg(cleanedChart, retryId)
                    setSvg(renderedSvg)
                    setError(null)
                } catch (retryErr: any) {
                    console.error('Mermaid retry failed:', retryErr)
                    // If both fail, show the error
                    setError('Failed to render diagram')
                    setSvg('')

                    // We can render the raw error message for debugging if needed, 
                    // but usually just "Failed" is enough for the UI.
                    // The user might see Mermaid's default error overlay if we don't catch it properly,
                    // but mermaid.render() throws, so we should be catching it here.
                }
            }
        }

        renderChart()
    }, [chart])

    if (error) {
        return (
            <div className={`p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm ${className}`}>
                <div className="font-semibold mb-1">Diagram Error</div>
                <div className="text-xs opacity-90">{error}</div>
                {/* Optional: Show code for debugging */}
                {/* <pre className="mt-2 text-[10px] opacity-70 overflow-auto whitespace-pre-wrap">{chart}</pre> */}
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`mermaid-container bg-muted/50 rounded-lg p-4 overflow-auto flex justify-center ${className}`}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .mermaid-container svg {
                    max-width: 100%;
                    height: auto;
                    max-height: 400px;
                }
            `}} />
            <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
    )
}

/**
 * Parse content and extract mermaid diagrams, returning segments
 */
export function parseContentWithMermaid(content: string): { type: 'text' | 'mermaid'; content: string }[] {
    const segments: { type: 'text' | 'mermaid'; content: string }[] = []

    // Regex to match mermaid code blocks
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g

    let lastIndex = 0
    let match

    while ((match = mermaidRegex.exec(content)) !== null) {
        // Add text before this mermaid block
        if (match.index > lastIndex) {
            const textContent = content.slice(lastIndex, match.index).trim()
            if (textContent) {
                segments.push({ type: 'text', content: textContent })
            }
        }

        // Add mermaid block
        segments.push({ type: 'mermaid', content: match[1].trim() })

        lastIndex = match.index + match[0].length
    }

    // Add remaining text after last mermaid block
    if (lastIndex < content.length) {
        const textContent = content.slice(lastIndex).trim()
        if (textContent) {
            segments.push({ type: 'text', content: textContent })
        }
    }

    // If no mermaid blocks found, return entire content as text
    if (segments.length === 0 && content.trim()) {
        segments.push({ type: 'text', content: content.trim() })
    }

    return segments
}
