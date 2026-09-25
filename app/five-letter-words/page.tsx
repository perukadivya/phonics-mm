"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Volume2,
  Star,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Award,
  Delete,
  RotateCcw,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { Confetti } from "@/components/confetti"
import { useProgress } from "@/hooks/useProgress"
import { FIVE_LETTER_WORDS, type PhonicsWordItem } from "@/lib/phonics-data"
import {
  playPopSound,
  playStarSound,
  playSuccessSound,
  playWrongSound,
  speakText,
} from "@/lib/audio"

export default function FiveLetterWordsPage() {
  const { markItemComplete, getCompletedItems } = useProgress()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "type">("learn")

  // Spelling quest state
  const [typedLetters, setTypedLetters] = useState<string[]>([])
  const [status, setStatus] = useState<"pending" | "correct" | "wrong">("pending")

  const currentWord: PhonicsWordItem = FIVE_LETTER_WORDS[currentIndex] || FIVE_LETTER_WORDS[0]

  useEffect(() => {
    setCompletedWords(getCompletedItems("five-letter-words"))
  }, [getCompletedItems])

  useEffect(() => {
    setTypedLetters([])
    setStatus("pending")
  }, [currentIndex, gameMode])

  const handlePlayWord = () => {
    playPopSound()
    speakText(`${currentWord.word}! ${currentWord.meaning}`, { rate: 0.85, pitch: 1.2 })
  }

  const handlePlaySound = (sound: string) => {
    playPopSound()
    speakText(sound, { rate: 0.8, pitch: 1.2 })
  }

  const handleAddLetter = (char: string) => {
    if (typedLetters.length >= 5) return
    playPopSound()

    const updated = [...typedLetters, char.toUpperCase()]
    setTypedLetters(updated)

    if (updated.length === 5) {
      const spelled = updated.join("")
      if (spelled === currentWord.word) {
        setStatus("correct")
        playSuccessSound()
        setShowConfetti(true)

        const newDone = new Set(completedWords)
        newDone.add(currentIndex)
        setCompletedWords(newDone)
        markItemComplete("five-letter-words", currentIndex)
      } else {
        setStatus("wrong")
        playWrongSound()
      }
    }
  }

  const handleBackspace = () => {
    playPopSound()
    setTypedLetters((prev) => prev.slice(0, -1))
    setStatus("pending")
  }

  const handleReset = () => {
    playPopSound()
    setTypedLetters([])
    setStatus("pending")
  }

  const handleMarkComplete = () => {
    const updated = new Set(completedWords)
    updated.add(currentIndex)
    setCompletedWords(updated)
    markItemComplete("five-letter-words", currentIndex)

    playStarSound()
    setShowConfetti(true)
  }

  const handleNext = () => {
    if (currentIndex < FIVE_LETTER_WORDS.length - 1) {
      playPopSound()
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      playPopSound()
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const progressPercent = (completedWords.size / FIVE_LETTER_WORDS.length) * 100

  // Keyboard rows for kid-friendly on-screen typing
  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-3 sm:p-5 relative overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-4xl mx-auto relative z-10">
        <NavBar />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-2">
              <span>🌟</span>
              <span>5-Letter Big Words</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90">
              Read advanced phonics words with multiple syllables and compound sounds!
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-2xl shadow-md border-2 border-white">
            <button
              onClick={() => {
                playPopSound()
                setGameMode("learn")
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                gameMode === "learn"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📖 Learn Word
            </button>
            <button
              onClick={() => {
                playPopSound()
                setGameMode("type")
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                gameMode === "type"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ⌨️ Spelling Quest
            </button>
          </div>
        </div>

        {/* Word Quick Selector Bar */}
        <div className="glass rounded-3xl p-3 mb-5 shadow-lg border-2 border-white/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {FIVE_LETTER_WORDS.map((w, idx) => {
              const isSelected = idx === currentIndex
              const isDone = completedWords.has(idx)
              return (
                <button
                  key={w.word}
                  onClick={() => {
                    playPopSound()
                    setCurrentIndex(idx)
                  }}
                  className={`px-3 py-2 rounded-2xl font-black text-sm transition-all flex items-center gap-1 select-none active:scale-90 cursor-pointer ${
                    isSelected
                      ? "bg-purple-700 text-white shadow-lg scale-105 ring-4 ring-purple-200"
                      : isDone
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-white/80 hover:bg-white text-gray-700 hover:scale-105"
                  }`}
                >
                  <span>{w.emoji}</span>
                  <span>{w.word}</span>
                  {isDone && <span className="text-[10px]">⭐</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass rounded-2xl p-3.5 mb-5 shadow-md border-2 border-white/60">
          <div className="flex justify-between items-center text-xs sm:text-sm font-black text-purple-950 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              <span>5-Letter Progress:</span>
              <span className="text-purple-700 font-black">
                {completedWords.size} of {FIVE_LETTER_WORDS.length} Words
              </span>
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-purple-100" />
        </div>

        {/* Main Card */}
        <Card className="glass rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 animate-slideUp">
          <CardContent className="p-6 sm:p-8">
            {gameMode === "learn" ? (
              /* LEARN MODE */
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="text-8xl sm:text-9xl select-none animate-bounce-slow">
                  {currentWord.emoji}
                </div>

                {/* Big Word Display */}
                <div>
                  <h2 className="text-5xl sm:text-6xl font-black text-purple-900 tracking-wide mb-2">
                    {currentWord.word}
                  </h2>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                    Tap sound parts to hear them:
                  </p>
                </div>

                {/* Sounds breakdown */}
                <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                  {currentWord.sounds.map((sound, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePlaySound(sound)}
                      type="button"
                      className="px-4 py-3 rounded-2xl font-black text-2xl bg-white hover:bg-purple-50 text-purple-800 shadow-md border-2 border-purple-200 transition-all active:scale-90 cursor-pointer"
                    >
                      {sound}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    onClick={handlePlayWord}
                    size="lg"
                    className="btn-chunky text-lg py-5 px-6 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg active:scale-95"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Say &quot;{currentWord.word}&quot;
                  </Button>
                </div>

                {/* Meaning Card */}
                <div className="bg-white/90 rounded-2xl p-4 shadow-sm border border-purple-200">
                  <span className="text-xs font-black text-purple-700 block mb-0.5">What it means:</span>
                  <p className="text-base font-bold text-gray-800">{currentWord.meaning}</p>
                </div>

                {/* Completion Star */}
                <div>
                  {!completedWords.has(currentIndex) ? (
                    <Button
                      onClick={handleMarkComplete}
                      size="lg"
                      className="btn-chunky text-xl py-6 px-8 rounded-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white shadow-xl active:scale-95"
                    >
                      <Star className="w-6 h-6 mr-2 fill-yellow-200" />
                      I Can Read &quot;{currentWord.word}&quot;! ⭐
                    </Button>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-black text-lg px-6 py-3 rounded-2xl shadow-sm border border-emerald-300 animate-pop">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span>&quot;{currentWord.word}&quot; Mastered! Super Reader!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SPELLING QUEST MODE */
              <div className="max-w-xl mx-auto text-center space-y-5">
                <div className="text-7xl select-none animate-bounce-slow">{currentWord.emoji}</div>
                <h3 className="text-lg font-black text-gray-800">
                  Can you spell: <span className="text-purple-700">&quot;{currentWord.hint}&quot;</span>?
                </h3>

                {/* 5 Slots */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const char = typedLetters[slotIdx]
                    return (
                      <div
                        key={slotIdx}
                        className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl font-black text-3xl sm:text-4xl shadow-inner border-4 flex items-center justify-center transition-all ${
                          char
                            ? status === "correct"
                              ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                              : status === "wrong"
                                ? "bg-rose-100 border-rose-400 text-rose-800 animate-wiggle"
                                : "bg-white border-purple-300 text-purple-900"
                            : "bg-white/60 border-dashed border-gray-300 text-gray-300"
                        }`}
                      >
                        {char || "?"}
                      </div>
                    )
                  })}
                </div>

                {/* Status Message */}
                {status === "correct" && (
                  <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl font-black text-base border border-emerald-300 animate-pop">
                    🎉 Excellent! You spelled {currentWord.word}!
                  </div>
                )}
                {status === "wrong" && (
                  <div className="bg-rose-100 text-rose-800 p-3 rounded-2xl font-black text-sm border border-rose-300 animate-wiggle">
                    Keep trying! Hint: {currentWord.hint}
                  </div>
                )}

                {/* Kid-Friendly On-Screen Keyboard */}
                <div className="space-y-1.5 pt-2">
                  {KEYBOARD_ROWS.map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
                      {row.map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleAddLetter(letter)}
                          className="w-8 h-10 sm:w-11 sm:h-12 rounded-xl font-black text-base sm:text-xl bg-white hover:bg-purple-100 text-purple-950 shadow-sm border border-purple-200 transition-all active:scale-75 cursor-pointer flex items-center justify-center select-none"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  ))}

                  {/* Actions Row */}
                  <div className="flex justify-center gap-2 pt-2">
                    <Button
                      onClick={handleBackspace}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold bg-white text-gray-700"
                    >
                      <Delete className="w-4 h-4 mr-1 text-gray-500" />
                      Erase
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold bg-white text-gray-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-1 text-gray-500" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prev / Next */}
        <div className="flex justify-between items-center gap-3">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            size="lg"
            variant="outline"
            className="rounded-2xl font-black text-base py-5 px-6 bg-white/90 hover:bg-white border-0 shadow-md active:scale-95 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            Previous
          </Button>

          <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-md border border-white font-black text-purple-950 text-base">
            {currentIndex + 1} / {FIVE_LETTER_WORDS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === FIVE_LETTER_WORDS.length - 1}
            size="lg"
            variant="outline"
            className="rounded-2xl font-black text-base py-5 px-6 bg-white/90 hover:bg-white border-0 shadow-md active:scale-95 disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-1.5" />
          </Button>
        </div>

        {/* Mascot */}
        <div className="mt-8 flex justify-center">
          <Mascot
            character="lion"
            message={`You're spelling 5-letter words! That's awesome reader power!`}
          />
        </div>
      </div>
    </div>
  )
}
