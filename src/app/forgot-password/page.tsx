"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Brain, ArrowLeft } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const supabase = createSupabaseClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            })

            if (error) {
                throw error
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/login" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground">Back to Login</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl text-foreground">CareerPath AI</span>
                    </div>

                    {/* Reset Password Card */}
                    <Card className="p-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
                        <p className="text-muted-foreground mb-6">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {success ? (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-foreground space-y-4">
                                <p>Check your email for a password reset link.</p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/login">Back to Login</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Sending link..." : "Send Reset Link"}
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}
