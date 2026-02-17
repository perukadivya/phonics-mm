"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Volume2, Star, ArrowLeft, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { useProgress } from "@/hooks/useProgress"

const words = [
  { word: "BOOK", sounds: ["B", "OO", "K"], emoji: "📚", meaning: "Something you read!" },
  { word: "TREE", sounds: ["T", "R", "EE"], emoji: "🌳", meaning: "A tall plant with leaves!" },
  { word: "FISH", sounds: ["F", "I", "SH"], emoji: "🐟", meaning: "An animal that swims!" },
  { word: "BIRD", sounds: ["B", "IR", "D"], emoji: "🐦", meaning: "An animal that flies!" },
  { word: "CAKE", sounds: ["C", "A", "KE"], emoji: "🎂", meaning: "A sweet treat!" },
  { word: "MOON", sounds: ["M", "OO", "N"], emoji: "🌙", meaning: "What shines at night!" },
  { word: "FROG", sounds: ["F", "R", "OG"], emoji: "🐸", meaning: "A green animal that hops!" },
  { word: "STAR", sounds: ["S", "T", "AR"], emoji: "⭐", meaning: "What twinkles in the sky!" },
  { word: "DUCK", sounds: ["D", "U", "CK"], emoji: "🦆", meaning: "A bird that swims!" },
  { word: "BEAR", sounds: ["B", "EAR"], emoji: "🐻", meaning: "A big furry animal!" },
  { word: "BOAT", sounds: ["B", "OA", "T"], emoji: "⛵", meaning: "Something that floats!" },
  { word: "RAIN", sounds: ["R", "AI", "N"], emoji: "🌧️", meaning: "Water from the sky!" },
  { word: "SNOW", sounds: ["S", "N", "OW"], emoji: "❄️", meaning: "White flakes from the sky!" },
  { word: "FIRE", sounds: ["F", "I", "RE"], emoji: "🔥", meaning: "Something hot and bright!" },
  { word: "DOOR", sounds: ["D", "OOR"], emoji: "🚪", meaning: "What you open to go inside!" },
]

export default function FourLetterWordsPage() {
  const { markItemComplete, getCompletedItems } = useProgress()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set())
  const [showSticker, setShowSticker] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "match">("learn")
  const [matchingPairs, setMatchingPairs] = useState<Array<{ word: string; emoji: string; matched: boolean }>>([])
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  const currentWord = words[currentIndex]

  useEffect(() => {
    setCompletedWords(getCompletedItems("four-letter-words"))
  }, [getCompletedItems])

  useEffect(() => {
    if (gameMode === "match") {
      // Create matching game with current word and 3 random others
      const otherWords = words.filter((_, i) => i !== currentIndex).slice(0, 3)
      const gameWords = [currentWord, ...otherWords]

      const pairs = [
        ...gameWords.map((w) => ({ word: w.word, emoji: "", matched: false })),
        ...gameWords.map((w) => ({ word: "", emoji: w.emoji, matched: false })),
      ].sort(() => Math.random() - 0.5)

      setMatchingPairs(pairs)
      setSelectedCard(null)
    }
  }, [currentIndex, gameMode, currentWord])

  const playWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const playSound = (sound: string) => {
    // Handle common phonetic combinations
    const phoneticSounds: { [key: string]: string } = {
      // Single letters
      A: "ah",
      B: "buh",
      C: "kuh",
      D: "duh",
      E: "eh",
      F: "fuh",
      G: "guh",
      H: "huh",
      I: "ih",
      J: "juh",
      K: "kuh",
      L: "luh",
      M: "muh",
      N: "nuh",
      O: "oh",
      P: "puh",
      Q: "kwuh",
      R: "ruh",
      S: "sss",
      T: "tuh",
      U: "uh",
      V: "vuh",
      W: "wuh",
      X: "ks",
      Y: "yuh",
      Z: "zzz",
      // Common combinations
      OO: "oo",
      EE: "ee",
      IR: "er",
      AR: "ar",
      OU: "ow",
      SH: "sh",
      CH: "ch",
      TH: "th",
      CK: "k",
      NG: "ng",
      OA: "oh",
      AI: "ay",
      OW: "ow",
      EA: "ee",
      ER: "er",
      IGH: "eye",
      OOR: "or",
      EAR: "ear",
    }

    const utterance = new SpeechSynthesisUtterance(phoneticSounds[sound] || sound.toLowerCase())
    utterance.rate = 0.6
    utterance.pitch = 1.2
    speechSynthesis.speak(utterance)
  }

  const markComplete = () => {
    const newCompleted = new Set(completedWords)
    newCompleted.add(currentIndex)
    setCompletedWords(newCompleted)
    markItemComplete("four-letter-words", currentIndex)

    setShowSticker(true)
    setTimeout(() => setShowSticker(false), 2000)
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setGameMode("learn")
    }
  }

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setGameMode("learn")
    }
  }

  const handleCardClick = (index: number) => {
    if (matchingPairs[index].matched) return

    if (selectedCard === null) {
      setSelectedCard(index)
    } else {
      const firstCard = matchingPairs[selectedCard]
      const secondCard = matchingPairs[index]

      // Check if they match
      const firstIsWord = firstCard.word !== ""
      const secondIsWord = secondCard.word !== ""

      if (firstIsWord !== secondIsWord) {
        const wordCard = firstIsWord ? firstCard : secondCard
        const emojiCard = firstIsWord ? secondCard : firstCard

        const matchingWord = words.find((w) => w.word === wordCard.word && w.emoji === emojiCard.emoji)

        if (matchingWord) {
          // Match found!
          const newPairs = [...matchingPairs]
          newPairs[selectedCard].matched = true
          newPairs[index].matched = true
          setMatchingPairs(newPairs)

          // Check if current word was matched
          if (matchingWord.word === currentWord.word) {
            setTimeout(() => markComplete(), 500)
          }
        }
      }

      setSelectedCard(null)
    }
  }

  const progress = (completedWords.size / words.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-xl">
              <Home className="w-6 h-6 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">📚 4-Letter Words 📚</h1>
          <div className="w-24" />
        </div>

        {/* Progress */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>
              Progress: {completedWords.size}/{words.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 flex">
            <Button
              onClick={() => setGameMode("learn")}
              variant={gameMode === "learn" ? "default" : "ghost"}
              size="lg"
              className="text-xl"
            >
              📚 Learn
            </Button>
            <Button
              onClick={() => setGameMode("match")}
              variant={gameMode === "match" ? "default" : "ghost"}
              size="lg"
              className="text-xl"
            >
              🎯 Match
            </Button>
          </div>
        </div>

        {/* Main Learning Card */}
        <Card className="bg-white/95 shadow-2xl mb-6">
          <CardContent className="p-8 text-center">
            {gameMode === "learn" ? (
              <div className="space-y-6">
                {/* Word Display */}
                <div className="text-8xl mb-4">{currentWord.emoji}</div>
                <div className="text-6xl font-bold text-orange-600 mb-4">{currentWord.word}</div>

                {/* Meaning */}
                <div className="bg-yellow-100 rounded-2xl p-4 text-xl text-gray-700">{currentWord.meaning}</div>

                {/* Sound Buttons */}
                <div className="space-y-4">
                  <Button onClick={playWord} size="lg" className="text-2xl py-6 px-8 bg-green-500 hover:bg-green-600">
                    <Volume2 className="w-8 h-8 mr-3" />
                    Say Word
                  </Button>

                  <div className="flex justify-center gap-4 flex-wrap">
                    {currentWord.sounds.map((sound, index) => (
                      <Button
                        key={index}
                        onClick={() => playSound(sound)}
                        size="lg"
                        variant="outline"
                        className="text-2xl py-4 px-4 font-bold"
                      >
                        {sound}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Complete Button */}
                {!completedWords.has(currentIndex) && (
                  <Button
                    onClick={markComplete}
                    size="lg"
                    className="text-2xl py-6 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                  >
                    <Star className="w-8 h-8 mr-3" />I Know This Word!
                  </Button>
                )}

                {completedWords.has(currentIndex) && (
                  <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                    <Star className="w-8 h-8 mr-2 fill-current" />
                    Great Job! ⭐
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Matching Game */}
                <div className="text-2xl font-bold text-gray-700 mb-4">Match the words with their pictures!</div>
                <div className="text-lg text-gray-600 mb-4">
                  Find: <span className="font-bold text-orange-600">{currentWord.word}</span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {matchingPairs.map((pair, index) => (
                    <Button
                      key={index}
                      onClick={() => handleCardClick(index)}
                      disabled={pair.matched}
                      size="lg"
                      variant={selectedCard === index ? "default" : "outline"}
                      className={`h-24 text-2xl font-bold ${pair.matched
                          ? "bg-green-200 text-green-800"
                          : selectedCard === index
                            ? "bg-blue-500 text-white"
                            : ""
                        }`}
                    >
                      {pair.word || pair.emoji}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevWord}
            disabled={currentIndex === 0}
            size="lg"
            variant="outline"
            className="text-xl py-6 px-8"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Previous
          </Button>

          <div className="text-2xl font-bold text-white">
            {currentIndex + 1} / {words.length}
          </div>

          <Button
            onClick={nextWord}
            disabled={currentIndex === words.length - 1}
            size="lg"
            variant="outline"
            className="text-xl py-6 px-8"
          >
            Next
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>

        {/* Sticker Animation */}
        {showSticker && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-8xl animate-bounce">⭐</div>
          </div>
        )}
      </div>
    </div>
  )
}
