"use client"

import { useState } from "react"
import { speakText, playPopSound } from "@/lib/audio"

export type MascotCharacter = "lion" | "penguin" | "owl" | "bunny"

interface MascotProps {
  character?: MascotCharacter
  message?: string
  className?: string
  showBubble?: boolean
}

const MASCOTS: Record<
  MascotCharacter,
  {
    name: string
    emoji: string
    title: string
    defaultQuote: string
    badgeBg: string
  }
> = {
  lion: {
    name: "Leo the Lion",
    emoji: "🦁",
    title: "Reading Champion",
    defaultQuote: "Roar! You are doing amazing! Keep sounding out each letter!",
    badgeBg: "from-amber-400 to-orange-500",
  },
  penguin: {
    name: "Pip the Penguin",
    emoji: "🐧",
    title: "Phonics Explorer",
    defaultQuote: "Waddle we learn next? Tap a letter sound to hear it speak!",
    badgeBg: "from-sky-400 to-blue-500",
  },
  owl: {
    name: "Oliver the Owl",
    emoji: "🦉",
    title: "Wise Word Reader",
    defaultQuote: "Whoo-whoo knows this sound? Listen closely and repeat!",
    badgeBg: "from-purple-400 to-indigo-500",
  },
  bunny: {
    name: "Bella the Bunny",
    emoji: "🐰",
    title: "Super Speller",
    defaultQuote: "Hop into phonics fun! Every word you read makes you stronger!",
    badgeBg: "from-pink-400 to-rose-500",
  },
}

export function Mascot({
  character = "lion",
  message,
  className = "",
  showBubble = true,
}: MascotProps) {
  const [wiggling, setWiggling] = useState(false)
  const info = MASCOTS[character]
  const quote = message || info.defaultQuote

  const handleMascotTap = () => {
    setWiggling(true)
    playPopSound()
    speakText(`${info.name} says: ${quote}`, { rate: 0.85, pitch: 1.25 })
    setTimeout(() => setWiggling(false), 800)
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Mascot Avatar */}
      <button
        onClick={handleMascotTap}
        type="button"
        title={`Tap ${info.name} to hear advice!`}
        aria-label={`Tap ${info.name}`}
        className={`relative group p-2 rounded-3xl bg-gradient-to-br ${info.badgeBg} shadow-lg hover:shadow-xl transition-transform active:scale-95 cursor-pointer ${
          wiggling ? "animate-wiggle" : "hover:animate-bounce-slow"
        }`}
      >
        <span className="text-4xl sm:text-5xl block">{info.emoji}</span>
        <span className="absolute -bottom-1 -right-1 bg-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow border border-purple-100 text-purple-700">
          Tip!
        </span>
      </button>

      {/* Speech Bubble */}
      {showBubble && (
        <div
          onClick={handleMascotTap}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleMascotTap()
          }}
          className="relative bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-md border-2 border-purple-100 max-w-sm text-left cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <div className="text-xs font-black text-purple-700 flex items-center gap-1 mb-0.5">
            <span>{info.name}</span>
            <span className="text-[10px] text-gray-400 font-semibold">• {info.title}</span>
          </div>
          <p className="text-sm font-bold text-gray-700 leading-snug">{quote}</p>
        </div>
      )}
    </div>
  )
}
