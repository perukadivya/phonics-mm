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
  RotateCcw,
  CheckCircle2,
  Award,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { Confetti } from "@/components/confetti"
import { useProgress } from "@/hooks/useProgress"
import { THREE_LETTER_WORDS, type PhonicsWordItem } from "@/lib/phonics-data"
import {
  playPopSound,
  playStarSound,
  playSuccessSound,
  playWrongSound,
  speakText,
  speakLetterSound,
} from "@/lib/audio"

export default function ThreeLetterWordsPage() {
  const { markItemComplete, getCompletedItems } = useProgress()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "spell">("learn")

  // Spelling game state
  const [spelledLetters, setSpelledLetters] = useState<string[]>([])
  const [availableBubbles, setAvailableBubbles] = useState<string[]>([])
  const [spellStatus, setSpellStatus] = useState<"pending" | "correct" | "wrong">("pending")
  const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null)

  const currentWord: PhonicsWordItem = THREE_LETTER_WORDS[currentIndex] || THREE_LETTER_WORDS[0]

  useEffect(() => {
    setCompletedWords(getCompletedItems("three-letter-words"))
  }, [getCompletedItems])

  // Setup spelling game when switching words or modes
  useEffect(() => {
    if (gameMode === "spell") {
      const correct = currentWord.word.split("")
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((l) => !correct.includes(l))
      // 3 distractors
      const distractors = alphabet.sort(() => Math.random() - 0.5).slice(0, 3)
      const combined = [...correct, ...distractors].sort(() => Math.random() - 0.5)

      setAvailableBubbles(combined)
      setSpelledLetters([])
      setSpellStatus("pending")
    }
  }, [currentIndex, gameMode, currentWord.word])

  const handlePlayWord = () => {
    playPopSound()
    speakText(`${currentWord.word}! ${currentWord.meaning}`, { rate: 0.85, pitch: 1.2 })
  }

  const handlePlaySoundTile = (letter: string, index: number) => {
    setActiveTileIndex(index)
    playPopSound()
    speakLetterSound(letter)
    setTimeout(() => setActiveTileIndex(null), 800)
  }

  const handleBlendWord = () => {
    playPopSound()
    const letters = currentWord.word.split("")
    // Speak first letter, then second, then third, then blended word
    speakText(
      `${letters[0]}... ${letters[1]}... ${letters[2]}... ${currentWord.word}!`,
      { rate: 0.75, pitch: 1.2 }
    )
  }

  const handleAddLetter = (letter: string, bubbleIndex: number) => {
    if (spelledLetters.length >= 3) return
    playPopSound()

    const updated = [...spelledLetters, letter]
    setSpelledLetters(updated)

    // Remove tapped bubble
    const newBubbles = [...availableBubbles]
    newBubbles.splice(bubbleIndex, 1)
    setAvailableBubbles(newBubbles)

    // If 3 letters entered, check spelling
    if (updated.length === 3) {
      const userSpelling = updated.join("")
      if (userSpelling === currentWord.word) {
        setSpellStatus("correct")
        playSuccessSound()
        setShowConfetti(true)

        // Mark complete
        const newDone = new Set(completedWords)
        newDone.add(currentIndex)
        setCompletedWords(newDone)
        markItemComplete("three-letter-words", currentIndex)
      } else {
        setSpellStatus("wrong")
        playWrongSound()
      }
    }
  }

  const handleResetSpelling = () => {
    playPopSound()
    const correct = currentWord.word.split("")
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((l) => !correct.includes(l))
    const distractors = alphabet.sort(() => Math.random() - 0.5).slice(0, 3)
    const combined = [...correct, ...distractors].sort(() => Math.random() - 0.5)

    setAvailableBubbles(combined)
    setSpelledLetters([])
    setSpellStatus("pending")
  }

  const handleMarkComplete = () => {
    const updated = new Set(completedWords)
    updated.add(currentIndex)
    setCompletedWords(updated)
    markItemComplete("three-letter-words", currentIndex)

    playStarSound()
    setShowConfetti(true)
  }

  const handleNext = () => {
    if (currentIndex < THREE_LETTER_WORDS.length - 1) {
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

  const progressPercent = (completedWords.size / THREE_LETTER_WORDS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-3 sm:p-5 relative overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-4xl mx-auto relative z-10">
        <NavBar />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-2">
              <span>📝</span>
              <span>3-Letter Words</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90">
              Sound out CVC (Consonant-Vowel-Consonant) words and blend them together!
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
                  ? "bg-orange-500 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📖 Learn & Blend
            </button>
            <button
              onClick={() => {
                playPopSound()
                setGameMode("spell")
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                gameMode === "spell"
                  ? "bg-orange-500 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🧩 Spell & Pop
            </button>
          </div>
        </div>

        {/* Word Quick-Selector Pills */}
        <div className="glass rounded-3xl p-3 mb-5 shadow-lg border-2 border-white/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {THREE_LETTER_WORDS.map((w, idx) => {
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
                      ? "bg-orange-600 text-white shadow-lg scale-105 ring-4 ring-orange-200"
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
          <div className="flex justify-between items-center text-xs sm:text-sm font-black text-amber-950 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-600" />
              <span>Words Mastered:</span>
              <span className="text-orange-700 font-black">
                {completedWords.size} of {THREE_LETTER_WORDS.length} Words
              </span>
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-orange-100" />
        </div>

        {/* Main Card */}
        <Card className="glass rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 animate-slideUp">
          <CardContent className="p-6 sm:p-8">
            {gameMode === "learn" ? (
              /* LEARN & BLEND MODE */
              <div className="max-w-xl mx-auto text-center space-y-6">
                {/* Big Emoji */}
                <div className="text-8xl sm:text-9xl select-none animate-bounce-slow">
                  {currentWord.emoji}
                </div>

                {/* Interactive Sound Tiles */}
                <div>
                  <p className="text-xs font-black text-purple-900 uppercase tracking-wide mb-3">
                    Tap each tile to hear its sound:
                  </p>
                  <div className="flex justify-center gap-3 sm:gap-4">
                    {currentWord.word.split("").map((letter, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlaySoundTile(letter, idx)}
                        type="button"
                        className={`w-20 h-24 sm:w-24 sm:h-28 rounded-3xl font-black text-4xl sm:text-5xl shadow-lg border-b-4 transition-all active:scale-90 cursor-pointer flex flex-col items-center justify-center ${
                          activeTileIndex === idx
                            ? "bg-yellow-300 border-yellow-500 text-yellow-900 scale-110 ring-4 ring-yellow-200"
                            : "bg-white border-orange-200 hover:bg-orange-50 text-gray-800 hover:scale-105"
                        }`}
                        title={`Sound of ${letter}`}
                      >
                        <span>{letter}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                          Sound {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blend & Pronounce Buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    onClick={handleBlendWord}
                    size="lg"
                    className="btn-chunky text-lg py-5 px-6 rounded-2xl font-black bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Blend: {currentWord.word.split("").join(" + ")}!
                  </Button>

                  <Button
                    onClick={handlePlayWord}
                    size="lg"
                    variant="outline"
                    className="rounded-2xl font-black text-lg py-5 px-6 border-2 border-orange-300 text-orange-700 bg-white hover:bg-orange-50 shadow-sm"
                  >
                    <Volume2 className="w-5 h-5 mr-2 text-orange-600" />
                    Say Word
                  </Button>
                </div>

                {/* Meaning & Hint Box */}
                <div className="bg-white/90 rounded-2xl p-4 shadow-sm border border-orange-200">
                  <span className="text-xs font-black text-orange-700 block mb-0.5">What it means:</span>
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
                      <span>Word &quot;{currentWord.word}&quot; Mastered! Super Reader!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SPELL & POP MODE */
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="text-7xl select-none animate-bounce-slow">{currentWord.emoji}</div>
                <h3 className="text-xl font-black text-gray-800">
                  Spell the word for this picture!
                </h3>

                {/* Spelling Slots */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2].map((slotIdx) => {
                    const letter = spelledLetters[slotIdx]
                    return (
                      <div
                        key={slotIdx}
                        className={`w-20 h-24 sm:w-24 sm:h-28 rounded-3xl font-black text-4xl sm:text-5xl shadow-inner border-4 flex items-center justify-center transition-all ${
                          letter
                            ? spellStatus === "correct"
                              ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                              : spellStatus === "wrong"
                                ? "bg-rose-100 border-rose-400 text-rose-800 animate-wiggle"
                                : "bg-white border-orange-300 text-purple-900"
                            : "bg-white/60 border-dashed border-gray-300 text-gray-300"
                        }`}
                      >
                        {letter || "?"}
                      </div>
                    )
                  })}
                </div>

                {/* Status Message */}
                {spellStatus === "correct" && (
                  <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl font-black text-lg border border-emerald-300 animate-pop">
                    🎉 Excellent! You spelled {currentWord.word}!
                  </div>
                )}
                {spellStatus === "wrong" && (
                  <div className="bg-rose-100 text-rose-800 p-3 rounded-2xl font-black text-sm border border-rose-300 animate-wiggle">
                    Oops! Try sounding it out again: &quot;{currentWord.hint}&quot;
                  </div>
                )}

                {/* Available Bubbles */}
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Tap bubbles in order:</p>
                  <div className="flex justify-center gap-2.5 flex-wrap">
                    {availableBubbles.map((letter, bubbleIdx) => (
                      <button
                        key={bubbleIdx}
                        onClick={() => handleAddLetter(letter, bubbleIdx)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-2xl sm:text-3xl bg-white hover:bg-orange-50 text-orange-900 shadow-md border-2 border-orange-200 transition-all active:scale-75 hover:scale-105 cursor-pointer flex items-center justify-center select-none"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleResetSpelling}
                    variant="outline"
                    size="sm"
                    className="rounded-2xl font-bold bg-white/90 text-gray-700 shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5 text-gray-500" />
                    Clear & Try Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prev / Next Navigation */}
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

          <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-md border border-white font-black text-orange-950 text-base">
            {currentIndex + 1} / {THREE_LETTER_WORDS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === THREE_LETTER_WORDS.length - 1}
            size="lg"
            variant="outline"
            className="rounded-2xl font-black text-base py-5 px-6 bg-white/90 hover:bg-white border-0 shadow-md active:scale-95 disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-1.5" />
          </Button>
        </div>

        {/* Mascot companion footer */}
        <div className="mt-8 flex justify-center">
          <Mascot
            character="bunny"
            message={`Great reading! CVC words like ${currentWord.word} are the building blocks of reading!`}
          />
        </div>
      </div>
    </div>
  )
}
