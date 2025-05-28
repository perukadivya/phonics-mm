"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Volume2, Star, ArrowLeft, ArrowRight, Home, Check } from "lucide-react"
import Link from "next/link"

const sentences = [
  {
    sentence: "The cat is big.",
    words: ["The", "cat", "is", "big."],
    emoji: "🐱",
    meaning: "A large cat!",
  },
  {
    sentence: "I see a dog.",
    words: ["I", "see", "a", "dog."],
    emoji: "🐶",
    meaning: "Looking at a dog!",
  },
  {
    sentence: "The sun is hot.",
    words: ["The", "sun", "is", "hot."],
    emoji: "☀️",
    meaning: "The sun feels warm!",
  },
  {
    sentence: "Birds can fly.",
    words: ["Birds", "can", "fly."],
    emoji: "🐦",
    meaning: "Birds move through the air!",
  },
  {
    sentence: "I like to read.",
    words: ["I", "like", "to", "read."],
    emoji: "📚",
    meaning: "Reading is fun!",
  },
  {
    sentence: "The tree is tall.",
    words: ["The", "tree", "is", "tall."],
    emoji: "🌳",
    meaning: "A very high tree!",
  },
  {
    sentence: "Fish swim fast.",
    words: ["Fish", "swim", "fast."],
    emoji: "🐟",
    meaning: "Fish move quickly in water!",
  },
  {
    sentence: "We play games.",
    words: ["We", "play", "games."],
    emoji: "🎮",
    meaning: "Having fun together!",
  },
  {
    sentence: "The moon shines.",
    words: ["The", "moon", "shines."],
    emoji: "🌙",
    meaning: "The moon gives light!",
  },
  {
    sentence: "I love my mom.",
    words: ["I", "love", "my", "mom."],
    emoji: "❤️",
    meaning: "Caring about family!",
  },
]

export default function SentencesPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set())
  const [showSticker, setShowSticker] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "build">("learn")
  const [sentenceWords, setSentenceWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])

  const currentSentence = sentences[currentIndex]

  useEffect(() => {
    const saved = localStorage.getItem("completed-sentences")
    if (saved) {
      setCompletedSentences(new Set(JSON.parse(saved)))
    }
  }, [])

  useEffect(() => {
    if (gameMode === "build") {
      // Shuffle words for sentence building
      const words = [...currentSentence.words]
      const shuffled = words.sort(() => Math.random() - 0.5)
      setAvailableWords(shuffled)
      setSentenceWords([])
    }
  }, [currentIndex, gameMode, currentSentence.words])

  const playSentence = () => {
    const utterance = new SpeechSynthesisUtterance(currentSentence.sentence)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const playWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word.replace(".", ""))
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const markComplete = () => {
    const newCompleted = new Set(completedSentences)
    newCompleted.add(currentIndex)
    setCompletedSentences(newCompleted)
    localStorage.setItem("completed-sentences", JSON.stringify([...newCompleted]))

    // Update overall progress
    const progress = JSON.parse(localStorage.getItem("phonics-progress") || "{}")
    progress.sentences = newCompleted.size
    progress.totalStickers = (progress.totalStickers || 0) + 1
    localStorage.setItem("phonics-progress", JSON.stringify(progress))

    setShowSticker(true)
    setTimeout(() => setShowSticker(false), 2000)
  }

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setGameMode("learn")
    }
  }

  const prevSentence = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setGameMode("learn")
    }
  }

  const addWordToSentence = (word: string, index: number) => {
    setSentenceWords([...sentenceWords, word])
    setAvailableWords(availableWords.filter((_, i) => i !== index))
  }

  const removeWordFromSentence = (index: number) => {
    const word = sentenceWords[index]
    setSentenceWords(sentenceWords.filter((_, i) => i !== index))
    setAvailableWords([...availableWords, word])
  }

  const checkSentence = () => {
    if (sentenceWords.join(" ") === currentSentence.sentence) {
      markComplete()
      setGameMode("learn")
    }
  }

  const progress = (completedSentences.size / sentences.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-xl">
              <Home className="w-6 h-6 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">💬 Simple Sentences 💬</h1>
          <div className="w-24" />
        </div>

        {/* Progress */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>
              Progress: {completedSentences.size}/{sentences.length}
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
              onClick={() => setGameMode("build")}
              variant={gameMode === "build" ? "default" : "ghost"}
              size="lg"
              className="text-xl"
            >
              🔨 Build
            </Button>
          </div>
        </div>

        {/* Main Learning Card */}
        <Card className="bg-white/95 shadow-2xl mb-6">
          <CardContent className="p-8 text-center">
            {gameMode === "learn" ? (
              <div className="space-y-6">
                {/* Sentence Display */}
                <div className="text-8xl mb-4">{currentSentence.emoji}</div>
                <div className="text-4xl font-bold text-indigo-600 mb-4">{currentSentence.sentence}</div>

                {/* Meaning */}
                <div className="bg-yellow-100 rounded-2xl p-4 text-xl text-gray-700">{currentSentence.meaning}</div>

                {/* Sound Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={playSentence}
                    size="lg"
                    className="text-2xl py-6 px-8 bg-green-500 hover:bg-green-600"
                  >
                    <Volume2 className="w-8 h-8 mr-3" />
                    Read Sentence
                  </Button>

                  <div className="flex justify-center gap-3 flex-wrap">
                    {currentSentence.words.map((word, index) => (
                      <Button
                        key={index}
                        onClick={() => playWord(word)}
                        size="lg"
                        variant="outline"
                        className="text-xl py-4 px-4 font-bold"
                      >
                        {word}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Complete Button */}
                {!completedSentences.has(currentIndex) && (
                  <Button
                    onClick={markComplete}
                    size="lg"
                    className="text-2xl py-6 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                  >
                    <Star className="w-8 h-8 mr-3" />I Can Read This!
                  </Button>
                )}

                {completedSentences.has(currentIndex) && (
                  <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                    <Star className="w-8 h-8 mr-2 fill-current" />
                    Excellent Reading! ⭐
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sentence Building Game */}
                <div className="text-6xl mb-4">{currentSentence.emoji}</div>
                <div className="text-2xl font-bold text-gray-700 mb-4">Build the sentence!</div>
                <div className="bg-yellow-100 rounded-2xl p-4 text-lg text-gray-700 mb-4">
                  {currentSentence.meaning}
                </div>

                {/* Sentence Building Area */}
                <div className="bg-gray-100 rounded-2xl p-6 min-h-20 flex items-center justify-center gap-2 flex-wrap">
                  {sentenceWords.map((word, index) => (
                    <Button
                      key={index}
                      onClick={() => removeWordFromSentence(index)}
                      size="lg"
                      className="text-xl py-4 px-4 font-bold bg-blue-500 hover:bg-blue-600"
                    >
                      {word}
                    </Button>
                  ))}
                  {sentenceWords.length === 0 && (
                    <div className="text-gray-500 text-xl">Click words below to build the sentence</div>
                  )}
                </div>

                {/* Available Words */}
                <div className="flex flex-wrap justify-center gap-3">
                  {availableWords.map((word, index) => (
                    <Button
                      key={index}
                      onClick={() => addWordToSentence(word, index)}
                      size="lg"
                      variant="outline"
                      className="text-xl py-4 px-4 font-bold"
                    >
                      {word}
                    </Button>
                  ))}
                </div>

                {/* Check Button */}
                {sentenceWords.length === currentSentence.words.length && (
                  <Button
                    onClick={checkSentence}
                    size="lg"
                    className="text-2xl py-6 px-8 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
                  >
                    <Check className="w-8 h-8 mr-3" />
                    Check Sentence!
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevSentence}
            disabled={currentIndex === 0}
            size="lg"
            variant="outline"
            className="text-xl py-6 px-8"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Previous
          </Button>

          <div className="text-2xl font-bold text-white">
            {currentIndex + 1} / {sentences.length}
          </div>

          <Button
            onClick={nextSentence}
            disabled={currentIndex === sentences.length - 1}
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
