"use client"

import { useState } from "react"
import { Trophy, Star, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { playStarSound, playPopSound } from "@/lib/audio"

export interface BadgeItem {
  id: string
  name: string
  emoji: string
  starsRequired: number
  description: string
  unlockedColor: string
}

const BADGES: BadgeItem[] = [
  {
    id: "first-sound",
    name: "First Sound!",
    emoji: "⭐",
    starsRequired: 1,
    description: "Learned your very first phonics sound!",
    unlockedColor: "from-amber-400 to-yellow-500",
  },
  {
    id: "alphabet-hero",
    name: "Letter Hero",
    emoji: "🔤",
    starsRequired: 5,
    description: "Mastered 5 alphabet letters!",
    unlockedColor: "from-rose-400 to-pink-500",
  },
  {
    id: "word-builder",
    name: "Word Builder",
    emoji: "🧱",
    starsRequired: 10,
    description: "Built your first 10 phonics words!",
    unlockedColor: "from-emerald-400 to-teal-500",
  },
  {
    id: "lion-reader",
    name: "Brave Lion",
    emoji: "🦁",
    starsRequired: 15,
    description: "Roaring through phonics like Leo the Lion!",
    unlockedColor: "from-orange-400 to-amber-500",
  },
  {
    id: "sentence-star",
    name: "Sentence Star",
    emoji: "💬",
    starsRequired: 20,
    description: "Read full sentences with confidence!",
    unlockedColor: "from-blue-400 to-indigo-500",
  },
  {
    id: "quiz-master",
    name: "Quiz Champion",
    emoji: "🧠",
    starsRequired: 25,
    description: "Aced the AI Phonics Quiz Challenges!",
    unlockedColor: "from-purple-400 to-fuchsia-500",
  },
  {
    id: "rainbow-superstar",
    name: "Rainbow Reader",
    emoji: "🌈",
    starsRequired: 35,
    description: "Soaring high with colorful reading skills!",
    unlockedColor: "from-pink-400 to-rose-600",
  },
  {
    id: "phonics-royalty",
    name: "Phonics Royalty",
    emoji: "👑",
    starsRequired: 50,
    description: "The ultimate Grandmaster of Phonics!",
    unlockedColor: "from-yellow-400 via-amber-500 to-yellow-600",
  },
]

interface StickerAlbumProps {
  totalStickers: number
  currentStreak?: number
}

export function StickerAlbum({ totalStickers, currentStreak = 0 }: StickerAlbumProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null)

  const handleOpen = () => {
    playPopSound()
    setIsOpen(true)
  }

  const handleBadgeClick = (badge: BadgeItem, isUnlocked: boolean) => {
    setSelectedBadge(badge)
    if (isUnlocked) {
      playStarSound()
    } else {
      playPopSound()
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={handleOpen}
        variant="outline"
        className="rounded-full h-11 px-3.5 border-2 border-yellow-300 bg-white/95 hover:bg-yellow-50 shadow-md transition-all active:scale-95 flex items-center gap-2 group"
        title="Open Sticker Album & Badges"
        aria-label="Open Sticker Album"
      >
        <div className="relative">
          <Trophy className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 text-xs">✨</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base font-black text-gray-800">{totalStickers}</span>
          <span className="text-xs font-bold text-yellow-600 hidden sm:inline">Stickers</span>
        </div>
      </Button>

      {/* Album Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-purple-100 via-pink-50 to-amber-50 rounded-3xl p-6 shadow-2xl border-4 border-white max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-500 shadow border border-gray-100 transition-colors"
              aria-label="Close Album"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block p-3 rounded-full bg-yellow-400/20 mb-2">
                <span className="text-5xl block animate-bounce-slow">🏆</span>
              </div>
              <h2 className="text-3xl font-black text-purple-900 tracking-tight">Your Sticker Album</h2>
              <p className="text-purple-600 font-bold text-sm">
                Collect stickers by mastering letters, words, and quizzes!
              </p>

              {/* Stats banner */}
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-yellow-200 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  <span className="text-xl font-black text-gray-800">{totalStickers}</span>
                  <span className="text-xs font-bold text-gray-500">Stars Earned</span>
                </div>
                {currentStreak > 0 && (
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-orange-200 flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="text-xl font-black text-gray-800">{currentStreak}</span>
                    <span className="text-xs font-bold text-gray-500">Day Streak</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
              {BADGES.map((badge) => {
                const isUnlocked = totalStickers >= badge.starsRequired
                return (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge, isUnlocked)}
                    className={`relative p-4 rounded-2xl text-center border-2 transition-all active:scale-95 ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.unlockedColor} text-white border-white shadow-lg hover:scale-105 cursor-pointer`
                        : "bg-white/60 text-gray-400 border-gray-200 border-dashed cursor-pointer opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="text-4xl mb-2 filter drop-shadow-sm">
                      {isUnlocked ? badge.emoji : "🔒"}
                    </div>
                    <div className="text-xs font-black truncate">{badge.name}</div>
                    <div
                      className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                        isUnlocked ? "bg-white/30 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isUnlocked ? "Unlocked! ⭐" : `${badge.starsRequired} ⭐`}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected Badge Detail Card */}
            {selectedBadge && (
              <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-purple-200 text-center animate-slideUp">
                <div className="text-3xl mb-1">{selectedBadge.emoji}</div>
                <h4 className="text-lg font-black text-gray-800">{selectedBadge.name}</h4>
                <p className="text-xs font-bold text-gray-500 mt-0.5">{selectedBadge.description}</p>
                <div className="mt-2 text-xs font-black text-purple-600">
                  {totalStickers >= selectedBadge.starsRequired
                    ? "🎉 You have earned this badge! Amazing work!"
                    : `Collect ${selectedBadge.starsRequired - totalStickers} more stars to unlock this! 🚀`}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-3 rounded-2xl shadow-lg"
              >
                Keep Learning! 🚀
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
