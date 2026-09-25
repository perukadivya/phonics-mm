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
  Gamepad2,
  RotateCcw,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { Confetti } from "@/components/confetti"
import { useProgress } from "@/hooks/useProgress"
import { FOUR_LETTER_WORDS, type PhonicsWordItem } from "@/lib/phonics-data"
import {
  playPopSound,
  playStarSound,
  playSuccessSound,
  playWrongSound,
  playClickSound,
  speakText,
} from "@/lib/audio"

interface MatchCard {
  id: number
  type: "word" | "emoji"
  value: string
  wordKey: string
  matched: boolean
}

export default function FourLetterWordsPage() {
  const { markItemComplete, getCompletedItems } = useProgress()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "match">("learn")

  // Match Game state
  const [cards, setCards] = useState<MatchCard[]>([])
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [activeBlendIndex, setActiveBlendIndex] = useState<number | null>(null)

  const currentWord: PhonicsWordItem = FOUR_LETTER_WORDS[currentIndex] || FOUR_LETTER_WORDS[0]

  useEffect(() => {
    setCompletedWords(getCompletedItems("four-letter-words"))
  }, [getCompletedItems])

  // Setup match game
  useEffect(() => {
    if (gameMode === "match") {
      setupMatchGame()
    }
  }, [gameMode, currentIndex])

  const setupMatchGame = () => {
    // Pick current word and 3 other words
    const others = FOUR_LETTER_WORDS.filter((_, i) => i !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const selectedGroup = [currentWord, ...others]

    const newCards: MatchCard[] = []
    selectedGroup.forEach((item, idx) => {
      newCards.push({
        id: idx * 2,
        type: "word",
        value: item.word,
        wordKey: item.word,
        matched: false,
      })
      newCards.push({
        id: idx * 2 + 1,
        type: "emoji",
        value: item.emoji,
        wordKey: item.word,
        matched: false,
      })
    })

    // Shuffle cards
    setCards(newCards.sort(() => Math.random() - 0.5))
    setSelectedCards([])
    setMatchCount(0)
  }

  const handleCardClick = (cardIdx: number) => {
    if (selectedCards.length >= 2 || selectedCards.includes(cardIdx)) return
    const card = cards[cardIdx]
    if (card.matched) return

    playPopSound()
    const newSelected = [...selectedCards, cardIdx]
    setSelectedCards(newSelected)

    if (card.type === "word") {
      speakText(card.value, { rate: 0.85, pitch: 1.2 })
    }

    if (newSelected.length === 2) {
      const card1 = cards[newSelected[0]]
      const card2 = cards[newSelected[1]]

      if (card1.wordKey === card2.wordKey && card1.type !== card2.type) {
        // MATCH!
        setTimeout(() => {
          playSuccessSound()
          setCards((prev) =>
            prev.map((c, i) =>
              i === newSelected[0] || i === newSelected[1] ? { ...c, matched: true } : c
            )
          )
          setSelectedCards([])
          const updatedMatches = matchCount + 1
          setMatchCount(updatedMatches)

          if (updatedMatches === 4) {
            // Completed all matches
            setShowConfetti(true)
            const updatedDone = new Set(completedWords)
            updatedDone.add(currentIndex)
            setCompletedWords(updatedDone)
            markItemComplete("four-letter-words", currentIndex)
          }
        }, 500)
      } else {
        // MISMATCH
        setTimeout(() => {
          playWrongSound()
          setSelectedCards([])
        }, 900)
      }
    }
  }

  const handlePlayWord = () => {
    playPopSound()
    speakText(`${currentWord.word}! ${currentWord.meaning}`, { rate: 0.85, pitch: 1.2 })
  }

  const handlePlayBlend = (sound: string, index: number) => {
    setActiveBlendIndex(index)
    playPopSound()
    speakText(sound, { rate: 0.8, pitch: 1.2 })
    setTimeout(() => setActiveBlendIndex(null), 800)
  }

  const handleBlendTogether = () => {
    playPopSound()
    const parts = currentWord.sounds.join("... ")
    speakText(`${parts}... ${currentWord.word}!`, { rate: 0.75, pitch: 1.2 })
  }

  const handleMarkComplete = () => {
    const updated = new Set(completedWords)
    updated.add(currentIndex)
    setCompletedWords(updated)
    markItemComplete("four-letter-words", currentIndex)

    playStarSound()
    setShowConfetti(true)
  }

  const handleNext = () => {
    if (currentIndex < FOUR_LETTER_WORDS.length - 1) {
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

  const progressPercent = (completedWords.size / FOUR_LETTER_WORDS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400 p-3 sm:p-5 relative overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-4xl mx-auto relative z-10">
        <NavBar />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-2">
              <span>📚</span>
              <span>4-Letter Words & Blends</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90">
              Explore consonant blends (TR, ST, FR) and vowel digraphs (OO, EE, AI)!
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
                  ? "bg-teal-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📖 Learn Blends
            </button>
            <button
              onClick={() => {
                playPopSound()
                setGameMode("match")
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                gameMode === "match"
                  ? "bg-teal-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🎯 Picture Match
            </button>
          </div>
        </div>

        {/* Word Quick Selector Bar */}
        <div className="glass rounded-3xl p-3 mb-5 shadow-lg border-2 border-white/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {FOUR_LETTER_WORDS.map((w, idx) => {
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
                      ? "bg-teal-700 text-white shadow-lg scale-105 ring-4 ring-teal-200"
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
          <div className="flex justify-between items-center text-xs sm:text-sm font-black text-teal-950 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-600" />
              <span>4-Letter Mastery:</span>
              <span className="text-teal-700 font-black">
                {completedWords.size} of {FOUR_LETTER_WORDS.length} Words
              </span>
            </span>
            <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-teal-100" />
        </div>

        {/* Main Card */}
        <Card className="glass rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 animate-slideUp">
          <CardContent className="p-6 sm:p-8">
            {gameMode === "learn" ? (
              /* LEARN & BLENDS MODE */
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="text-8xl sm:text-9xl select-none animate-bounce-slow">
                  {currentWord.emoji}
                </div>

                {/* Sound Blends Tiles */}
                <div>
                  <p className="text-xs font-black text-teal-900 uppercase tracking-wide mb-3">
                    Sound Blends & Digraphs:
                  </p>
                  <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
                    {currentWord.sounds.map((sound, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlayBlend(sound, idx)}
                        type="button"
                        className={`min-w-20 h-24 sm:min-w-24 sm:h-28 px-4 rounded-3xl font-black text-3xl sm:text-4xl shadow-lg border-b-4 transition-all active:scale-90 cursor-pointer flex flex-col items-center justify-center ${
                          activeBlendIndex === idx
                            ? "bg-yellow-300 border-yellow-500 text-yellow-900 scale-110 ring-4 ring-yellow-200"
                            : "bg-white border-teal-200 hover:bg-teal-50 text-gray-800 hover:scale-105"
                        }`}
                        title={`Sound ${sound}`}
                      >
                        <span>{sound}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                          Blend {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    onClick={handleBlendTogether}
                    size="lg"
                    className="btn-chunky text-lg py-5 px-6 rounded-2xl font-black bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Blend: {currentWord.sounds.join(" + ")}!
                  </Button>

                  <Button
                    onClick={handlePlayWord}
                    size="lg"
                    variant="outline"
                    className="rounded-2xl font-black text-lg py-5 px-6 border-2 border-teal-300 text-teal-700 bg-white hover:bg-teal-50 shadow-sm"
                  >
                    <Volume2 className="w-5 h-5 mr-2 text-teal-600" />
                    Say Word
                  </Button>
                </div>

                {/* Word Meaning Card */}
                <div className="bg-white/90 rounded-2xl p-4 shadow-sm border border-teal-200">
                  <span className="text-xs font-black text-teal-700 block mb-0.5">What it means:</span>
                  <p className="text-base font-bold text-gray-800">{currentWord.meaning}</p>
                </div>

                {/* Star Complete Button */}
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
                      <span>&quot;{currentWord.word}&quot; Mastered! Awesome Reading!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* PICTURE MATCH GAME */
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    Find matching pairs ({matchCount} of 4 found)
                  </span>
                  <Button
                    onClick={setupMatchGame}
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-white text-gray-700 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset Cards
                  </Button>
                </div>

                {/* 4x2 Grid of Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {cards.map((card, idx) => {
                    const isSelected = selectedCards.includes(idx)
                    const isMatched = card.matched
                    const isOpen = isSelected || isMatched

                    return (
                      <button
                        key={idx}
                        onClick={() => handleCardClick(idx)}
                        disabled={isMatched}
                        className={`h-24 sm:h-28 rounded-2xl font-black transition-all transform flex items-center justify-center select-none active:scale-95 border-2 shadow-md ${
                          isMatched
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800 opacity-80"
                            : isSelected
                              ? "bg-amber-100 border-amber-400 text-purple-900 scale-105 ring-2 ring-amber-300"
                              : "bg-white hover:bg-teal-50 border-teal-200 text-teal-800 cursor-pointer"
                        }`}
                      >
                        {isOpen ? (
                          card.type === "emoji" ? (
                            <span className="text-4xl sm:text-5xl animate-pop">{card.value}</span>
                          ) : (
                            <span className="text-lg sm:text-xl font-black animate-pop tracking-tight">
                              {card.value}
                            </span>
                          )
                        ) : (
                          <div className="text-teal-400 text-3xl font-black">?</div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {matchCount === 4 && (
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-2xl font-black text-lg border border-emerald-300 animate-pop">
                    🎉 Match Champion! You matched all pairs! ⭐
                  </div>
                )}
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

          <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-md border border-white font-black text-teal-950 text-base">
            {currentIndex + 1} / {FOUR_LETTER_WORDS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === FOUR_LETTER_WORDS.length - 1}
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
            character="owl"
            message={`Look at the word ${currentWord.word}! Sound out each blend carefully!`}
          />
        </div>
      </div>
    </div>
  )
}
