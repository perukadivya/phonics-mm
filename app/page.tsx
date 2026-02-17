"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, BookOpen, Sparkles, Brain, FileText } from "lucide-react"
import Link from "next/link"

interface UserProgress {
  letters: number
  threeLetterWords: number
  fourLetterWords: number
  fiveLetterWords: number
  sentences: number
  totalStickers: number
  currentStreak: number
}

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress>({
    letters: 0,
    threeLetterWords: 0,
    fourLetterWords: 0,
    fiveLetterWords: 0,
    sentences: 0,
    totalStickers: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    const savedProgress = localStorage.getItem("phonics-progress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
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
    },
    {
      id: "three-letter",
      title: "3-Letter Words",
      description: "Build your first words!",
      icon: "📝",
      progress: progress.threeLetterWords,
      total: 20,
      href: "/three-letter-words",
      unlocked: progress.letters >= 13,
    },
    {
      id: "four-letter",
      title: "4-Letter Words",
      description: "Longer words, more fun!",
      icon: "📚",
      progress: progress.fourLetterWords,
      total: 15,
      href: "/four-letter-words",
      unlocked: progress.threeLetterWords >= 10,
    },
    {
      id: "five-letter",
      title: "5-Letter Words",
      description: "You're getting really good!",
      icon: "🌟",
      progress: progress.fiveLetterWords,
      total: 12,
      href: "/five-letter-words",
      unlocked: progress.fourLetterWords >= 8,
    },
    {
      id: "sentences",
      title: "Simple Sentences",
      description: "Put words together!",
      icon: "💬",
      progress: progress.sentences,
      total: 10,
      href: "/sentences",
      unlocked: progress.fiveLetterWords >= 6,
    },
    {
      id: "worksheets",
      title: "Worksheet Generator",
      description: "Create printable phonics practice sheets!",
      icon: "🧾",
      progress: 0,
      total: 1,
      href: "/worksheets",
      unlocked: true,
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
    },
  ]

  const totalProgress = stages.slice(0, 5).reduce((acc, stage) => acc + stage.progress, 0)
  const totalPossible = stages.slice(0, 5).reduce((acc, stage) => acc + stage.total, 0)
  const overallProgress = (totalProgress / totalPossible) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">🎵 Phonics Fun! 🎵</h1>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{progress.totalStickers} Stickers</span>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold text-gray-700">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-4" />
            </div>
          </div>
        </div>

        {/* Learning Stages */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => (
            <Card
              key={stage.id}
              className={`transform transition-all duration-300 hover:scale-105 ${
                stage.unlocked ? "bg-white/95 shadow-xl cursor-pointer" : "bg-gray-300/50 cursor-not-allowed"
              }`}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-2">{stage.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800">{stage.title}</h3>
                  <p className="text-lg text-gray-600">{stage.description}</p>

                  {stage.unlocked ? (
                    <>
                      {stage.id !== "quiz" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Progress</span>
                            <span>
                              {stage.progress}/{stage.total}
                            </span>
                          </div>
                          <Progress value={(stage.progress / stage.total) * 100} className="h-3" />
                        </div>
                      )}

                      <Link href={stage.href}>
                        <Button
                          size="lg"
                          className={`w-full text-xl py-6 font-bold rounded-2xl shadow-lg ${
                            stage.id === "quiz" || stage.id === "worksheets"
                              ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                              : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                          } text-white`}
                        >
                          {stage.id === "quiz" ? (
                            <Brain className="w-6 h-6 mr-2" />
                          ) : stage.id === "worksheets" ? (
                            <FileText className="w-6 h-6 mr-2" />
                          ) : (
                            <BookOpen className="w-6 h-6 mr-2" />
                          )}
                          {stage.id === "quiz" ? "Take Quiz!" : stage.id === "worksheets" ? "Create Sheets!" : "Let's Learn!"}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-gray-500 font-semibold">🔒 Complete previous stages to unlock!</div>
                      <Button disabled size="lg" className="w-full text-xl py-6">
                        Locked
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Streak */}
        {progress.currentStreak > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl inline-block">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <span className="text-2xl font-bold text-gray-800">{progress.currentStreak} Day Streak!</span>
                <span className="text-3xl">🔥</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Features Notice */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-800">Powered by AI</span>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg text-gray-700">Unlimited examples and personalized quizzes generated just for you!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
