"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

const worksheetTypes: { key: WorksheetType; label: string; emoji: string; desc: string }[] = [
  { key: "letters", label: "Letter Sounds", emoji: "🔤", desc: "Practice letter sounds" },
  { key: "three-letter-words", label: "3-Letter Words", emoji: "📝", desc: "CVC words" },
  { key: "four-letter-words", label: "4-Letter Words", emoji: "📚", desc: "Words with blends" },
  { key: "five-letter-words", label: "5-Letter Words", emoji: "🌟", desc: "Advanced words" },
  { key: "sentences", label: "Sentences", emoji: "💬", desc: "Build sentences" },
  { key: "tracing", label: "Letter Tracing", emoji: "✏️", desc: "Handwriting practice" },
  { key: "matching", label: "Match Pictures", emoji: "🎯", desc: "Word to emoji" },
  { key: "fill-blank", label: "Fill the Blank", emoji: "🧩", desc: "Missing letters" },
]

export default function WorksheetGeneratorPage() {
  const router = useRouter()
  const [worksheetType, setWorksheetType] = useState<WorksheetType>("letters")
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [count, setCount] = useState(8)
  const [items, setItems] = useState<WorksheetData>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [childName, setChildName] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number } | null>(null)

  useEffect(() => {
    const savedName = localStorage.getItem("phonics-child-name")
    if (savedName) setChildName(savedName)
  }, [])

  useEffect(() => {
    if (childName) localStorage.setItem("phonics-child-name", childName)
  }, [childName])

  const currentType = useMemo(
    () => worksheetTypes.find((t) => t.key === worksheetType)!,
    [worksheetType]
  )

  // Check usage on mount
  useEffect(() => {
    fetch("/api/usage/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "worksheets" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.used === "number" && typeof data.limit === "number") {
          setUsageInfo({ used: data.used, limit: data.limit })
        }
      })
      .catch(() => { })
  }, [])

  const generateWorksheet = async () => {
    setIsLoading(true)
    setError(null)
    setShowUpgradeModal(false)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: worksheetType, count, difficulty }),
      })
      const data = await response.json()

      if (response.status === 402 && data.usageLimitReached) {
        setUsageInfo({ used: data.used, limit: data.limit })
        setShowUpgradeModal(true)
        return
      }

      if (!response.ok) throw new Error(data.error || "Failed to generate worksheet")
      setItems(data.content)

      // Update usage counter
      if (usageInfo) {
        setUsageInfo({ ...usageInfo, used: usageInfo.used + 1 })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 print:bg-white print:from-white print:via-white print:to-white">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        {["✏️", "📝", "🌟", "📚", "🎨", "✨"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-5xl opacity-10 animate-float"
            style={{
              left: `${10 + i * 16}%`,
              top: `${5 + (i * 25) % 80}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 print:max-w-none print:p-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-white/90 hover:text-white hover:bg-white/10 font-bold text-lg gap-2"
            >
              <Home className="w-5 h-5" /> Home
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
            ✨ Worksheet Magic ✨
          </h1>
          {usageInfo && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-bold text-xs">
              {usageInfo.used}/{usageInfo.limit} used
            </div>
          )}
          <Button
            onClick={() => window.print()}
            disabled={items.length === 0}
            className="bg-white/20 hover:bg-white/30 text-white border-0 font-bold gap-2 backdrop-blur-sm"
          >
            <Printer className="w-5 h-5" /> Print
          </Button>
        </div>

        {/* Config Panel */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-6 print:hidden">
          {/* Worksheet Type Grid */}
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
            Choose Activity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {worksheetTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => {
                  setWorksheetType(type.key)
                  setItems([])
                  setError(null)
                }}
                className={`rounded-2xl p-3 text-left transition-all duration-200 border-2 ${worksheetType === type.key
                  ? "bg-purple-50 border-purple-400 shadow-md scale-[1.02]"
                  : "bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200"
                  }`}
              >
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="text-sm font-bold text-gray-700 leading-tight">{type.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{type.desc}</div>
              </button>
            ))}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {/* Difficulty */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Difficulty
              </label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                  const config = {
                    easy: { emoji: "🌱", label: "Easy", active: "bg-emerald-100 text-emerald-700 border-emerald-400" },
                    medium: { emoji: "🌿", label: "Medium", active: "bg-amber-100 text-amber-700 border-amber-400" },
                    hard: { emoji: "🌳", label: "Hard", active: "bg-red-100 text-red-700 border-red-400" },
                  }[d]
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 rounded-xl border-2 p-2.5 font-bold text-xs transition-all ${difficulty === d
                        ? `${config.active} shadow-sm`
                        : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      <span className="text-base block">{config.emoji}</span>
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Questions
              </label>
              <div className="relative">
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full rounded-xl border-2 border-gray-200 p-2.5 pr-10 text-gray-700 font-bold appearance-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50"
                >
                  {[4, 6, 8, 10, 12, 15, 20].map((n) => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Child Name */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Child&apos;s Name
              </label>
              <input
                className="w-full rounded-xl border-2 border-gray-200 p-2.5 text-gray-700 font-semibold focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50"
                type="text"
                placeholder="Enter name..."
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full py-5 text-lg font-black rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] gap-2"
            onClick={generateWorksheet}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Creating Your Worksheet...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Worksheet
              </>
            )}
          </Button>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Free Limit Reached!</h3>
              <p className="text-gray-500 mb-1">
                You&apos;ve used all <span className="font-bold text-purple-600">{usageInfo?.limit}</span> free worksheet generations.
              </p>
              <p className="text-gray-400 text-sm mb-6">Upgrade to unlock unlimited worksheets!</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/pricing")}
                  className="w-full py-5 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg hover:shadow-xl"
                >
                  ✨ View Plans — from ₹99/mo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-4 rounded-2xl font-bold text-gray-400"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 print:hidden flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-700 text-sm">Something went wrong</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-100 text-xs"
              onClick={() => {
                setError(null)
                generateWorksheet()
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden print:hidden">
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="h-7 bg-gray-200 rounded-lg w-48" />
                  <div className="h-5 bg-gray-200 rounded w-24" />
                </div>
                {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border rounded-xl p-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 text-purple-500 font-bold text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI is creating your worksheet...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Worksheet Paper */}
        {!isLoading && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
            <div className="p-6 md:p-8 print:p-8">
              {/* Header */}
              <div className="mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-2">
                    <span>{currentType.emoji}</span>
                    <span>{currentType.label} Worksheet</span>
                  </h2>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide print:text-gray-600">
                    {difficulty === "easy" ? "🌱 Easy" : difficulty === "medium" ? "🌿 Medium" : "🌳 Hard"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-semibold text-sm">Name:</span>
                    <span className="border-b-2 border-gray-300 flex-1 pb-1 font-bold text-gray-700">
                      {childName || "___________________"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-semibold text-sm">Date:</span>
                    <span className="border-b-2 border-gray-300 flex-1 pb-1 font-bold text-gray-700">
                      {todayDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-7xl mb-4">📝</div>
                  <p className="text-xl font-bold text-gray-300">Your worksheet will appear here</p>
                  <p className="text-gray-300 mt-1 text-sm">Choose options above and click Generate</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {worksheetType === "letters" &&
                    (items as GeneratedLetter[]).map((item, i) => (
                      <div key={i} className="flex items-center gap-4 border-2 border-gray-100 rounded-2xl p-4 hover:border-purple-200 transition-colors print:border-gray-200 print:rounded-xl">
                        <div className="text-3xl font-black w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 rounded-xl print:bg-gray-100 print:text-gray-800 flex-shrink-0">
                          {item.letter}
                        </div>
                        <div className="text-2xl flex-shrink-0">{item.emoji}</div>
                        <div className="flex-1 space-y-1.5">
                          <div className="text-sm font-semibold text-gray-600">
                            Sound: <span className="border-b-2 border-dashed border-gray-300 inline-block w-28 ml-1">&nbsp;</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-600">
                            Write: <span className="text-gray-300 tracking-[0.25em] ml-1">{item.word}</span>{" "}
                            <span className="border-b-2 border-dashed border-gray-300 inline-block w-28 ml-1">&nbsp;</span>
                          </div>
                        </div>
                      </div>
                    ))}

                  {(worksheetType === "three-letter-words" ||
                    worksheetType === "four-letter-words" ||
                    worksheetType === "five-letter-words") &&
                    (items as GeneratedWord[]).map((item, i) => (
                      <div key={i} className="border-2 border-gray-100 rounded-2xl p-4 print:border-gray-200 print:rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-black text-purple-500 bg-purple-50 w-7 h-7 rounded-lg flex items-center justify-center print:bg-gray-100 print:text-gray-700">
                            {i + 1}
                          </span>
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-sm font-semibold text-gray-500">{item.meaning}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-10">
                          {item.word.split("").map((_, ci) => (
                            <div
                              key={ci}
                              className="w-10 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-200 text-lg font-bold"
                            >
                              _
                            </div>
                          ))}
                          <div className="ml-4 bg-indigo-50 rounded-lg px-3 py-1.5 print:bg-gray-50">
                            <span className="text-[10px] font-bold text-indigo-500 print:text-gray-500 uppercase">Sounds:</span>{" "}
                            <span className="text-xs font-semibold text-gray-600">{item.sounds.join(" → ")}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                  {worksheetType === "sentences" &&
                    (items as GeneratedSentence[]).map((item, i) => (
                      <div key={i} className="border-2 border-gray-100 rounded-2xl p-4 print:border-gray-200 print:rounded-xl">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-black text-purple-500 bg-purple-50 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 print:bg-gray-100 print:text-gray-700">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{item.emoji}</span>
                              <span className="font-bold text-gray-700 text-sm">{item.meaning}</span>
                            </div>
                            <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-2">
                              <span className="text-xs text-gray-400">Write the sentence:</span>
                            </div>
                            <div className="bg-blue-50 rounded-xl px-3 py-2 print:bg-gray-50">
                              <span className="text-[10px] font-bold text-blue-500 print:text-gray-500 uppercase">
                                Word bank:
                              </span>{" "}
                              <span className="text-xs font-medium text-gray-600">
                                {item.words.join("  •  ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {worksheetType === "tracing" &&
                    (items as TracingItem[]).map((item, i) => (
                      <div key={i} className="border-2 border-gray-100 rounded-2xl p-4 print:border-gray-200 print:rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-black text-purple-500 bg-purple-50 w-7 h-7 rounded-lg flex items-center justify-center print:bg-gray-100 print:text-gray-700">
                            {i + 1}
                          </span>
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-sm font-semibold text-gray-500">
                            Trace <span className="text-purple-600 font-black text-lg">{item.letter}</span> for{" "}
                            <span className="font-bold text-gray-700">{item.guideWord}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-8 gap-2 ml-10">
                          {Array.from({ length: 8 }).map((_, ci) => (
                            <div
                              key={ci}
                              className="h-14 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
                            >
                              <span
                                className="text-3xl font-black"
                                style={{ opacity: ci === 0 ? 0.4 : ci === 1 ? 0.2 : 0.08 }}
                              >
                                {item.letter}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  {worksheetType === "matching" && (
                    <>
                      <p className="text-sm font-bold text-gray-500 mb-2">
                        🎯 Circle the correct picture for each word:
                      </p>
                      {(items as MatchingItem[]).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 border-2 border-gray-100 rounded-2xl p-4 print:border-gray-200 print:rounded-xl">
                          <span className="text-sm font-black text-purple-500 bg-purple-50 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 print:bg-gray-100 print:text-gray-700">
                            {i + 1}
                          </span>
                          <span className="text-lg font-black text-gray-800 min-w-20">{item.word}</span>
                          <div className="flex gap-3">
                            {item.options.map((opt, oi) => (
                              <div
                                key={oi}
                                className="w-14 h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center text-2xl hover:border-purple-400 transition-colors"
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {worksheetType === "fill-blank" && (
                    <>
                      <p className="text-sm font-bold text-gray-500 mb-2">
                        🧩 Write the missing letter:
                      </p>
                      {(items as FillBlankItem[]).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 border-2 border-gray-100 rounded-2xl p-4 print:border-gray-200 print:rounded-xl">
                          <span className="text-sm font-black text-purple-500 bg-purple-50 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 print:bg-gray-100 print:text-gray-700">
                            {i + 1}
                          </span>
                          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                          <div className="flex-1">
                            <div className="text-xs text-gray-400 font-semibold mb-1.5">
                              Hint: {item.hint}
                            </div>
                            <div className="flex items-center gap-1">
                              {item.displayWord.split("").map((char, ci) => (
                                <div
                                  key={ci}
                                  className={`w-10 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-black ${char === "_"
                                    ? "border-purple-400 border-dashed bg-purple-50 text-purple-300"
                                    : "border-gray-200 bg-gray-50 text-gray-700"
                                    }`}
                                >
                                  {char === "_" ? "?" : char}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Footer */}
              {items.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-gray-100 flex items-center justify-between text-xs text-gray-300">
                  <span>🎵 Phonics Fun!</span>
                  <span>Score: _____ / {items.length}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
