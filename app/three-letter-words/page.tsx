"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Volume2, Star, ArrowLeft, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import TaskNavButtons from "@/components/ui/task-nav-buttons"
import type { UserProgress } from "@/lib/stages"

const words = [
  { word: "CAT", sounds: ["C", "A", "T"], emoji: "🐱", meaning: "A furry pet that says meow!" },
  { word: "DOG", sounds: ["D", "O", "G"], emoji: "🐶", meaning: "A friendly pet that barks!" },
  { word: "SUN", sounds: ["S", "U", "N"], emoji: "☀️", meaning: "The bright star in the sky!" },
  { word: "BAT", sounds: ["B", "A", "T"], emoji: "🦇", meaning: "A flying animal!" },
  { word: "HAT", sounds: ["H", "A", "T"], emoji: "👒", meaning: "Something you wear on your head!" },
  { word: "BED", sounds: ["B", "E", "D"], emoji: "🛏️", meaning: "Where you sleep!" },
  { word: "RED", sounds: ["R", "E", "D"], emoji: "🔴", meaning: "A bright color!" },
  { word: "BIG", sounds: ["B", "I", "G"], emoji: "🐘", meaning: "Very large!" },
  { word: "RUN", sounds: ["R", "U", "N"], emoji: "🏃", meaning: "To move very fast!" },
  { word: "FUN", sounds: ["F", "U", "N"], emoji: "🎉", meaning: "Something enjoyable!" },
  { word: "CUP", sounds: ["C", "U", "P"], emoji: "☕", meaning: "Something to drink from!" },
  { word: "BUS", sounds: ["B", "U", "S"], emoji: "🚌", meaning: "A big vehicle!" },
  { word: "EGG", sounds: ["E", "G", "G"], emoji: "🥚", meaning: "What chickens lay!" },
  { word: "PIG", sounds: ["P", "I", "G"], emoji: "🐷", meaning: "A pink farm animal!" },
  { word: "BOX", sounds: ["B", "O", "X"], emoji: "📦", meaning: "Something to put things in!" },
  { word: "TOY", sounds: ["T", "O", "Y"], emoji: "🧸", meaning: "Something fun to play with!" },
  { word: "BAG", sounds: ["B", "A", "G"], emoji: "👜", meaning: "Something to carry things!" },
  { word: "CAR", sounds: ["C", "A", "R"], emoji: "🚗", meaning: "A vehicle with wheels!" },
  { word: "TOP", sounds: ["T", "O", "P"], emoji: "🔝", meaning: "The highest part!" },
  { word: "NET", sounds: ["N", "E", "T"], emoji: "🥅", meaning: "Something with holes!" },
]

export default function ThreeLetterWordsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set())
  const [showSticker, setShowSticker] = useState(false)
  const [gameMode, setGameMode] = useState<"learn" | "spell">("learn")
  const [draggedLetters, setDraggedLetters] = useState<string[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])

  const { status: sessionStatus } = useSession(); // Removed 'data: session'
  const isAuthenticated = sessionStatus === "authenticated";
  const [userProgressData, setUserProgressData] = useState<UserProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const currentWord = words[currentIndex]

  useEffect(() => {
    // Load completed items for this stage (local state for UI)
    const savedCompleted = localStorage.getItem("completed-three-letter-words");
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
          console.error("Error fetching user progress for 3-letter page:", error);
          setUserProgressData(null); 
        })
        .finally(() => setIsLoadingProgress(false));
    } else {
      setIsLoadingProgress(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (gameMode === "spell") {
      // Shuffle letters for spelling game
      const wordLetters = [...currentWord.sounds]
      const extraLetters = [
        "A",
        "E",
        "I",
        "O",
        "U",
        "B",
        "C",
        "D",
        "F",
        "G",
        "H",
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ]
        .filter((letter) => !wordLetters.includes(letter))
        .slice(0, 3)

      const allLetters = [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5)
      setAvailableLetters(allLetters)
      setDraggedLetters([])
    }
  }, [currentIndex, gameMode, currentWord.sounds])

  const playWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const playLetter = (letter: string) => {
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

    const utterance = new SpeechSynthesisUtterance(phoneticSounds[letter] || letter)
    utterance.rate = 0.6
    utterance.pitch = 1.2
    speechSynthesis.speak(utterance)
  }

  const markComplete = () => {
    const newCompleted = new Set(completedWords)
    newCompleted.add(currentIndex)
    setCompletedWords(newCompleted)
    localStorage.setItem("completed-three-letter-words", JSON.stringify([...newCompleted]))

    // Update overall progress
    const newThreeLetterWordsProgressCount = newCompleted.size;
    const stickersEarned = 1;

    if (isAuthenticated) {
      const currentProgressForAPI = userProgressData || {
        letters: 0, threeLetterWords: 0, fourLetterWords: 0, fiveLetterWords: 0, sentences: 0, totalStickers: 0, currentStreak: 0
      };
      
      const updatedProgressPayload = {
        letters_progress: currentProgressForAPI.letters,
        three_letter_words_progress: Math.max(currentProgressForAPI.threeLetterWords, newThreeLetterWordsProgressCount),
        four_letter_words_progress: currentProgressForAPI.fourLetterWords,
        five_letter_words_progress: currentProgressForAPI.fiveLetterWords,
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
        console.log("Progress updated via API for 3-letter page.");
      })
      .catch(error => console.error("Error updating API progress from 3-letter page:", error));
    } else {
      const localOverallProgress = JSON.parse(localStorage.getItem("phonics-progress") || "{}");
      localOverallProgress.threeLetterWords = newThreeLetterWordsProgressCount;
      localOverallProgress.totalStickers = (localOverallProgress.totalStickers || 0) + stickersEarned;
      localStorage.setItem("phonics-progress", JSON.stringify(localOverallProgress));
      console.log("Progress updated in localStorage for unauthenticated user (3-letter page).");
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

  const addLetter = (letter: string) => {
    if (draggedLetters.length < 3) {
      setDraggedLetters([...draggedLetters, letter])
      setAvailableLetters(availableLetters.filter((l, i) => availableLetters.indexOf(letter) !== i))
    }
  }

  const removeLetter = (index: number) => {
    const letter = draggedLetters[index]
    setDraggedLetters(draggedLetters.filter((_, i) => i !== index))
    setAvailableLetters([...availableLetters, letter])
  }

  const checkSpelling = () => {
    if (draggedLetters.join("") === currentWord.word) {
      markComplete()
      setGameMode("learn")
    }
  }

  const progress = (completedWords.size / words.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-xl">
              <Home className="w-6 h-6 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">📝 3-Letter Words 📝</h1>
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
              onClick={() => setGameMode("spell")}
              variant={gameMode === "spell" ? "default" : "ghost"}
              size="lg"
              className="text-xl"
            >
              ✏️ Spell
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

                  <div className="flex justify-center gap-4">
                    {currentWord.sounds.map((sound, index) => (
                      <Button
                        key={index}
                        onClick={() => playLetter(sound)}
                        size="lg"
                        variant="outline"
                        className="text-3xl py-6 px-6 font-bold"
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
                {/* Spelling Game */}
                <div className="text-6xl mb-4">{currentWord.emoji}</div>
                <div className="text-2xl font-bold text-gray-700 mb-4">Spell the word: {currentWord.meaning}</div>

                {/* Word Building Area */}
                <div className="bg-gray-100 rounded-2xl p-6 min-h-24 flex items-center justify-center gap-4">
                  {draggedLetters.map((letter, index) => (
                    <Button
                      key={index}
                      onClick={() => removeLetter(index)}
                      size="lg"
                      className="text-3xl py-6 px-6 font-bold bg-blue-500 hover:bg-blue-600"
                    >
                      {letter}
                    </Button>
                  ))}
                  {Array.from({ length: 3 - draggedLetters.length }).map((_, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400"
                    >
                      ?
                    </div>
                  ))}
                </div>

                {/* Available Letters */}
                <div className="flex flex-wrap justify-center gap-3">
                  {availableLetters.map((letter, index) => (
                    <Button
                      key={index}
                      onClick={() => addLetter(letter)}
                      size="lg"
                      variant="outline"
                      className="text-2xl py-4 px-4 font-bold"
                    >
                      {letter}
                    </Button>
                  ))}
                </div>

                {/* Check Button */}
                {draggedLetters.length === 3 && (
                  <Button
                    onClick={checkSpelling}
                    size="lg"
                    className="text-2xl py-6 px-8 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
                  >
                    Check Spelling!
                  </Button>
                )}
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
          currentStageId="three-letter" 
          userProgressData={userProgressData}
          isAuthenticated={isAuthenticated}
          isLoadingProgress={isLoadingProgress}
        />
      </div>
    </div>
  )
}
