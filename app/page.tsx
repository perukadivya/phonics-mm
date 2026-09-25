"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, BookOpen, Sparkles, Brain, FileText, ArrowRight, Star, Volume2 } from "lucide-react"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { useProgress } from "@/hooks/useProgress"
import { ALPHABET_DATA } from "@/lib/phonics-data"
import { playPopSound, playClickSound, speakLetterSound } from "@/lib/audio"

const floatingEmojis = ["🌟", "📚", "🎵", "✨", "🔤", "🎨", "🌈", "🦋", "🐝", "🌸", "🦁", "🐧"]

export default function HomePage() {
  const { progress, loading } = useProgress()
  const [mounted, setMounted] = useState(false)
  const [activeLetterAudio, setActiveLetterAudio] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stages = [
    {
      id: "letters",
      title: "Letter Sounds",
      subtitle: "26 Alphabet Sounds",
      description: "Learn letter sounds, rhymes & mouth shapes from A to Z!",
      icon: "🔤",
      progress: progress.letters,
      total: 26,
      href: "/letters",
      unlocked: true,
      gradient: "from-rose-400 via-pink-500 to-rose-500",
      borderGlow: "border-rose-300",
      badgeColor: "bg-rose-100 text-rose-700",
      cta: "Explore A-Z!",
    },
    {
      id: "three-letter",
      title: "3-Letter Words",
      subtitle: "CVC Word Building",
      description: "Tap & build your first words like CAT, DOG, and SUN!",
      icon: "📝",
      progress: progress.threeLetterWords,
      total: 20,
      href: "/three-letter-words",
      unlocked: true,
      gradient: "from-orange-400 via-amber-500 to-amber-600",
      borderGlow: "border-orange-300",
      badgeColor: "bg-orange-100 text-orange-700",
      cta: "Build Words!",
    },
    {
      id: "four-letter",
      title: "4-Letter Words",
      subtitle: "Blends & Digraphs",
      description: "Master longer words with sound blends: TREE, STAR, FROG!",
      icon: "📚",
      progress: progress.fourLetterWords,
      total: 15,
      href: "/four-letter-words",
      unlocked: true,
      gradient: "from-emerald-400 via-teal-500 to-teal-600",
      borderGlow: "border-emerald-300",
      badgeColor: "bg-emerald-100 text-emerald-700",
      cta: "Read 4-Letter!",
    },
    {
      id: "five-letter",
      title: "5-Letter Words",
      subtitle: "Advanced Reading",
      description: "Sound out bigger words like HOUSE, APPLE, and SMILE!",
      icon: "🌟",
      progress: progress.fiveLetterWords,
      total: 12,
      href: "/five-letter-words",
      unlocked: true,
      gradient: "from-blue-400 via-indigo-500 to-indigo-600",
      borderGlow: "border-blue-300",
      badgeColor: "bg-blue-100 text-blue-700",
      cta: "Level Up!",
    },
    {
      id: "sentences",
      title: "Simple Sentences",
      subtitle: "Read & Put Together",
      description: "Read full phonics sentences and play the word builder game!",
      icon: "💬",
      progress: progress.sentences,
      total: 10,
      href: "/sentences",
      unlocked: true,
      gradient: "from-violet-400 via-purple-500 to-purple-600",
      borderGlow: "border-violet-300",
      badgeColor: "bg-violet-100 text-violet-700",
      cta: "Read Sentences!",
    },
    {
      id: "quiz",
      title: "AI Quiz Challenge",
      subtitle: "Test Your Superpowers",
      description: "Fun voice questions, sound matching, and star celebrations!",
      icon: "🧠",
      progress: 0,
      total: 1,
      href: "/quiz",
      unlocked: true,
      gradient: "from-fuchsia-400 via-pink-500 to-pink-600",
      borderGlow: "border-fuchsia-300",
      badgeColor: "bg-fuchsia-100 text-fuchsia-700",
      cta: "Start Quiz!",
    },
    {
      id: "worksheets",
      title: "Printable Worksheets",
      subtitle: "Paper & Pencil Practice",
      description: "Instant handwriting tracing, matching & coloring worksheets!",
      icon: "🖨️",
      progress: 0,
      total: 1,
      href: "/worksheets",
      unlocked: true,
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
      borderGlow: "border-yellow-300",
      badgeColor: "bg-yellow-100 text-yellow-800",
      cta: "Print Sheets!",
    },
  ]

  const totalProgress = stages.slice(0, 5).reduce((acc, stage) => acc + stage.progress, 0)
  const totalPossible = stages.slice(0, 5).reduce((acc, stage) => acc + stage.total, 0)
  const overallProgress = totalPossible > 0 ? (totalProgress / totalPossible) * 100 : 0

  const handleLetterTap = (letter: string, sound: string) => {
    setActiveLetterAudio(letter)
    playPopSound()
    speakLetterSound(letter, sound)
    setTimeout(() => setActiveLetterAudio(null), 1200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 flex items-center justify-center p-4">
        <div className="bg-white/95 rounded-3xl p-8 shadow-2xl text-center max-w-sm border-4 border-white">
          <div className="text-7xl mb-4 animate-bounce">🎵</div>
          <h2 className="text-2xl font-black text-purple-900 mb-2">Getting Ready...</h2>
          <p className="text-sm font-bold text-purple-600">Loading your phonics adventure!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 p-3 sm:p-5 relative overflow-hidden selection:bg-pink-300">
      {/* Floating Emojis Background */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {floatingEmojis.map((emoji, index) => (
            <div
              key={index}
              className="absolute text-4xl sm:text-5xl opacity-20 animate-float select-none"
              style={{
                left: `${(index * 9) % 92 + 4}%`,
                top: `${(index * 13 + 5) % 88}%`,
                animationDelay: `${index * 0.25}s`,
                animationDuration: `${3.5 + (index % 3)}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <NavBar />

        {/* Hero Section */}
        <div className="text-center mb-8 animate-fadeIn pt-2">
          {/* Header Title with animated music notes */}
          <div className="inline-block relative">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] tracking-tight">
              Phonics Fun!
            </h1>
            <span className="absolute -top-4 -right-6 text-4xl animate-bounce-slow">✨</span>
          </div>
          <p className="text-white text-lg sm:text-xl font-bold mt-2 drop-shadow-sm max-w-xl mx-auto">
            Interactive, joyful phonics learning for young readers ages 3–8!
          </p>

          {/* Mascot Welcome Card */}
          <div className="mt-5 flex justify-center">
            <Mascot
              character="lion"
              message="Welcome, superstar! Tap any letter below to hear its sound, or jump straight into a module!"
            />
          </div>

          {/* Overall Progress Stats Bar */}
          <div className="glass rounded-3xl p-5 sm:p-6 shadow-xl mt-6 border-2 border-white/70 max-w-3xl mx-auto animate-slideUp">
            <div className="flex items-center justify-around gap-4 mb-4 flex-wrap">
              {/* Stickers Collected */}
              <div className="flex items-center gap-2.5 bg-yellow-50 rounded-2xl px-4 py-2 border border-yellow-200">
                <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                <div className="text-left">
                  <div className="text-2xl font-black text-gray-800 leading-none">{progress.totalStickers}</div>
                  <div className="text-[11px] font-bold text-yellow-700">Stickers Won</div>
                </div>
              </div>

              {/* Day Streak */}
              <div className="flex items-center gap-2.5 bg-orange-50 rounded-2xl px-4 py-2 border border-orange-200">
                <span className="text-2xl">🔥</span>
                <div className="text-left">
                  <div className="text-2xl font-black text-gray-800 leading-none">
                    {progress.currentStreak > 0 ? progress.currentStreak : 1}
                  </div>
                  <div className="text-[11px] font-bold text-orange-700">Day Streak</div>
                </div>
              </div>

              {/* Completion Percentage */}
              <div className="flex items-center gap-2.5 bg-purple-50 rounded-2xl px-4 py-2 border border-purple-200">
                <Sparkles className="w-6 h-6 text-purple-600 animate-sparkle" />
                <div className="text-left">
                  <div className="text-2xl font-black text-purple-800 leading-none">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-[11px] font-bold text-purple-700">Phonics Mastered</div>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-purple-900 px-1">
                <span>Reading Journey</span>
                <span>{totalProgress} of {totalPossible} Skills</span>
              </div>
              <Progress value={overallProgress} className="h-4 bg-purple-100" />
            </div>
          </div>
        </div>

        {/* Quick Alphabet Sound Bar (Kids love tapping letters!) */}
        <div className="glass rounded-3xl p-5 shadow-xl mb-8 border-2 border-white/70 animate-slideUp">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-lg text-purple-950">Quick Alphabet Soundboard</h3>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              Tap any letter to hear the sound! 🔊
            </span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-1.5 sm:gap-2">
            {ALPHABET_DATA.map((item) => {
              const isPlaying = activeLetterAudio === item.letter
              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => handleLetterTap(item.letter, item.sound)}
                  className={`p-2 rounded-2xl font-black text-lg sm:text-xl transition-all select-none active:scale-90 cursor-pointer shadow-sm border ${
                    isPlaying
                      ? "bg-yellow-300 text-yellow-900 border-yellow-400 scale-110 shadow-md ring-4 ring-yellow-200 animate-wiggle"
                      : "bg-white hover:bg-purple-50 text-purple-900 border-purple-100 hover:scale-105"
                  }`}
                  title={`${item.letter} says ${item.sound} (as in ${item.word})`}
                  aria-label={`Letter ${item.letter}`}
                >
                  <div className="text-center leading-none">
                    <span>{item.letter}</span>
                    <span className="text-[10px] block opacity-70 font-semibold">{item.emoji}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Learning Modules Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {stages.map((stage, index) => (
            <Card
              key={stage.id}
              className={`transform transition-all duration-300 border-2 ${stage.borderGlow} rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] glass`}
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              <CardContent className="p-6 relative flex flex-col justify-between h-full">
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl select-none animate-bounce-slow">{stage.icon}</div>
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${stage.badgeColor}`}>
                      {stage.subtitle}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black text-gray-800 mb-1">{stage.title}</h3>
                  <p className="text-sm text-gray-600 font-semibold leading-relaxed mb-4">
                    {stage.description}
                  </p>

                  {/* Module Progress if applicable */}
                  {stage.total > 1 && (
                    <div className="space-y-1.5 mb-5 bg-white/70 p-3 rounded-2xl border border-gray-100">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>Stars Earned</span>
                        <span className="text-purple-700 font-black">
                          {stage.progress} / {stage.total} ⭐
                        </span>
                      </div>
                      <Progress
                        value={(stage.progress / stage.total) * 100}
                        className="h-2.5 bg-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Big Kid-Friendly CTA Button */}
                <Link
                  href={stage.href}
                  onClick={() => playClickSound()}
                  className="block mt-auto"
                >
                  <Button
                    size="lg"
                    className={`w-full text-lg py-6 font-black rounded-2xl shadow-md hover:shadow-lg bg-gradient-to-r ${stage.gradient} text-white border-0 transition-transform active:scale-95 flex items-center justify-center gap-2`}
                  >
                    {stage.id === "quiz" ? (
                      <Brain className="w-5 h-5" />
                    ) : stage.id === "worksheets" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                    <span>{stage.cta}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Parent & Teacher Info Box */}
        <div className="glass rounded-3xl p-6 shadow-xl text-center border-2 border-white/70 mb-8 animate-slideUp">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">👩‍🏫</span>
            <h4 className="text-lg font-black text-purple-900">For Parents & Educators</h4>
            <span className="text-2xl">👨‍👩‍👧</span>
          </div>
          <p className="text-sm text-purple-800 font-semibold max-w-2xl mx-auto leading-relaxed">
            Phonics Fun teaches systematic synthetic phonics, the scientifically proven method for early reading.
            Children practice letter-sound relationships, blend sounds into words, and apply their skills in decodable sentences and printable activities!
          </p>
        </div>
      </div>
    </div>
  )
}
