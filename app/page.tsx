"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, BookOpen, Sparkles, Brain, FileText, Crown } from "lucide-react"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { useProgress } from "@/hooks/useProgress"
import { canAccessFeature, type PlanId } from "@/lib/plans"

const floatingEmojis = ["🌟", "📚", "🎵", "✨", "🔤", "🎨", "🌈", "🦋", "🐝", "🌸"]

export default function HomePage() {
  const { progress, loading } = useProgress()
  const [mounted, setMounted] = useState(false)
  const [userPlan, setUserPlan] = useState<PlanId>("free")

  useEffect(() => {
    setMounted(true)
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((data) => { if (data.plan) setUserPlan(data.plan) })
      .catch(() => { })
  }, [])

  const stages = [
    {
      id: "letters",
      title: "Letter Sounds",
      description: "Learn the sounds of each letter!",
      icon: "🔤",
      progress: progress.letters,
      total: 26,
      href: "/letters",
      unlocked: true,
      planRequired: false,
      gradient: "from-rose-400 to-pink-500",
      bgGlow: "bg-rose-400/20",
    },
    {
      id: "three-letter",
      title: "3-Letter Words",
      description: "Build your first words!",
      icon: "📝",
      progress: progress.threeLetterWords,
      total: 20,
      href: "/three-letter-words",
      unlocked: progress.letters >= 13 && canAccessFeature(userPlan, "three-letter-words"),
      planRequired: !canAccessFeature(userPlan, "three-letter-words"),
      gradient: "from-orange-400 to-amber-500",
      bgGlow: "bg-orange-400/20",
    },
    {
      id: "four-letter",
      title: "4-Letter Words",
      description: "Longer words, more fun!",
      icon: "📚",
      progress: progress.fourLetterWords,
      total: 15,
      href: "/four-letter-words",
      unlocked: progress.threeLetterWords >= 10 && canAccessFeature(userPlan, "four-letter-words"),
      planRequired: !canAccessFeature(userPlan, "four-letter-words"),
      gradient: "from-emerald-400 to-teal-500",
      bgGlow: "bg-emerald-400/20",
    },
    {
      id: "five-letter",
      title: "5-Letter Words",
      description: "You're getting really good!",
      icon: "🌟",
      progress: progress.fiveLetterWords,
      total: 12,
      href: "/five-letter-words",
      unlocked: progress.fourLetterWords >= 8 && canAccessFeature(userPlan, "five-letter-words"),
      planRequired: !canAccessFeature(userPlan, "five-letter-words"),
      gradient: "from-blue-400 to-indigo-500",
      bgGlow: "bg-blue-400/20",
    },
    {
      id: "sentences",
      title: "Simple Sentences",
      description: "Put words together!",
      icon: "💬",
      progress: progress.sentences,
      total: 10,
      href: "/sentences",
      unlocked: progress.fiveLetterWords >= 6 && canAccessFeature(userPlan, "sentences"),
      planRequired: !canAccessFeature(userPlan, "sentences"),
      gradient: "from-violet-400 to-purple-500",
      bgGlow: "bg-violet-400/20",
    },
    {
      id: "worksheets",
      title: "Worksheet Generator",
      description: "Create printable practice sheets!",
      icon: "🧾",
      progress: 0,
      total: 1,
      href: "/worksheets",
      unlocked: true,
      planRequired: false,
      gradient: "from-pink-400 to-rose-500",
      bgGlow: "bg-pink-400/20",
    },
    {
      id: "quiz",
      title: "AI Quiz Challenge",
      description: "Test your phonics skills!",
      icon: "🧠",
      progress: 0,
      total: 1,
      href: "/quiz",
      unlocked: progress.letters >= 5,
      planRequired: false,
      gradient: "from-fuchsia-400 to-pink-600",
      bgGlow: "bg-fuchsia-400/20",
    },
  ]

  const totalProgress = stages.slice(0, 5).reduce((acc, stage) => acc + stage.progress, 0)
  const totalPossible = stages.slice(0, 5).reduce((acc, stage) => acc + stage.total, 0)
  const overallProgress = totalPossible > 0 ? (totalProgress / totalPossible) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-amber-300 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎵</div>
          <p className="text-2xl font-black text-white">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-amber-300 p-4 relative overflow-hidden">
      {/* Floating Background Emojis */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {floatingEmojis.map((emoji, index) => (
            <div
              key={index}
              className="absolute text-4xl opacity-20 animate-float select-none"
              style={{
                left: `${(index * 10) % 90 + 5}%`,
                top: `${(index * 13 + 7) % 85}%`,
                animationDelay: `${index * 0.3}s`,
                animationDuration: `${3 + (index % 3)}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        <NavBar />

        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl md:text-7xl font-black text-white mb-2 drop-shadow-lg tracking-tight">
            🎵 Phonics Fun! 🎵
          </h1>
          <p className="text-white/80 text-lg font-semibold">Learn to read with interactive AI-powered lessons</p>

          {/* Stats Bar */}
          <div className="glass rounded-3xl p-6 shadow-2xl mt-6 animate-slideUp">
            <div className="flex items-center justify-center gap-6 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-500" />
                <span className="text-2xl font-black text-gray-800">{progress.totalStickers}</span>
                <span className="text-gray-500 font-semibold">Stickers</span>
              </div>
              {progress.currentStreak > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-2xl font-black text-gray-800">{progress.currentStreak}</span>
                  <span className="text-gray-500 font-semibold">Day Streak</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500 animate-sparkle" />
                <span className="text-lg font-bold text-purple-600">{Math.round(overallProgress)}% Complete</span>
              </div>
            </div>
            <Progress value={overallProgress} className="h-4 bg-gray-200" />
          </div>
        </div>

        {/* Learning Stages */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage, index) => (
            <Card
              key={stage.id}
              className={`transform transition-all duration-300 border-0 rounded-3xl overflow-hidden animate-slideUp ${stage.unlocked
                ? "hover:scale-105 hover:shadow-2xl cursor-pointer glass"
                : "bg-gray-200/50 cursor-not-allowed opacity-70"
                }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <CardContent className="p-6 relative">
                {stage.unlocked && (
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${stage.bgGlow} blur-2xl`} />
                )}
                <div className="text-center space-y-3 relative z-10">
                  <div className="text-5xl mb-1">{stage.icon}</div>
                  <h3 className="text-xl font-black text-gray-800">{stage.title}</h3>
                  <p className="text-sm text-gray-500 font-semibold">{stage.description}</p>
                  {stage.unlocked ? (
                    <>
                      {stage.id !== "quiz" && stage.id !== "worksheets" && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>Progress</span>
                            <span className="text-gray-700">{stage.progress}/{stage.total}</span>
                          </div>
                          <Progress value={(stage.progress / stage.total) * 100} className="h-2.5" />
                        </div>
                      )}
                      <Link href={stage.href}>
                        <Button
                          size="lg"
                          className={`w-full text-lg py-5 font-black rounded-2xl shadow-lg bg-gradient-to-r ${stage.gradient} text-white border-0 hover:shadow-xl transition-all hover:scale-[1.02]`}
                        >
                          {stage.id === "quiz" ? <Brain className="w-5 h-5 mr-2" /> : stage.id === "worksheets" ? <FileText className="w-5 h-5 mr-2" /> : <BookOpen className="w-5 h-5 mr-2" />}
                          {stage.id === "quiz" ? "Take Quiz!" : stage.id === "worksheets" ? "Create Sheets!" : "Let's Learn!"}
                        </Button>
                      </Link>
                    </>
                  ) : stage.planRequired ? (
                    <div className="space-y-3">
                      <div className="text-purple-500 font-bold text-sm">👑 Upgrade to unlock!</div>
                      <Link href="/pricing">
                        <Button size="lg" className="w-full text-lg py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-black border-0 hover:shadow-xl transition-all hover:scale-[1.02]">
                          <Crown className="w-5 h-5 mr-2" />
                          Upgrade — ₹99/mo
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-400 font-bold text-sm">🔒 Complete previous stages to unlock!</div>
                      <Button disabled size="lg" className="w-full text-lg py-5 rounded-2xl">Locked</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Welcome Message */}
        {progress.totalStickers === 0 && mounted && (
          <div className="mt-8 animate-slideUp" style={{ animationDelay: "0.6s" }}>
            <div className="glass rounded-3xl p-6 shadow-xl text-center">
              <div className="text-4xl mb-2">👋</div>
              <h3 className="text-2xl font-black text-gray-800 mb-1">Welcome to Phonics Fun!</h3>
              <p className="text-gray-600 font-semibold">Start with <strong>Letter Sounds</strong> to begin your phonics adventure!</p>
            </div>
          </div>
        )}

        {/* AI Features */}
        <div className="mt-8 animate-slideUp" style={{ animationDelay: "0.7s" }}>
          <div className="glass rounded-3xl p-6 shadow-xl text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Sparkles className="w-6 h-6 text-purple-500 animate-sparkle" />
              <span className="text-xl font-black text-gray-800">Powered by AI</span>
              <Sparkles className="w-6 h-6 text-purple-500 animate-sparkle" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Unlimited examples, personalized quizzes & printable worksheets — all generated just for you!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
