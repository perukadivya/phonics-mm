"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Volume2, Star, ArrowLeft, ArrowRight, Home, Check, X } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import TaskNavButtons from "@/components/ui/task-nav-buttons"
import type { UserProgress } from "@/lib/stages"

const words = [
  { word: "HOUSE", sounds: ["H", "OU", "SE"], emoji: "🏠", meaning: "Where people live!" },
  { word: "APPLE", sounds: ["A", "PP", "LE"], emoji: "🍎", meaning: "A red or green fruit!" },
  { word: "HAPPY", sounds: ["H", "A", "PP", "Y"], emoji: "😊", meaning: "Feeling good and joyful!" },
  { word: "WATER", sounds: ["W", "A", "T", "ER"], emoji: "💧", meaning: "What we drink!" },
  { word: "PLANT", sounds: ["P", "L", "A", "NT"], emoji: "🌱", meaning: "Something green that grows!" },
  { word: "SMILE", sounds: ["S", "M", "I", "LE"], emoji: "😄", meaning: "What you do when happy!" },
  { word: "HEART", sounds: ["H", "EAR", "T"], emoji: "❤️", meaning: "What pumps blood in your body!" },
  { word: "LIGHT", sounds: ["L", "IGH", "T"], emoji: "💡", meaning: "What helps us see!" },
  { word: "MUSIC", sounds: ["M", "U", "S", "IC"], emoji: "🎵", meaning: "Sounds that make songs!" },
  { word: "BEACH", sounds: ["B", "EA", "CH"], emoji: "🏖️", meaning: "Sandy place by the ocean!" },
  { word: "BREAD", sounds: ["B", "R", "EA", "D"], emoji: "🍞", meaning: "Food made from flour!" },
  { word: "CHAIR", sounds: ["CH", "AI", "R"], emoji: "🪑", meaning: "Something to sit on!" },
]

export default function FiveLetterWordsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set())
  const [showSticker, setShowSticker] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "type">("learn")
  const [typedWord, setTypedWord] = useState("")
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null)

  const { status: sessionStatus } = useSession(); // Removed 'data: session'
  const isAuthenticated = sessionStatus === "authenticated";
  const [userProgressData, setUserProgressData] = useState<UserProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const currentWord = words[currentIndex]

  useEffect(() => {
    // Load completed items for this stage (local state for UI)
    const savedCompleted = localStorage.getItem("completed-five-letter-words");
    if (savedCompleted) {
      setCompletedWords(new Set(JSON.parse(savedCompleted)));
    }

    // Load overall user progress for navigation and unlock logic
    if (isAuthenticated) {
      setIsLoadingProgress(true);
      fetch("/api/progress")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch progress");
          return res.json();
        })
        .then((data) => {
          setUserProgressData({
            letters: data.letters_progress ?? 0,
            threeLetterWords: data.three_letter_words_progress ?? 0,
            fourLetterWords: data.four_letter_words_progress ?? 0,
            fiveLetterWords: data.five_letter_words_progress ?? 0,
            sentences: data.sentences_progress ?? 0,
            totalStickers: data.total_stickers ?? 0,
            currentStreak: data.current_streak ?? 0,
          });
        })
        .catch((error) => {
          console.error("Error fetching user progress for 5-letter page:", error);
          setUserProgressData(null); 
        })
        .finally(() => setIsLoadingProgress(false));
    } else {
      setIsLoadingProgress(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (gameMode === "type") {
      setTypedWord("")
      setShowResult(null)
    }
  }, [currentIndex, gameMode])

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
      OU: "ow",
      PP: "puh",
      LE: "ul",
      ER: "er",
      NT: "nt",
      CH: "ch",
      AI: "ay",
      EA: "ee",
      IGH: "eye",
      IC: "ik",
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
    localStorage.setItem("completed-five-letter-words", JSON.stringify([...newCompleted]))

    // Update overall progress
    const newFiveLetterWordsProgressCount = newCompleted.size;
    const stickersEarned = 1; // Earned for completing this specific word/task

    if (isAuthenticated) {
      const currentProgressForAPI = userProgressData || {
        letters: 0, threeLetterWords: 0, fourLetterWords: 0, fiveLetterWords: 0, sentences: 0, totalStickers: 0, currentStreak: 0
      };
      
      const updatedProgressPayload = {
        letters_progress: currentProgressForAPI.letters,
        three_letter_words_progress: currentProgressForAPI.threeLetterWords,
        four_letter_words_progress: currentProgressForAPI.fourLetterWords,
        five_letter_words_progress: Math.max(currentProgressForAPI.fiveLetterWords, newFiveLetterWordsProgressCount),
        sentences_progress: currentProgressForAPI.sentences,
        total_stickers: (currentProgressForAPI.totalStickers || 0) + stickersEarned,
      };

      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProgressPayload),
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save progress');
        return res.json();
      })
      .then(savedData => {
        setUserProgressData({
            letters: savedData.letters_progress ?? 0,
            threeLetterWords: savedData.three_letter_words_progress ?? 0,
            fourLetterWords: savedData.four_letter_words_progress ?? 0,
            fiveLetterWords: savedData.five_letter_words_progress ?? 0,
            sentences: savedData.sentences_progress ?? 0,
            totalStickers: savedData.total_stickers ?? 0,
            currentStreak: savedData.current_streak ?? 0,
        });
        console.log("Progress updated via API for 5-letter page.");
      })
      .catch(error => console.error("Error updating API progress from 5-letter page:", error));
    } else {
      const localOverallProgress = JSON.parse(localStorage.getItem("phonics-progress") || "{}");
      localOverallProgress.fiveLetterWords = newFiveLetterWordsProgressCount;
      localOverallProgress.totalStickers = (localOverallProgress.totalStickers || 0) + stickersEarned;
      localStorage.setItem("phonics-progress", JSON.stringify(localOverallProgress));
      console.log("Progress updated in localStorage for unauthenticated user (5-letter page).");
    }

    setShowSticker(true);
    setTimeout(() => setShowSticker(false), 2000);
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

  const checkTypedWord = () => {
    if (typedWord.toUpperCase() === currentWord.word) {
      setShowResult("correct")
      setTimeout(() => {
        markComplete()
        setGameMode("learn")
      }, 1500)
    } else {
      setShowResult("incorrect")
      setTimeout(() => setShowResult(null), 1500)
    }
  }

  const progress = (completedWords.size / words.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-xl">
              <Home className="w-6 h-6 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">🌟 5-Letter Words 🌟</h1>
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
              onClick={() => setGameMode("type")}
              variant={gameMode === "type" ? "default" : "ghost"}
              size="lg"
              className="text-xl"
            >
              ⌨️ Type
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
                <div className="text-6xl font-bold text-purple-600 mb-4">{currentWord.word}</div>

                {/* Meaning */}
                <div className="bg-yellow-100 rounded-2xl p-4 text-xl text-gray-700">{currentWord.meaning}</div>

                {/* Sound Buttons */}
                <div className="space-y-4">
                  <Button onClick={playWord} size="lg" className="text-2xl py-6 px-8 bg-green-500 hover:bg-green-600">
                    <Volume2 className="w-8 h-8 mr-3" />
                    Say Word
                  </Button>

                  <div className="flex justify-center gap-3 flex-wrap">
                    {currentWord.sounds.map((sound, index) => (
                      <Button
                        key={index}
                        onClick={() => playSound(sound)}
                        size="lg"
                        variant="outline"
                        className="text-xl py-4 px-4 font-bold"
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
                {/* Typing Game */}
                <div className="text-6xl mb-4">{currentWord.emoji}</div>
                <div className="text-2xl font-bold text-gray-700 mb-4">Listen and type the word!</div>
                <div className="bg-yellow-100 rounded-2xl p-4 text-lg text-gray-700 mb-4">{currentWord.meaning}</div>

                <Button onClick={playWord} size="lg" className="text-xl py-4 px-6 bg-blue-500 hover:bg-blue-600 mb-6">
                  <Volume2 className="w-6 h-6 mr-2" />
                  Play Word
                </Button>

                <div className="space-y-4">
                  <Input
                    value={typedWord}
                    onChange={(e) => setTypedWord(e.target.value)}
                    placeholder="Type the word here..."
                    className="text-2xl py-6 text-center font-bold"
                    maxLength={5}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && typedWord.length === 5) {
                        checkTypedWord()
                      }
                    }}
                  />

                  {typedWord.length === 5 && !showResult && (
                    <Button
                      onClick={checkTypedWord}
                      size="lg"
                      className="text-2xl py-6 px-8 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
                    >
                      Check Word!
                    </Button>
                  )}

                  {showResult === "correct" && (
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center animate-bounce">
                      <Check className="w-8 h-8 mr-2" />
                      Correct! Amazing! 🎉
                    </div>
                  )}

                  {showResult === "incorrect" && (
                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
                      <X className="w-6 h-6 mr-2" />
                      Try again! You can do it! 💪
                    </div>
                  )}
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

        <TaskNavButtons 
          currentStageId="five-letter" 
          userProgressData={userProgressData}
          isAuthenticated={isAuthenticated}
          isLoadingProgress={isLoadingProgress}
        />
      </div>
    </div>
  )
}
