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
  RotateCcw,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { Confetti } from "@/components/confetti"
import { useProgress } from "@/hooks/useProgress"
import { SIMPLE_SENTENCES, type PhonicsSentenceItem } from "@/lib/phonics-data"
import {
  playPopSound,
  playStarSound,
  playSuccessSound,
  playWrongSound,
  speakText,
} from "@/lib/audio"

export default function SentencesPage() {
  const { markItemComplete, getCompletedItems } = useProgress()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameMode, setGameMode] = useState<"read" | "build">("read")

  // Builder puzzle state
  const [builtWords, setBuiltWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [buildStatus, setBuildStatus] = useState<"pending" | "correct" | "wrong">("pending")
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null)

  const currentSentence: PhonicsSentenceItem =
    SIMPLE_SENTENCES[currentIndex] || SIMPLE_SENTENCES[0]

  useEffect(() => {
    setCompletedSentences(getCompletedItems("sentences"))
  }, [getCompletedItems])

  // Setup puzzle whenever sentence or mode changes
  useEffect(() => {
    if (gameMode === "build") {
      setupPuzzle()
    }
  }, [currentIndex, gameMode])

  const setupPuzzle = () => {
    const scrambled = [...currentSentence.words].sort(() => Math.random() - 0.5)
    setAvailableWords(scrambled)
    setBuiltWords([])
    setBuildStatus("pending")
  }

  const handlePlaySentence = () => {
    playPopSound()
    speakText(currentSentence.sentence, { rate: 0.8, pitch: 1.15 })
  }

  const handlePlayWord = (word: string, idx: number) => {
    setActiveWordIndex(idx)
    playPopSound()
    // Strip trailing punctuation for clean phonics speech
    const cleanWord = word.replace(/[.,!?]/g, "")
    speakText(cleanWord, { rate: 0.85, pitch: 1.25 })
    setTimeout(() => setActiveWordIndex(null), 800)
  }

  const handleAddWordToSentence = (word: string, availIdx: number) => {
    playPopSound()
    const updated = [...builtWords, word]
    setBuiltWords(updated)

    const updatedAvail = [...availableWords]
    updatedAvail.splice(availIdx, 1)
    setAvailableWords(updatedAvail)

    if (updated.length === currentSentence.words.length) {
      const userBuilt = updated.join(" ")
      const target = currentSentence.words.join(" ")

      if (userBuilt === target) {
        setBuildStatus("correct")
        playSuccessSound()
        setShowConfetti(true)

        const newDone = new Set(completedSentences)
        newDone.add(currentIndex)
        setCompletedSentences(newDone)
        markItemComplete("sentences", currentIndex)
      } else {
        setBuildStatus("wrong")
        playWrongSound()
      }
    }
  }

  const handleRemoveWord = (word: string, builtIdx: number) => {
    playPopSound()
    const updated = [...builtWords]
    updated.splice(builtIdx, 1)
    setBuiltWords(updated)
    setAvailableWords((prev) => [...prev, word])
    setBuildStatus("pending")
  }

  const handleMarkComplete = () => {
    const updated = new Set(completedSentences)
    updated.add(currentIndex)
    setCompletedSentences(updated)
    markItemComplete("sentences", currentIndex)

    playStarSound()
    setShowConfetti(true)
  }

  const handleNext = () => {
    if (currentIndex < SIMPLE_SENTENCES.length - 1) {
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

  const progressPercent = (completedSentences.size / SIMPLE_SENTENCES.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 p-3 sm:p-5 relative overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-4xl mx-auto relative z-10">
        <NavBar />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-2">
              <span>💬</span>
              <span>Simple Sentences</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90">
              Read decodable sentences and assemble word puzzle tiles!
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-2xl shadow-md border-2 border-white">
            <button
              onClick={() => {
                playPopSound()
                setGameMode("read")
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                gameMode === "read"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📖 Read Along
            </button>
            <button
              onClick={() => {
                playPopSound()
                setGameMode("build")
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                gameMode === "build"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🧩 Sentence Puzzle
            </button>
          </div>
        </div>

        {/* Sentences Quick Selector */}
        <div className="glass rounded-3xl p-3 mb-5 shadow-lg border-2 border-white/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {SIMPLE_SENTENCES.map((s, idx) => {
              const isSelected = idx === currentIndex
              const isDone = completedSentences.has(idx)
              return (
                <button
                  key={idx}
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
                  <span>{s.emoji}</span>
                  <span>#{idx + 1}</span>
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
              <span>Sentences Read:</span>
              <span className="text-purple-700 font-black">
                {completedSentences.size} of {SIMPLE_SENTENCES.length} Sentences
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
            {gameMode === "read" ? (
              /* READ ALONG MODE */
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="text-8xl select-none animate-bounce-slow">{currentSentence.emoji}</div>

                <div>
                  <p className="text-xs font-black text-purple-900 uppercase tracking-wide mb-3">
                    Tap any word to listen, or read the whole sentence:
                  </p>

                  {/* Interactive Word Tiles */}
                  <div className="flex justify-center gap-2 sm:gap-3 flex-wrap p-4 bg-white/80 rounded-3xl border-2 border-purple-200 shadow-inner">
                    {currentSentence.words.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlayWord(word, idx)}
                        type="button"
                        className={`px-3.5 py-2.5 rounded-2xl font-black text-2xl sm:text-3xl transition-all active:scale-90 cursor-pointer shadow-sm border ${
                          activeWordIndex === idx
                            ? "bg-yellow-300 text-yellow-950 border-yellow-500 scale-110 shadow-md ring-4 ring-yellow-200"
                            : "bg-white hover:bg-purple-100 text-purple-900 border-purple-100 hover:scale-105"
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Read Full Sentence Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handlePlaySentence}
                    size="lg"
                    className="btn-chunky text-xl py-6 px-8 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl active:scale-95"
                  >
                    <Volume2 className="w-6 h-6 mr-2" />
                    Read Full Sentence 🔊
                  </Button>
                </div>

                {/* Completion Star */}
                <div>
                  {!completedSentences.has(currentIndex) ? (
                    <Button
                      onClick={handleMarkComplete}
                      size="lg"
                      className="btn-chunky text-xl py-6 px-8 rounded-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white shadow-xl active:scale-95"
                    >
                      <Star className="w-6 h-6 mr-2 fill-yellow-200" />
                      I Read This Sentence! ⭐
                    </Button>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-black text-lg px-6 py-3 rounded-2xl shadow-sm border border-emerald-300 animate-pop">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span>Sentence Mastered! You are a Reader!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SENTENCE BUILDER PUZZLE MODE */
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="text-7xl select-none animate-bounce-slow">{currentSentence.emoji}</div>
                <h3 className="text-lg font-black text-gray-800">
                  Put the words in the right order!
                </h3>

                {/* Built Sentence Slot Line */}
                <div className="min-h-24 p-4 rounded-3xl bg-white/70 border-4 border-dashed border-purple-300 flex items-center justify-center gap-2 flex-wrap shadow-inner">
                  {builtWords.length === 0 ? (
                    <span className="text-gray-400 font-bold text-sm">
                      Tap the words below to build the sentence...
                    </span>
                  ) : (
                    builtWords.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRemoveWord(word, idx)}
                        type="button"
                        className="px-3 py-2 rounded-2xl font-black text-xl sm:text-2xl bg-purple-600 text-white shadow-md active:scale-90 cursor-pointer animate-pop"
                        title="Click to remove"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Status Message */}
                {buildStatus === "correct" && (
                  <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl font-black text-lg border border-emerald-300 animate-pop">
                    🎉 Excellent! Perfect sentence! ⭐
                  </div>
                )}
                {buildStatus === "wrong" && (
                  <div className="bg-rose-100 text-rose-800 p-3 rounded-2xl font-black text-sm border border-rose-300 animate-wiggle">
                    Not quite right! Tap words to remove or reset and try again!
                  </div>
                )}

                {/* Available Word Tiles */}
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Available Words:</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {availableWords.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddWordToSentence(word, idx)}
                        type="button"
                        className="px-4 py-2.5 rounded-2xl font-black text-xl sm:text-2xl bg-white hover:bg-purple-100 text-purple-950 shadow-md border-2 border-purple-200 transition-all active:scale-90 hover:scale-105 cursor-pointer select-none"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset button */}
                <div className="flex justify-center">
                  <Button
                    onClick={setupPuzzle}
                    variant="outline"
                    size="sm"
                    className="rounded-2xl font-bold bg-white text-gray-700 shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1 text-gray-500" />
                    Reset Words
                  </Button>
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
            {currentIndex + 1} / {SIMPLE_SENTENCES.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === SIMPLE_SENTENCES.length - 1}
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
            character="penguin"
            message={`You're reading full sentences! Put your finger under each word as you read!`}
          />
        </div>
      </div>
    </div>
  )
}
