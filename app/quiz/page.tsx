"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Star,
  Brain,
  HelpCircle,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import { Confetti } from "@/components/confetti"
import { useProgress } from "@/hooks/useProgress"
import { QUIZ_BANK, type PhonicsQuizItem } from "@/lib/phonics-data"
import {
  playPopSound,
  playStarSound,
  playSuccessSound,
  playWrongSound,
  playCheerSound,
  playClickSound,
  speakText,
} from "@/lib/audio"

type QuizLevel = "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences"

const LEVELS: { key: QuizLevel; label: string; emoji: string; desc: string }[] = [
  { key: "letters", label: "Letters", emoji: "🔤", desc: "Letter sounds" },
  { key: "three-letter", label: "3-Letter", emoji: "📝", desc: "CVC words" },
  { key: "four-letter", label: "4-Letter", emoji: "📚", desc: "Blends & digraphs" },
  { key: "five-letter", label: "5-Letter", emoji: "🌟", desc: "Longer words" },
  { key: "sentences", label: "Sentences", emoji: "💬", desc: "Reading comprehension" },
]

export default function QuizPage() {
  const { progress: userProgress, updateProgress } = useProgress()
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>("letters")
  const [questions, setQuestions] = useState<PhonicsQuizItem[]>(QUIZ_BANK.letters)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(string | number)[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [spelledAnswer, setSpelledAnswer] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Ensure current question is always defined
  const currentQuestion: PhonicsQuizItem = questions[currentIndex] || QUIZ_BANK.letters[0]

  useEffect(() => {
    loadQuestionsForLevel(selectedLevel)
  }, [selectedLevel])

  const loadQuestionsForLevel = async (level: QuizLevel) => {
    setIsLoading(true)
    setCurrentIndex(0)
    setUserAnswers([])
    setSelectedOption(null)
    setSpelledAnswer([])
    setShowFeedback(false)
    setScore(0)
    setIsCompleted(false)

    // Immediate fallback from curated bank
    const fallback = QUIZ_BANK[level] || QUIZ_BANK.letters
    setQuestions(fallback)

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quiz", level, count: 5 }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.content) && data.content.length > 0) {
          setQuestions(data.content)
        }
      }
    } catch {
      // Fallback already active
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPrompt = () => {
    playPopSound()
    speakText(currentQuestion.soundPrompt || currentQuestion.question, { rate: 0.82, pitch: 1.2 })
  }

  const handleSelectOption = (idx: number) => {
    if (showFeedback) return
    setSelectedOption(idx)
    playPopSound()

    const isCorrect = idx === currentQuestion.correct
    setIsAnswerCorrect(isCorrect)
    setShowFeedback(true)

    if (isCorrect) {
      playSuccessSound()
      setScore((s) => s + 1)
    } else {
      playWrongSound()
    }
  }

  const handleAddSpellingLetter = (letter: string) => {
    if (showFeedback) return
    playPopSound()
    const targetLength = currentQuestion.answer?.length || 3
    if (spelledAnswer.length >= targetLength) return

    const updated = [...spelledAnswer, letter]
    setSpelledAnswer(updated)

    if (updated.length === targetLength) {
      const spelling = updated.join("")
      const isCorrect = spelling === currentQuestion.answer
      setIsAnswerCorrect(isCorrect)
      setShowFeedback(true)

      if (isCorrect) {
        playSuccessSound()
        setScore((s) => s + 1)
      } else {
        playWrongSound()
      }
    }
  }

  const handleClearSpelling = () => {
    playPopSound()
    setSpelledAnswer([])
    setShowFeedback(false)
  }

  const handleNextQuestion = () => {
    playPopSound()
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setSpelledAnswer([])
      setShowFeedback(false)
    } else {
      // Quiz finished
      setIsCompleted(true)
      playCheerSound()
      setShowConfetti(true)

      // Award stars to progress
      const starsEarned = score + (isAnswerCorrect ? 1 : 0)
      if (starsEarned > 0) {
        updateProgress({ totalStickers: userProgress.totalStickers + starsEarned })
      }
    }
  }

  const handleRestart = () => {
    playPopSound()
    loadQuestionsForLevel(selectedLevel)
  }

  const progressPercent = ((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100

  // Keyboard for spelling questions
  const spellingOptions = currentQuestion.answer
    ? [
        ...currentQuestion.answer.split(""),
        ..."BCDFGHJKLMNPQRSTVWXYZ".split("").filter((l) => !currentQuestion.answer?.includes(l)).slice(0, 4),
      ].sort(() => 0.5 - Math.random())
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 p-3 sm:p-5 relative overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-4xl mx-auto relative z-10">
        <NavBar />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-2">
              <span>🧠</span>
              <span>AI Phonics Quiz</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90">
              Listen, sound out, and choose the correct answer to win stickers!
            </p>
          </div>

          <Button
            onClick={handleRestart}
            variant="outline"
            size="sm"
            className="rounded-2xl font-bold bg-white/90 hover:bg-white text-purple-700 shadow-md border-0 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            New Quiz
          </Button>
        </div>

        {/* Level Switcher */}
        <div className="glass rounded-3xl p-3 mb-5 shadow-lg border-2 border-white/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {LEVELS.map((lvl) => {
              const active = selectedLevel === lvl.key
              return (
                <button
                  key={lvl.key}
                  onClick={() => {
                    playPopSound()
                    setSelectedLevel(lvl.key)
                  }}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 select-none active:scale-95 cursor-pointer ${
                    active
                      ? "bg-fuchsia-600 text-white shadow-md scale-105 ring-4 ring-fuchsia-200"
                      : "bg-white/80 hover:bg-white text-purple-900"
                  }`}
                >
                  <span>{lvl.emoji}</span>
                  <span>{lvl.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {!isCompleted ? (
          <>
            {/* Progress Bar */}
            <div className="glass rounded-2xl p-3.5 mb-5 shadow-md border-2 border-white/60">
              <div className="flex justify-between items-center text-xs sm:text-sm font-black text-purple-950 mb-1.5">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="flex items-center gap-1 text-purple-700">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                  <span>Score: {score}</span>
                </span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-purple-100" />
            </div>

            {/* Quiz Question Card */}
            <Card className="glass rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 animate-slideUp">
              <CardContent className="p-6 sm:p-8">
                <div className="max-w-xl mx-auto space-y-6">
                  {/* Question & Audio Read Aloud */}
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-snug">
                      {currentQuestion.question}
                    </h2>

                    <Button
                      onClick={handlePlayPrompt}
                      size="sm"
                      className="rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold px-4 py-2 border border-purple-200 active:scale-95"
                    >
                      <Volume2 className="w-4 h-4 mr-1.5 text-purple-600" />
                      Listen Aloud 🔊
                    </Button>
                  </div>

                  {/* Multiple Choice Layout */}
                  {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, idx) => {
                        const isChosen = selectedOption === idx
                        const isCorrectOpt = idx === currentQuestion.correct

                        let btnStyle = "bg-white hover:bg-purple-50 text-gray-800 border-2 border-purple-100"
                        if (showFeedback) {
                          if (isCorrectOpt) {
                            btnStyle = "bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-300"
                          } else if (isChosen) {
                            btnStyle = "bg-rose-100 text-rose-800 border-2 border-rose-400 ring-2 ring-rose-200"
                          } else {
                            btnStyle = "bg-white/60 text-gray-400 border-gray-100 opacity-60"
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
                            disabled={showFeedback}
                            className={`p-4 rounded-2xl font-black text-xl sm:text-2xl text-center shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-sm flex items-center justify-center font-bold">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1 text-center font-black">{opt}</span>
                            {showFeedback && isCorrectOpt && (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            )}
                            {showFeedback && isChosen && !isCorrectOpt && (
                              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Spelling Question Layout */}
                  {currentQuestion.type === "spelling" && currentQuestion.answer && (
                    <div className="space-y-4">
                      {/* Slots */}
                      <div className="flex justify-center gap-2">
                        {currentQuestion.answer.split("").map((_, slotIdx) => {
                          const char = spelledAnswer[slotIdx]
                          return (
                            <div
                              key={slotIdx}
                              className={`w-16 h-20 rounded-2xl font-black text-3xl shadow-inner border-4 flex items-center justify-center transition-all ${
                                char
                                  ? showFeedback
                                    ? isAnswerCorrect
                                      ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                                      : "bg-rose-100 border-rose-400 text-rose-800"
                                    : "bg-white border-purple-300 text-purple-900"
                                  : "bg-white/60 border-dashed border-gray-300 text-gray-300"
                              }`}
                            >
                              {char || "?"}
                            </div>
                          )
                        })}
                      </div>

                      {/* Letter Tiles */}
                      {!showFeedback && (
                        <div className="flex justify-center gap-2 flex-wrap">
                          {spellingOptions.map((letter, i) => (
                            <button
                              key={i}
                              onClick={() => handleAddSpellingLetter(letter)}
                              className="w-12 h-12 rounded-2xl font-black text-xl bg-white hover:bg-purple-100 text-purple-900 shadow-md border-2 border-purple-200 transition-all active:scale-75 cursor-pointer"
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                      )}

                      {!showFeedback && spelledAnswer.length > 0 && (
                        <div className="text-center">
                          <Button
                            onClick={handleClearSpelling}
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs bg-white text-gray-600"
                          >
                            Clear Letters
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback Banner */}
                  {showFeedback && (
                    <div
                      className={`p-4 rounded-2xl animate-pop ${
                        isAnswerCorrect
                          ? "bg-emerald-100 border-2 border-emerald-300 text-emerald-900"
                          : "bg-amber-100 border-2 border-amber-300 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-lg mb-1">
                        {isAnswerCorrect ? (
                          <>
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <span>Correct! Fantastic phonics skill!</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-6 h-6 text-amber-600" />
                            <span>Good try! Keep learning!</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm font-semibold">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {/* Next Question Button */}
                  {showFeedback && (
                    <div className="text-center pt-2">
                      <Button
                        onClick={handleNextQuestion}
                        size="lg"
                        className="btn-chunky text-xl py-6 px-10 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xl active:scale-95"
                      >
                        {currentIndex < questions.length - 1 ? "Next Question →" : "See Results! 🏆"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* QUIZ COMPLETED CELEBRATION CARD */
          <Card className="glass rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 animate-pop text-center p-8">
            <CardContent className="space-y-6">
              <div className="text-8xl select-none animate-bounce-slow">🏆</div>
              <div>
                <h2 className="text-4xl font-black text-purple-950 mb-1">Quiz Completed!</h2>
                <p className="text-base font-bold text-purple-700">
                  You scored <strong className="text-3xl text-yellow-600">{score}</strong> out of{" "}
                  <strong className="text-3xl text-purple-950">{questions.length}</strong>!
                </p>
              </div>

              {/* Star Rating Display */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((starIdx) => {
                  const hasStar = score >= starIdx * Math.floor(questions.length / 3)
                  return (
                    <Star
                      key={starIdx}
                      className={`w-12 h-12 transition-all ${
                        hasStar
                          ? "text-yellow-400 fill-yellow-400 animate-sparkle"
                          : "text-gray-300"
                      }`}
                    />
                  )
                })}
              </div>

              {/* Message */}
              <div className="bg-white/90 rounded-2xl p-4 shadow-sm border border-purple-200 max-w-md mx-auto">
                <p className="font-bold text-gray-800 text-sm">
                  {score === questions.length
                    ? "🌟 PERFECT SCORE! You are a Phonics Grandmaster! All stars awarded!"
                    : score >= questions.length / 2
                      ? "🎉 Super job! You have wonderful phonics instincts. Keep practicing!"
                      : "💪 Nice practice! Every quiz makes your reading superpowers grow!"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  onClick={handleRestart}
                  size="lg"
                  className="rounded-2xl font-black text-lg py-5 px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-lg active:scale-95"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mascot */}
        <div className="mt-8 flex justify-center">
          <Mascot
            character="owl"
            message="Phonics quizzes train your brain to hear sounds in every word! You are doing great!"
          />
        </div>
      </div>
    </div>
  )
}
