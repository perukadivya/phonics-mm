"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, UserPlus, Sparkles } from "lucide-react"

export default function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Signup failed")
                return
            }

            router.push("/")
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center p-4">
            {/* Floating emojis */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {["🌟", "📝", "🎨", "🌈", "🦋"].map((emoji, i) => (
                    <div
                        key={i}
                        className="absolute text-5xl opacity-15 animate-float"
                        style={{
                            left: `${10 + i * 20}%`,
                            top: `${15 + (i * 18) % 65}%`,
                            animationDelay: `${i * 0.4}s`,
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
                        <div className="text-6xl mb-3">🚀</div>
                        <h1 className="text-3xl font-black text-gray-800">Join the Fun!</h1>
                        <p className="text-gray-500 font-semibold mt-1">Create an account to start learning phonics</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-gray-600">Child's Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                                className="rounded-xl border-2 border-emerald-200 py-5 text-base focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-gray-600">Parent's Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="parent@example.com"
                                required
                                className="rounded-xl border-2 border-emerald-200 py-5 text-base focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold text-gray-600">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                required
                                className="rounded-xl border-2 border-emerald-200 py-5 text-base focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-600">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                required
                                className="rounded-xl border-2 border-emerald-200 py-5 text-base focus:border-emerald-500"
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
                            className="w-full py-6 text-lg font-black rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                        >
                            {loading ? (
                                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <UserPlus className="w-5 h-5 mr-2" />
                            )}
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-gray-500 font-semibold">
                            Already have an account?{" "}
                            <Link href="/login" className="text-emerald-600 font-black hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
