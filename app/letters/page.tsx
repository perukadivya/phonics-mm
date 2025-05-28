"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Volume2, Star, ArrowLeft, ArrowRight, Home } from "lucide-react"
import Link from "next/link"

const letters = [
  { letter: "A", sound: "ah", word: "Apple", emoji: "🍎" },
  { letter: "B", sound: "buh", word: "Ball", emoji: "⚽" },
  { letter: "C", sound: "kuh", word: "Cat", emoji: "🐱" },
  { letter: "D", sound: "duh", word: "Dog", emoji: "🐶" },
  { letter: "E", sound: "eh", word: "Egg", emoji: "🥚" },
  { letter: "F", sound: "fuh", word: "Fish", emoji: "🐟" },
  { letter: "G", sound: "guh", word: "Goat", emoji: "🐐" },
  { letter: "H", sound: "huh", word: "Hat", emoji: "👒" },
  { letter: "I", sound: "ih", word: "Ice", emoji: "🧊" },
  { letter: "J", sound: "juh", word: "Jam", emoji: "🍯" },
  { letter: "K", sound: "kuh", word: "Kite", emoji: "🪁" },
  { letter: "L", sound: "luh", word: "Lion", emoji: "🦁" },
  { letter: "M", sound: "muh", word: "Moon", emoji: "🌙" },
  { letter: "N", sound: "nuh", word: "Nest", emoji: "🪺" },
  { letter: "O", sound: "oh", word: "Orange", emoji: "🍊" },
  { letter: "P", sound: "puh", word: "Pig", emoji: "🐷" },
  { letter: "Q", sound: "kwuh", word: "Queen", emoji: "👸" },
  { letter: "R", sound: "ruh", word: "Robot", emoji: "🤖" },
  { letter: "S", sound: "sss", word: "Sun", emoji: "☀️" },
  { letter: "T", sound: "tuh", word: "Tree", emoji: "🌳" },
  { letter: "U", sound: "uh", word: "Umbrella", emoji: "☂️" },
  { letter: "V", sound: "vuh", word: "Van", emoji: "🚐" },
  { letter: "W", sound: "wuh", word: "Water", emoji: "💧" },
  { letter: "X", sound: "ks", word: "Box", emoji: "📦" },
  { letter: "Y", sound: "yuh", word: "Yellow", emoji: "💛" },
  { letter: "Z", sound: "zzz", word: "Zebra", emoji: "🦓" },
]

export default function LettersPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedLetters, setCompletedLetters] = useState<Set<number>>(new Set())
  const [showSticker, setShowSticker] = useState(false)

  const currentLetter = letters[currentIndex]

  useEffect(() => {
    const saved = localStorage.getItem("completed-letters")
    if (saved) {
      setCompletedLetters(new Set(JSON.parse(saved)))
    }
  }, [])

  const playSound = () => {
    // Use actual phonetic sounds instead of written symbols
    const phoneticSounds: { [key: string]: string } = {
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
    }

    const utterance = new SpeechSynthesisUtterance(phoneticSounds[currentLetter.letter] || currentLetter.letter)
    utterance.rate = 0.6
    utterance.pitch = 1.2
    speechSynthesis.speak(utterance)
  }

  const playWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentLetter.word)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const markComplete = () => {
    const newCompleted = new Set(completedLetters)
    newCompleted.add(currentIndex)
    setCompletedLetters(newCompleted)
    localStorage.setItem("completed-letters", JSON.stringify([...newCompleted]))

    // Update overall progress
    const progress = JSON.parse(localStorage.getItem("phonics-progress") || "{}")
    progress.letters = newCompleted.size
    progress.totalStickers = (progress.totalStickers || 0) + 1
    localStorage.setItem("phonics-progress", JSON.stringify(progress))

    setShowSticker(true)
    setTimeout(() => setShowSticker(false), 2000)
  }

  const nextLetter = () => {
    if (currentIndex < letters.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevLetter = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const progress = (completedLetters.size / letters.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-xl">
              <Home className="w-6 h-6 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">🔤 Letter Sounds 🔤</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Progress */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>
              Progress: {completedLetters.size}/{letters.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Main Learning Card */}
        <Card className="bg-white/95 shadow-2xl mb-6">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              {/* Letter Display */}
              <div className="text-9xl font-bold text-purple-600 mb-4">{currentLetter.letter}</div>

              {/* Sound */}
              <div className="space-y-4">
                <Button onClick={playSound} size="lg" className="text-2xl py-6 px-8 bg-green-500 hover:bg-green-600">
                  <Volume2 className="w-8 h-8 mr-3" />
                  Play Sound: {currentLetter.sound}
                </Button>
              </div>

              {/* Word Example */}
              <div className="bg-yellow-100 rounded-2xl p-6">
                <div className="text-6xl mb-4">{currentLetter.emoji}</div>
                <div className="text-3xl font-bold text-gray-800 mb-4">{currentLetter.word}</div>
                <Button onClick={playWord} size="lg" className="text-xl py-4 px-6 bg-blue-500 hover:bg-blue-600">
                  <Volume2 className="w-6 h-6 mr-2" />
                  Say Word
                </Button>
              </div>

              {/* Complete Button */}
              {!completedLetters.has(currentIndex) && (
                <Button
                  onClick={markComplete}
                  size="lg"
                  className="text-2xl py-6 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                >
                  <Star className="w-8 h-8 mr-3" />I Know This Letter!
                </Button>
              )}

              {completedLetters.has(currentIndex) && (
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                  <Star className="w-8 h-8 mr-2 fill-current" />
                  Great Job! ⭐
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevLetter}
            disabled={currentIndex === 0}
            size="lg"
            variant="outline"
            className="text-xl py-6 px-8"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Previous
          </Button>

          <div className="text-2xl font-bold text-white">
            {currentIndex + 1} / {letters.length}
          </div>

          <Button
            onClick={nextLetter}
            disabled={currentIndex === letters.length - 1}
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
