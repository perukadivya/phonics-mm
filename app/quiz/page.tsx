"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Volume2, Home, RefreshCw, Check, X } from "lucide-react"
import Link from "next/link"
import { useProgress } from "@/hooks/useProgress"

interface QuizQuestion {
  question: string
  type: "multiple-choice" | "spelling"
  options?: string[]
  correct?: number
  answer?: string
  explanation?: string
  hint?: string
}

export default function QuizPage() {
  const { progress: userProgress, updateProgress } = useProgress()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<(string | number)[]>([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<
    "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences"
  >("letters")
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    generateQuiz()
  }, [selectedLevel])

  const generateQuiz = async () => {
    setIsGenerating(true)
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setShowResult(false)
    setScore(0)
    setShowFeedback(false)

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quiz", level: selectedLevel, count: 10 }),
      })

      if (response.ok) {
        const { content } = await response.json()
        setQuestions(content)
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error)
      // Fallback questions
      setQuestions([
        {
          question: "What sound does the letter B make?",
          type: "multiple-choice",
          options: ["buh", "bee", "bay", "boo"],
          correct: 0,
          explanation: "B makes the 'buh' sound!",
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const playQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const handleMultipleChoice = (optionIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setUserAnswers(newAnswers)
    setShowFeedback(true)

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const handleSpelling = () => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = currentAnswer.toUpperCase()
    setUserAnswers(newAnswers)
    setShowFeedback(true)

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const nextQuestion = () => {
    setShowFeedback(false)
    setCurrentAnswer("")

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      calculateScore()
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index]
      if (question.type === "multiple-choice" && userAnswer === question.correct) {
        correct++
      } else if (question.type === "spelling" && userAnswer === question.answer) {
        correct++
      }
    })
    setScore(correct)
    setShowResult(true)

    // Update progress
    updateProgress({ totalStickers: userProgress.totalStickers + Math.floor(correct / 2) })
  }

  const isCorrect = () => {
    const userAnswer = userAnswers[currentQuestionIndex]
    if (currentQuestion.type === "multiple-choice") {
      return userAnswer === currentQuestion.correct
    } else {
      return userAnswer === currentQuestion.answer
    }
  }

  const progress = ((currentQuestionIndex + (showFeedback ? 1 : 0)) / questions.length) * 100

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4 flex items-center justify-center">
        <Card className="bg-white/95 shadow-2xl p-8">
          <CardContent className="text-center">
            <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Generating Quiz...</h2>
            <p className="text-xl text-gray-600">Creating personalized questions for you!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {score}/{questions.length}
              </div>
              <p className="text-2xl text-gray-600 mb-6">
                {score === questions.length
                  ? "Perfect! You're amazing!"
                  : score >= questions.length * 0.8
                    ? "Great job! Keep it up!"
                    : score >= questions.length * 0.6
                      ? "Good work! Practice more!"
                      : "Keep trying! You'll get better!"}
              </p>

              <div className="space-y-4">
                <Button onClick={generateQuiz} size="lg" className="text-2xl py-6 px-8 bg-green-500 hover:bg-green-600">
                  <RefreshCw className="w-8 h-8 mr-3" />
                  Try Again
                </Button>

                <Link href="/">
                  <Button variant="outline" size="lg" className="text-2xl py-6 px-8">
                    <Home className="w-8 h-8 mr-3" />
                    Back Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
          <h1 className="text-4xl font-bold text-white text-center">🧠 Phonics Quiz 🧠</h1>
          <Button onClick={generateQuiz} variant="outline" size="lg" className="text-xl">
            <RefreshCw className="w-6 h-6 mr-2" />
            New Quiz
          </Button>
        </div>

        {/* Level Selector */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {(["letters", "three-letter", "four-letter", "five-letter", "sentences"] as const).map((level) => (
              <Button
                key={level}
                onClick={() => setSelectedLevel(level)}
                variant={selectedLevel === level ? "default" : "outline"}
                className="text-lg"
              >
                {level.charAt(0).toUpperCase() + level.slice(1).replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="bg-white/95 shadow-2xl mb-6">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Question */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-4">{currentQuestion.question}</div>
                  <Button onClick={playQuestion} size="lg" className="text-xl py-4 px-6 bg-blue-500 hover:bg-blue-600">
                    <Volume2 className="w-6 h-6 mr-2" />
                    Read Question
                  </Button>
                </div>

                {/* Answer Options */}
                {currentQuestion.type === "multiple-choice" && !showFeedback && (
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options?.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleMultipleChoice(index)}
                        size="lg"
                        variant="outline"
                        className="text-2xl py-6 px-6 font-bold"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Spelling Input */}
                {currentQuestion.type === "spelling" && !showFeedback && (
                  <div className="space-y-4">
                    {currentQuestion.hint && (
                      <div className="bg-yellow-100 rounded-2xl p-4 text-lg text-gray-700">
                        💡 Hint: {currentQuestion.hint}
                      </div>
                    )}
                    <Input
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="text-2xl py-6 text-center font-bold"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && currentAnswer.trim()) {
                          handleSpelling()
                        }
                      }}
                    />
                    {currentAnswer.trim() && (
                      <Button
                        onClick={handleSpelling}
                        size="lg"
                        className="w-full text-2xl py-6 bg-green-500 hover:bg-green-600"
                      >
                        Submit Answer
                      </Button>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {showFeedback && (
                  <div className="text-center space-y-4">
                    {isCorrect() ? (
                      <div className="text-3xl font-bold text-green-600 flex items-center justify-center animate-bounce">
                        <Check className="w-8 h-8 mr-2" />
                        Correct! Great job! 🎉
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
                        <X className="w-6 h-6 mr-2" />
                        Not quite right. Keep trying! 💪
                      </div>
                    )}

                    {currentQuestion.explanation && (
                      <div className="bg-blue-100 rounded-2xl p-4 text-lg text-gray-700">
                        {currentQuestion.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
