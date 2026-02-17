"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Printer, RefreshCw, Sparkles, AlertCircle, ChevronDown } from "lucide-react"
import type {
  GeneratedLetter,
  GeneratedSentence,
  GeneratedWord,
  TracingItem,
  MatchingItem,
  FillBlankItem,
  Difficulty,
} from "@/lib/ai-generator"

type WorksheetType =
  | "letters"
  | "three-letter-words"
  | "four-letter-words"
  | "five-letter-words"
  | "sentences"
  | "tracing"
  | "matching"
  | "fill-blank"

type WorksheetData =
  | GeneratedLetter[]
  | GeneratedWord[]
  | GeneratedSentence[]
  | TracingItem[]
  | MatchingItem[]
  | FillBlankItem[]

const worksheetTypeLabels: Record<WorksheetType, { label: string; emoji: string; description: string }> = {
  letters: { label: "Letter Sounds", emoji: "🔤", description: "Practice letter sounds and phonics" },
  "three-letter-words": { label: "3-Letter Words", emoji: "📝", description: "CVC words like cat, dog, sun" },
  "four-letter-words": { label: "4-Letter Words", emoji: "📚", description: "Longer words with blends" },
  "five-letter-words": { label: "5-Letter Words", emoji: "🌟", description: "Advanced vocabulary words" },
  sentences: { label: "Simple Sentences", emoji: "💬", description: "Build and read sentences" },
  tracing: { label: "Letter Tracing", emoji: "✏️", description: "Trace letters for handwriting" },
  matching: { label: "Match Word to Picture", emoji: "🎯", description: "Match words with emojis" },
  "fill-blank": { label: "Fill in the Blank", emoji: "🧩", description: "Find the missing letter" },
}

const difficultyConfig: Record<Difficulty, { label: string; emoji: string; color: string }> = {
  easy: { label: "Easy", emoji: "🌱", color: "bg-green-100 text-green-700 border-green-300" },
  medium: { label: "Medium", emoji: "🌿", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  hard: { label: "Hard", emoji: "🌳", color: "bg-red-100 text-red-700 border-red-300" },
}

export default function WorksheetGeneratorPage() {
  const [worksheetType, setWorksheetType] = useState<WorksheetType>("letters")
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [count, setCount] = useState(8)
  const [items, setItems] = useState<WorksheetData>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [childName, setChildName] = useState("")

  useEffect(() => {
    const savedName = localStorage.getItem("phonics-child-name")
    if (savedName) setChildName(savedName)
  }, [])

  useEffect(() => {
    if (childName) localStorage.setItem("phonics-child-name", childName)
  }, [childName])

  const title = useMemo(() => {
    return worksheetTypeLabels[worksheetType]?.label + " Worksheet" || "Worksheet"
  }, [worksheetType])

  const generateWorksheet = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: worksheetType, count, difficulty }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate worksheet")
      }

      setItems(data.content)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const printWorksheet = () => {
    window.print()
  }

  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500 p-4 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto print:max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-lg bg-white/90 hover:bg-white border-0 shadow-lg">
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center drop-shadow-lg">
            ✨ Worksheet Generator ✨
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={generateWorksheet}
              disabled={isLoading}
              size="lg"
              className="text-lg bg-white/90 hover:bg-white text-purple-700 border-0 shadow-lg"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Creating..." : "Generate"}
            </Button>
            <Button
              onClick={printWorksheet}
              size="lg"
              className="text-lg bg-white/90 hover:bg-white text-blue-700 border-0 shadow-lg"
              disabled={items.length === 0}
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Config Panel */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl mb-6 print:hidden border-0 rounded-3xl">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Worksheet Type */}
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Worksheet Type
                </label>
                <div className="relative mt-1">
                  <select
                    className="w-full rounded-xl border-2 border-purple-200 p-3 pr-10 text-gray-700 font-semibold appearance-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    value={worksheetType}
                    onChange={(event) => {
                      setWorksheetType(event.target.value as WorksheetType)
                      setItems([])
                      setError(null)
                    }}
                  >
                    {Object.entries(worksheetTypeLabels).map(([key, { label, emoji }]) => (
                      <option key={key} value={key}>
                        {emoji} {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {worksheetTypeLabels[worksheetType].description}
                </p>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Difficulty
                </label>
                <div className="flex gap-2 mt-1">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      className={`flex-1 rounded-xl border-2 p-3 font-bold text-sm transition-all ${difficulty === d
                          ? difficultyConfig[d].color + " border-current scale-105 shadow-md"
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                        }`}
                      onClick={() => setDifficulty(d)}
                    >
                      <div className="text-lg">{difficultyConfig[d].emoji}</div>
                      <div>{difficultyConfig[d].label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Questions
                </label>
                <input
                  className="w-full rounded-xl border-2 border-purple-200 p-3 mt-1 text-gray-700 font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  type="number"
                  min={4}
                  max={20}
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value || 8))}
                />
              </div>

              {/* Child Name */}
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Child's Name
                </label>
                <input
                  className="w-full rounded-xl border-2 border-purple-200 p-3 mt-1 text-gray-700 font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  type="text"
                  placeholder="Enter name..."
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full mt-6 py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              size="lg"
              onClick={generateWorksheet}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                  Creating Your Worksheet...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  ✨ Create Worksheet ✨
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 print:hidden flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700">Oops! Something went wrong</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-red-600 border-red-300 hover:bg-red-100"
                onClick={() => {
                  setError(null)
                  generateWorksheet()
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <Card className="bg-white shadow-2xl rounded-3xl overflow-hidden print:hidden">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                  <div className="flex gap-4">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border rounded-xl p-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 text-purple-500 font-semibold">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  AI is creating your worksheet...
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Worksheet Paper */}
        {!isLoading && (
          <Card className="bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none worksheet-paper">
            <CardContent className="p-8 print:p-6">
              {/* Worksheet Header */}
              <div className="mb-6 border-b-2 border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {worksheetTypeLabels[worksheetType].emoji} {title}
                  </h2>
                  <div className="text-sm text-gray-400 print:text-gray-600">
                    {difficultyConfig[difficulty].emoji} {difficultyConfig[difficulty].label}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Name:</span>
                    <span className="border-b-2 border-gray-300 flex-1 pb-1 font-semibold">
                      {childName || "___________________"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Date:</span>
                    <span className="border-b-2 border-gray-300 flex-1 pb-1 font-semibold">
                      {todayDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-7xl mb-4">📝</div>
                  <p className="text-2xl font-bold text-gray-400">Ready to create!</p>
                  <p className="text-gray-400 mt-2">Choose your options above and click Generate</p>
                </div>
              ) : worksheetType === "letters" ? (
                <div className="space-y-4">
                  {(items as GeneratedLetter[]).map((item, index) => (
                    <div
                      key={`${item.letter}-${index}`}
                      className="flex items-center gap-4 border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors print:border-gray-300"
                    >
                      <div className="text-4xl font-bold w-14 h-14 flex items-center justify-center bg-purple-100 text-purple-600 rounded-xl print:bg-gray-100 print:text-gray-800">
                        {item.letter}
                      </div>
                      <div className="text-3xl">{item.emoji}</div>
                      <div className="flex-1 space-y-1">
                        <div className="text-lg font-medium">
                          Write the sound: <span className="border-b-2 border-dashed border-gray-300 inline-block w-40">&nbsp;</span>
                        </div>
                        <div className="text-lg font-medium">
                          Trace the word: <span className="text-gray-400 tracking-[0.3em]">{item.word}</span>{" "}
                          <span className="border-b-2 border-dashed border-gray-300 inline-block w-40">&nbsp;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : worksheetType === "sentences" ? (
                <div className="space-y-5">
                  {(items as GeneratedSentence[]).map((item, index) => (
                    <div key={`${item.sentence}-${index}`} className="border-2 border-gray-200 rounded-xl p-5 print:border-gray-300">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{item.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-700">
                            {index + 1}. {item.meaning}
                          </div>
                          <div className="mt-3 text-lg">
                            Build the sentence:{" "}
                            <span className="border-b-2 border-dashed border-gray-300 inline-block w-full mt-1">&nbsp;</span>
                          </div>
                          <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 print:bg-gray-50">
                            <span className="text-sm font-semibold text-blue-600 print:text-gray-600">Word bank:</span>{" "}
                            <span className="text-sm font-medium">{item.words.join(" • ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : worksheetType === "tracing" ? (
                <div className="space-y-6">
                  {(items as TracingItem[]).map((item, index) => (
                    <div key={`tracing-${index}`} className="border-2 border-gray-200 rounded-xl p-5 print:border-gray-300">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">{item.emoji}</div>
                        <div className="text-lg font-semibold text-gray-600">
                          {index + 1}. Trace the letter <span className="text-purple-600 font-bold text-2xl">{item.letter}</span> for{" "}
                          <span className="font-bold">{item.guideWord}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                          >
                            {i === 0 ? (
                              <span className="text-4xl font-bold text-gray-300">{item.letter}</span>
                            ) : i === 1 ? (
                              <span className="text-4xl font-bold text-gray-200">{item.letter}</span>
                            ) : (
                              <span className="text-4xl font-bold text-gray-100">{item.letter}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : worksheetType === "matching" ? (
                <div className="space-y-5">
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    🎯 Circle the correct picture for each word:
                  </p>
                  {(items as MatchingItem[]).map((item, index) => (
                    <div key={`matching-${index}`} className="border-2 border-gray-200 rounded-xl p-5 print:border-gray-300">
                      <div className="flex items-center gap-6">
                        <div className="text-2xl font-bold text-gray-800 min-w-24">
                          {index + 1}. {item.word}
                        </div>
                        <div className="flex gap-4">
                          {item.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="w-16 h-16 border-2 border-gray-300 rounded-xl flex items-center justify-center text-3xl hover:border-purple-400 transition-colors"
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : worksheetType === "fill-blank" ? (
                <div className="space-y-5">
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    🧩 Fill in the missing letter:
                  </p>
                  {(items as FillBlankItem[]).map((item, index) => (
                    <div key={`fill-${index}`} className="border-2 border-gray-200 rounded-xl p-5 print:border-gray-300">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{item.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-700">
                            {index + 1}. <span className="text-sm text-gray-400">(Hint: {item.hint})</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            {item.displayWord.split("").map((char, charIndex) => (
                              <div
                                key={charIndex}
                                className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold ${char === "_"
                                    ? "border-purple-400 border-dashed bg-purple-50 text-purple-300"
                                    : "border-gray-300 bg-gray-50 text-gray-700"
                                  }`}
                              >
                                {char === "_" ? "?" : char}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(items as GeneratedWord[]).map((item, index) => (
                    <div key={`${item.word}-${index}`} className="border-2 border-gray-200 rounded-xl p-5 print:border-gray-300">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{item.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-700">
                            {index + 1}. {item.meaning}
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            {item.word.split("").map((_, charIndex) => (
                              <div
                                key={charIndex}
                                className="w-10 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-300 text-lg font-bold"
                              >
                                _
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 bg-blue-50 rounded-lg px-3 py-1.5 inline-block print:bg-gray-50">
                            <span className="text-xs font-semibold text-blue-600 print:text-gray-600">Sound chunks:</span>{" "}
                            <span className="text-sm font-medium">{item.sounds.join(" → ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {items.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-gray-200 flex items-center justify-between text-sm text-gray-400">
                  <span>🎵 Phonics Fun! — phonics.kprsnt.in</span>
                  <span>Score: _____ / {items.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
