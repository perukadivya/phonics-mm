"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, LogIn, Sparkles } from "lucide-react"

function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get("from") || "/"

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Login failed")
                return
            }

            router.push(from)
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-amber-300 flex items-center justify-center p-4">
            {/* Floating emojis */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {["📚", "🔤", "✨", "🌟", "🎵"].map((emoji, i) => (
                    <div
                        key={i}
                        className="absolute text-5xl opacity-15 animate-float"
                        style={{
                            left: `${15 + i * 18}%`,
                            top: `${10 + (i * 20) % 70}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + i}s`,
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            <Card className="w-full max-w-md glass shadow-2xl rounded-3xl border-0 relative z-10">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-3">🎵</div>
                        <h1 className="text-3xl font-black text-gray-800">Welcome Back!</h1>
                        <p className="text-gray-500 font-semibold mt-1">Log in to continue your phonics adventure</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-gray-600">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="parent@example.com"
                                required
                                className="rounded-xl border-2 border-purple-200 py-5 text-base focus:border-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold text-gray-600">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="rounded-xl border-2 border-purple-200 py-5 text-base focus:border-purple-500"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl p-3 text-sm font-semibold">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 text-lg font-black rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg"
                        >
                            {loading ? (
                                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <LogIn className="w-5 h-5 mr-2" />
                            )}
                            {loading ? "Logging in..." : "Log In"}
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-gray-500 font-semibold">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-purple-600 font-black hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-amber-300 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🎵</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
