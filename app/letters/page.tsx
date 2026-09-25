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
  RefreshCw,
  Award,
  Smile,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { Confetti } from "@/components/confetti"
import { useProgress } from "@/hooks/useProgress"
import { ALPHABET_DATA, type PhonicsLetterItem } from "@/lib/phonics-data"
import {
  playPopSound,
  playStarSound,
  playSuccessSound,
  speakLetterSound,
  speakText,
} from "@/lib/audio"

export default function LettersPage() {
  const { markItemComplete, getCompletedItems } = useProgress()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedLetters, setCompletedLetters] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [lettersList, setLettersList] = useState<PhonicsLetterItem[]>(ALPHABET_DATA)
  const [isGenerating, setIsGenerating] = useState(false)

  const currentLetter = lettersList[currentIndex] || ALPHABET_DATA[0]

  useEffect(() => {
    setCompletedLetters(getCompletedItems("letters"))
  }, [getCompletedItems])

  const handleGenerateNew = async () => {
    setIsGenerating(true)
    playPopSound()
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "letters", count: 10 }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.content) && data.content.length > 0) {
          // Merge with current data
          const merged: PhonicsLetterItem[] = data.content.map((item: { letter: string; sound: string; word: string; emoji: string; ipa?: string; rhyme?: string }) => {
            const found = ALPHABET_DATA.find((a) => a.letter === item.letter.toUpperCase())
            return {
              letter: item.letter.toUpperCase(),
              sound: item.sound || found?.sound || "ah",
              ipa: item.ipa || found?.ipa || `/${item.letter.toLowerCase()}/`,
              word: item.word || found?.word || "Word",
              emoji: item.emoji || found?.emoji || "⭐",
              secondaryWords: found?.secondaryWords || [],
              color: found?.color || "from-purple-400 to-indigo-500",
              rhyme: item.rhyme || found?.rhyme || `${item.letter} is a wonderful sound to learn!`,
              mouthGuide: found?.mouthGuide || `Open your mouth and speak: ${item.sound}!`,
            }
          })
          setLettersList(merged)
          setCurrentIndex(0)
        }
      }
    } catch (err) {
      console.warn("Failed to generate custom letters:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlaySound = () => {
    playPopSound()
    speakLetterSound(currentLetter.letter, currentLetter.sound)
  }

  const handlePlayWord = () => {
    playPopSound()
    speakText(`${currentLetter.word}! ${currentLetter.word} begins with ${currentLetter.letter}!`, {
      rate: 0.82,
      pitch: 1.2,
    })
  }

  const handlePlaySecondary = (word: string) => {
    playPopSound()
    speakText(word, { rate: 0.85, pitch: 1.25 })
  }

  const handleMarkComplete = () => {
    const updated = new Set(completedLetters)
    updated.add(currentIndex)
    setCompletedLetters(updated)
    markItemComplete("letters", currentIndex)

    playStarSound()
    setShowConfetti(true)
  }

  const handleNext = () => {
    if (currentIndex < lettersList.length - 1) {
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

  const handleSelectLetter = (index: number) => {
    playPopSound()
    setCurrentIndex(index)
  }

  const progressPercent = (completedLetters.size / lettersList.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-3 sm:p-5 relative overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-4xl mx-auto relative z-10">
        <NavBar />

        {/* Page Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-2">
              <span>🔤</span>
              <span>Letter Sounds</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90">
              Master all 26 alphabet letters and their phonetic sounds!
            </p>
          </div>

          <Button
            onClick={handleGenerateNew}
            disabled={isGenerating}
            variant="outline"
            className="rounded-2xl font-bold bg-white/90 hover:bg-white text-purple-700 shadow-md border-0 active:scale-95"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin text-purple-600" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 text-purple-600 animate-sparkle" />
            )}
            {isGenerating ? "Creating..." : "Shuffle / AI Mix"}
          </Button>
        </div>

        {/* Alphabet Navigation Ribbon (A to Z) */}
        <div className="glass rounded-3xl p-3 mb-5 shadow-lg border-2 border-white/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {lettersList.map((item, idx) => {
              const isSelected = idx === currentIndex
              const isDone = completedLetters.has(idx)
              return (
                <button
                  key={item.letter + idx}
                  onClick={() => handleSelectLetter(idx)}
                  className={`w-9 h-11 sm:w-11 sm:h-12 rounded-2xl font-black text-base sm:text-lg transition-all flex flex-col items-center justify-center relative select-none active:scale-90 cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-lg scale-110 ring-4 ring-purple-200"
                      : isDone
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-white/80 hover:bg-white text-gray-700 hover:scale-105"
                  }`}
                  aria-label={`Letter ${item.letter}`}
                >
                  <span className="leading-none">{item.letter}</span>
                  {isDone && (
                    <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>
                  )}
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
              <span>Alphabet Mastery:</span>
              <span className="text-purple-700">{completedLetters.size} of {lettersList.length} Letters</span>
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-purple-100" />
        </div>

        {/* Main Interactive Learning Card */}
        <Card className="glass rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 animate-slideUp">
          <CardContent className="p-6 sm:p-8">
            <div className="max-w-xl mx-auto text-center space-y-6">
              {/* Letter Display with Glowing Gradient Pill */}
              <div className="relative inline-block group">
                <div
                  className={`w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-3xl bg-gradient-to-br ${currentLetter.color} shadow-xl flex flex-col items-center justify-center text-white transition-transform group-hover:scale-105 select-none`}
                >
                  <span className="text-7xl sm:text-8xl font-black drop-shadow-md tracking-tight">
                    {currentLetter.letter}
                    <span className="text-4xl sm:text-5xl font-extrabold opacity-90 ml-1 lowercase">
                      {currentLetter.letter}
                    </span>
                  </span>
                  <span className="text-sm font-bold opacity-80 mt-1">{currentLetter.ipa}</span>
                </div>
              </div>

              {/* Sound Pronunciation Button */}
              <div>
                <Button
                  onClick={handlePlaySound}
                  size="lg"
                  className="btn-chunky text-xl sm:text-2xl py-6 px-8 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg active:scale-95"
                >
                  <Volume2 className="w-7 h-7 mr-2.5 animate-bounce-slow" />
                  Say Sound: &quot;{currentLetter.sound}&quot;
                </Button>
                <p className="text-xs text-purple-900 font-bold mt-2">
                  Tap to hear how {currentLetter.letter} sounds! 🔊
                </p>
              </div>

              {/* Primary Word Card */}
              <div className="bg-white/90 rounded-3xl p-5 shadow-md border-2 border-yellow-200 transition-all hover:shadow-lg">
                <div className="text-6xl sm:text-7xl mb-2 select-none animate-bounce-slow">
                  {currentLetter.emoji}
                </div>
                <h3 className="text-3xl font-black text-gray-800 mb-1">{currentLetter.word}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-3">
                  Starts with <strong className="text-purple-700 font-black">{currentLetter.letter}</strong>
                </p>

                <Button
                  onClick={handlePlayWord}
                  variant="outline"
                  className="rounded-2xl font-black text-base py-3 px-6 border-2 border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm"
                >
                  <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
                  Hear &quot;{currentLetter.word}&quot;
                </Button>
              </div>

              {/* More Words for this Letter */}
              {currentLetter.secondaryWords && currentLetter.secondaryWords.length > 0 && (
                <div className="bg-purple-50/80 rounded-2xl p-4 border border-purple-200">
                  <div className="text-xs font-black text-purple-800 mb-2.5 uppercase tracking-wide">
                    More Words Starting with {currentLetter.letter}:
                  </div>
                  <div className="flex items-center justify-center gap-2.5 flex-wrap">
                    {currentLetter.secondaryWords.map((item) => (
                      <button
                        key={item.word}
                        onClick={() => handlePlaySecondary(item.word)}
                        type="button"
                        className="bg-white hover:bg-purple-100 rounded-xl px-3 py-1.5 shadow-sm border border-purple-100 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title={`Say ${item.word}`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-sm font-bold text-gray-800">{item.word}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kid-friendly Mouth Shape Guide */}
              {currentLetter.mouthGuide && (
                <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 text-left flex items-start gap-2.5">
                  <span className="text-2xl shrink-0">👄</span>
                  <div>
                    <div className="text-xs font-black text-amber-900">How to Make the Sound:</div>
                    <p className="text-xs font-bold text-amber-800 mt-0.5 leading-relaxed">
                      {currentLetter.mouthGuide}
                    </p>
                  </div>
                </div>
              )}

              {/* Letter Rhyme */}
              {currentLetter.rhyme && (
                <div className="bg-pink-50/80 rounded-2xl p-3.5 border border-pink-200 text-center">
                  <span className="text-xs font-black text-pink-700 block mb-0.5">🎵 Letter Rhyme</span>
                  <p className="text-sm font-bold text-purple-900 italic">
                    &ldquo;{currentLetter.rhyme}&rdquo;
                  </p>
                </div>
              )}

              {/* Completion Star Button */}
              <div>
                {!completedLetters.has(currentIndex) ? (
                  <Button
                    onClick={handleMarkComplete}
                    size="lg"
                    className="btn-chunky text-xl py-6 px-8 rounded-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl active:scale-95"
                  >
                    <Star className="w-6 h-6 mr-2 fill-yellow-200" />
                    I Know Letter {currentLetter.letter}! ⭐
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-black text-lg px-6 py-3 rounded-2xl shadow-sm border border-emerald-300 animate-pop">
                    <Star className="w-6 h-6 fill-emerald-500 text-emerald-600" />
                    <span>Letter {currentLetter.letter} Mastered! Awesome Job!</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation (Prev / Next) */}
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

          {/* Letter Indicator */}
          <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-md border border-white font-black text-purple-950 text-base">
            {currentIndex + 1} / {lettersList.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === lettersList.length - 1}
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
            character="penguin"
            message={`You're exploring letter ${currentLetter.letter}! Say "${currentLetter.sound}" 3 times out loud!`}
          />
        </div>
      </div>
    </div>
  )
}
