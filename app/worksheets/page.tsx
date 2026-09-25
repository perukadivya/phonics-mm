"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Printer,
  Sparkles,
  RefreshCw,
  Crown,
  CheckCircle2,
  Calendar,
  PenTool,
  Star,
  FileText,
} from "lucide-react"
import { NavBar } from "@/components/nav-bar"
import { Mascot } from "@/components/mascot"
import {
  ALPHABET_DATA,
  THREE_LETTER_WORDS,
  FOUR_LETTER_WORDS,
  FIVE_LETTER_WORDS,
  SIMPLE_SENTENCES,
} from "@/lib/phonics-data"
import { playPopSound, playClickSound } from "@/lib/audio"

type WorksheetType =
  | "letters"
  | "three-letter-words"
  | "four-letter-words"
  | "five-letter-words"
  | "sentences"
  | "tracing"
  | "matching"
  | "fill-blank"

interface TracingItem {
  letter: string
  word: string
  emoji: string
}

interface MatchingItem {
  word: string
  emoji: string
}

interface FillBlankItem {
  word: string
  display: string
  emoji: string
}

const WORKSHEET_TYPES: { key: WorksheetType; label: string; emoji: string; desc: string }[] = [
  { key: "tracing", label: "Letter Tracing", emoji: "✏️", desc: "Handwriting lines & letters" },
  { key: "letters", label: "Letter Sounds", emoji: "🔤", desc: "Alphabet & phonetic sounds" },
  { key: "three-letter-words", label: "3-Letter Words", emoji: "📝", desc: "CVC words & pictures" },
  { key: "four-letter-words", label: "4-Letter Words", emoji: "📚", desc: "Blends & digraphs" },
  { key: "five-letter-words", label: "5-Letter Words", emoji: "🌟", desc: "Big words practice" },
  { key: "sentences", label: "Sentences", emoji: "💬", desc: "Sentence copy & reading" },
  { key: "matching", label: "Picture Match", emoji: "🎯", desc: "Draw a line to match" },
  { key: "fill-blank", label: "Missing Letters", emoji: "🧩", desc: "Fill in the missing vowels" },
]

export default function WorksheetGeneratorPage() {
  const [worksheetType, setWorksheetType] = useState<WorksheetType>("tracing")
  const [childName, setChildName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number } | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Seed data immediately so preview is never blank
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("phonics-child-name")
    if (saved) setChildName(saved)
  }, [])

  const handleNameChange = (val: string) => {
    setChildName(val)
    localStorage.setItem("phonics-child-name", val)
  }

  const handlePrint = () => {
    playPopSound()
    window.print()
  }

  const handleShuffle = async () => {
    playPopSound()
    setIsLoading(true)
    setSeed((s) => s + 1)

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: worksheetType, count: 6, isWorksheet: true }),
      })
      const data = await res.json()
      if (res.status === 402 && data.usageLimitReached) {
        setUsageInfo({ used: data.used, limit: data.limit })
        setShowUpgradeModal(true)
      }
    } catch {
      // Local shuffle already happened with seed
    } finally {
      setIsLoading(false)
    }
  }

  // Derive worksheet items from selected type and seed
  const items = useMemo(() => {
    // Deterministic shuffle using seed
    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed * 997 + offset) * 10000
      return x - Math.floor(x)
    }

    switch (worksheetType) {
      case "tracing":
        return [...ALPHABET_DATA]
          .sort((a, b) => pseudoRandom(a.letter.charCodeAt(0)) - 0.5)
          .slice(0, 6)
          .map((item) => ({
            letter: item.letter,
            word: item.word,
            emoji: item.emoji,
          }))

      case "letters":
        return [...ALPHABET_DATA]
          .sort((a, b) => pseudoRandom(a.letter.charCodeAt(0)) - 0.5)
          .slice(0, 8)

      case "three-letter-words":
        return [...THREE_LETTER_WORDS]
          .sort((a, b) => pseudoRandom(a.word.charCodeAt(0)) - 0.5)
          .slice(0, 6)

      case "four-letter-words":
        return [...FOUR_LETTER_WORDS]
          .sort((a, b) => pseudoRandom(a.word.charCodeAt(0)) - 0.5)
          .slice(0, 6)

      case "five-letter-words":
        return [...FIVE_LETTER_WORDS]
          .sort((a, b) => pseudoRandom(a.word.charCodeAt(0)) - 0.5)
          .slice(0, 6)

      case "sentences":
        return [...SIMPLE_SENTENCES]
          .sort((a, b) => pseudoRandom(a.sentence.length) - 0.5)
          .slice(0, 4)

      case "matching": {
        const pool = [...THREE_LETTER_WORDS]
          .sort((a, b) => pseudoRandom(a.word.charCodeAt(0)) - 0.5)
          .slice(0, 5)
        // Shuffled emojis for right column
        const emojis = [...pool]
          .sort((a, b) => pseudoRandom(a.word.charCodeAt(1)) - 0.5)
          .map((w) => ({ word: w.word, emoji: w.emoji }))
        return { words: pool, emojis }
      }

      case "fill-blank":
        return [...THREE_LETTER_WORDS]
          .sort((a, b) => pseudoRandom(a.word.charCodeAt(0)) - 0.5)
          .slice(0, 6)
          .map((w) => {
            const parts = w.word.split("")
            return {
              word: w.word,
              display: `${parts[0]} ___ ${parts[2]}`,
              emoji: w.emoji,
              vowel: parts[1],
            }
          })

      default:
        return []
    }
  }, [worksheetType, seed])

  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const currentTypeInfo = WORKSHEET_TYPES.find((t) => t.key === worksheetType) || WORKSHEET_TYPES[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 p-3 sm:p-5 print:p-0 print:bg-white print:from-white print:via-white print:to-white">
      <div className="max-w-4xl mx-auto">
        <NavBar />

        {/* Controls Bar (Hidden during print) */}
        <div className="glass rounded-3xl p-5 mb-6 shadow-xl border-2 border-white/70 print:hidden animate-slideUp">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-purple-950 flex items-center gap-2">
                <span>🖨️</span>
                <span>Worksheet Generator</span>
              </h1>
              <p className="text-xs sm:text-sm font-bold text-purple-800">
                Print handwriting tracing, phonics matching, and spelling sheets!
              </p>
            </div>

            {/* Print & Shuffle Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleShuffle}
                disabled={isLoading}
                variant="outline"
                className="rounded-2xl font-bold bg-white text-purple-700 shadow-sm border-purple-200 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Shuffle Mix
              </Button>

              <Button
                onClick={handlePrint}
                className="btn-chunky rounded-2xl font-black text-base px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg active:scale-95"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Worksheet
              </Button>
            </div>
          </div>

          {/* Child Name Customization */}
          <div className="flex items-center gap-3 mb-4 max-w-md bg-white/80 p-2.5 rounded-2xl border border-purple-100">
            <span className="text-xs font-black text-purple-900 whitespace-nowrap pl-1">
              Child&apos;s Name:
            </span>
            <Input
              type="text"
              placeholder="e.g. Maya / Liam"
              value={childName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="rounded-xl border-purple-200 font-bold text-sm bg-white"
            />
          </div>

          {/* Worksheet Type Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {WORKSHEET_TYPES.map((type) => {
              const active = worksheetType === type.key
              return (
                <button
                  key={type.key}
                  onClick={() => {
                    playPopSound()
                    setWorksheetType(type.key)
                  }}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white shadow-md scale-105"
                      : "bg-white/80 hover:bg-white text-purple-900 shadow-sm"
                  }`}
                >
                  <span>{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md text-center border-4 border-purple-200">
              <div className="text-5xl mb-2">👑</div>
              <h3 className="text-2xl font-black text-gray-800 mb-1">Upgrade for Unlimited Sheets</h3>
              <p className="text-xs font-bold text-gray-500 mb-4">
                You reached the daily free worksheet limit ({usageInfo?.limit || 3}/day).
                Upgrade for unlimited custom AI worksheets!
              </p>
              <div className="flex justify-center gap-2">
                <Link href="/pricing">
                  <Button className="rounded-2xl font-black bg-purple-600 hover:bg-purple-700 text-white">
                    View Plans (₹99/mo)
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="rounded-2xl font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Worksheet Canvas (A4 standard styling) */}
        <div className="worksheet-paper bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-purple-200 print:border-none print:shadow-none print:p-4 print:rounded-none text-gray-900">
          {/* Header Bar on Worksheet */}
          <div className="border-b-4 border-dashed border-purple-300 pb-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl select-none">{currentTypeInfo.emoji}</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
                    {childName ? `${childName}'s ` : ""}
                    {currentTypeInfo.label}
                  </h2>
                  <p className="text-xs font-bold text-purple-700">Phonics Fun Learning Practice</p>
                </div>
              </div>

              {/* Star Rating Checkbox on Printable */}
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500 mb-1">Rating:</div>
                <div className="flex gap-1 text-xl text-yellow-400">
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
              </div>
            </div>

            {/* Name / Date Fields for Kids to write */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-600">
              <div className="border-b-2 border-gray-400 pb-1">
                <span>Name: </span>
                <span className="font-black text-gray-900 ml-1">{childName}</span>
              </div>
              <div className="border-b-2 border-gray-400 pb-1">
                <span>Date: </span>
                <span className="font-semibold text-gray-800 ml-1">{todayDate}</span>
              </div>
            </div>
          </div>

          {/* Worksheet Instructions */}
          <div className="mb-6 bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs font-bold text-purple-900 print:bg-white print:border-gray-300">
            {worksheetType === "tracing" && "✏️ Practice writing each letter on the dotted lines below. Say the sound as you write!"}
            {worksheetType === "letters" && "🔤 Read each letter out loud, make its sound, and color the picture!"}
            {worksheetType === "three-letter-words" && "📝 Sound out each letter, read the 3-letter word, and copy it on the handwriting line."}
            {worksheetType === "four-letter-words" && "📚 Blend the sounds together to read the 4-letter word and write it clearly."}
            {worksheetType === "five-letter-words" && "🌟 Read the big word and write it down. Circle the vowels (A, E, I, O, U)!"}
            {worksheetType === "sentences" && "💬 Read each sentence out loud. Then carefully copy the sentence on the guide lines."}
            {worksheetType === "matching" && "🎯 Draw a straight line connecting each word on the left to its matching picture on the right!"}
            {worksheetType === "fill-blank" && "🧩 Look at the picture, sound out the word, and write the missing vowel on the blank line."}
          </div>

          {/* CONTENT BY WORKSHEET TYPE */}

          {/* 1. TRACING WORKSHEET */}
          {worksheetType === "tracing" && Array.isArray(items) && (
            <div className="space-y-6">
              {(items as TracingItem[]).map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  {/* Letter Box */}
                  <div className="w-16 h-16 rounded-2xl border-2 border-purple-300 flex flex-col items-center justify-center font-black text-2xl text-purple-950 shrink-0">
                    <span>{item.letter}</span>
                    <span className="text-lg -mt-1">{item.emoji}</span>
                  </div>

                  {/* Handwriting Tracing Lines */}
                  <div className="flex-1 relative tracing-guidelines rounded-xl border-2 border-blue-400 flex items-center px-4">
                    <span className="font-mono text-3xl font-bold tracking-widest text-gray-300 select-none">
                      {item.letter} &nbsp; {item.letter.toLowerCase()} &nbsp; {item.letter} &nbsp; {item.letter.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. LETTERS WORKSHEET */}
          {worksheetType === "letters" && Array.isArray(items) && (
            <div className="grid grid-cols-2 gap-4">
              {(items as (typeof ALPHABET_DATA)[0][]).map((item, idx) => (
                <div
                  key={idx}
                  className="border-2 border-purple-200 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-purple-900 w-12 text-center">
                      {item.letter}
                    </span>
                    <div>
                      <div className="text-lg font-black text-gray-800">{item.word}</div>
                      <div className="text-xs font-bold text-gray-500">Sound: &quot;{item.sound}&quot;</div>
                    </div>
                  </div>
                  <span className="text-4xl">{item.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {/* 3. 3-LETTER WORDS WORKSHEET */}
          {worksheetType === "three-letter-words" && Array.isArray(items) && (
            <div className="grid grid-cols-2 gap-5">
              {(items as (typeof THREE_LETTER_WORDS)[0][]).map((item, idx) => (
                <div key={idx} className="border-2 border-orange-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-2xl font-black tracking-widest text-orange-950">
                      {item.word}
                    </span>
                  </div>
                  {/* Tracing line for copying */}
                  <div className="tracing-guidelines rounded-xl border border-blue-300 flex items-center px-3">
                    <span className="font-mono text-2xl text-gray-300 tracking-widest">
                      {item.word}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. 4-LETTER WORDS WORKSHEET */}
          {worksheetType === "four-letter-words" && Array.isArray(items) && (
            <div className="grid grid-cols-2 gap-5">
              {(items as (typeof FOUR_LETTER_WORDS)[0][]).map((item, idx) => (
                <div key={idx} className="border-2 border-teal-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-2xl font-black tracking-widest text-teal-950">
                      {item.word}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-500 mb-1.5">
                    Blends: {item.sounds.join(" + ")}
                  </div>
                  <div className="tracing-guidelines rounded-xl border border-blue-300 flex items-center px-3">
                    <span className="font-mono text-2xl text-gray-300 tracking-widest">
                      {item.word}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. 5-LETTER WORDS WORKSHEET */}
          {worksheetType === "five-letter-words" && Array.isArray(items) && (
            <div className="grid grid-cols-2 gap-5">
              {(items as (typeof FIVE_LETTER_WORDS)[0][]).map((item, idx) => (
                <div key={idx} className="border-2 border-purple-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-2xl font-black tracking-widest text-purple-950">
                      {item.word}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mb-1.5">{item.meaning}</div>
                  <div className="tracing-guidelines rounded-xl border border-blue-300 flex items-center px-3">
                    <span className="font-mono text-2xl text-gray-300 tracking-widest">
                      {item.word}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. SENTENCES WORKSHEET */}
          {worksheetType === "sentences" && Array.isArray(items) && (
            <div className="space-y-6">
              {(items as (typeof SIMPLE_SENTENCES)[0][]).map((item, idx) => (
                <div key={idx} className="border-2 border-purple-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-lg font-black text-gray-800">{item.sentence}</span>
                  </div>
                  <div className="tracing-guidelines rounded-xl border border-blue-300 flex items-center px-3">
                    <span className="font-mono text-lg text-gray-300">{item.sentence}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7. PICTURE MATCHING WORKSHEET */}
          {worksheetType === "matching" &&
            typeof items === "object" &&
            items !== null &&
            "words" in items && (
              <div className="flex justify-between items-center px-6 py-4">
                {/* Words Column */}
                <div className="space-y-6">
                  {((items as { words: { word: string }[] }).words).map((w, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-28 py-3 rounded-2xl border-2 border-gray-300 text-center font-black text-xl">
                        {w.word}
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-gray-500 bg-gray-100" />
                    </div>
                  ))}
                </div>

                <div className="text-gray-300 font-bold text-sm tracking-widest rotate-90 select-none">
                  DRAW LINES
                </div>

                {/* Emojis Column */}
                <div className="space-y-6">
                  {((items as { emojis: { word: string; emoji: string }[] }).emojis).map((e, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-500 bg-gray-100" />
                      <div className="w-28 py-2 rounded-2xl border-2 border-gray-300 text-center text-4xl">
                        {e.emoji}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 8. FILL IN MISSING LETTERS WORKSHEET */}
          {worksheetType === "fill-blank" && Array.isArray(items) && (
            <div className="grid grid-cols-2 gap-5">
              {(items as (FillBlankItem & { vowel: string })[]).map((item, idx) => (
                <div
                  key={idx}
                  className="border-2 border-pink-200 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-2xl font-black tracking-widest text-purple-950 font-mono">
                      {item.display}
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-1">
                      Missing vowel: ( A , E , I , O , U )
                    </div>
                  </div>
                  <span className="text-4xl">{item.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {/* Printable Footer with Signature & Badge */}
          <div className="mt-8 pt-4 border-t-2 border-gray-300 flex items-center justify-between text-xs font-bold text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span>Great Effort! Super Phonics Star!</span>
            </div>
            <div>
              <span>Teacher / Parent Signature: _______________________</span>
            </div>
          </div>
        </div>

        {/* Mascot companion below (hidden during print) */}
        <div className="mt-8 flex justify-center print:hidden">
          <Mascot
            character="lion"
            message="Click 'Print Worksheet' to practice writing with real pencils and crayons!"
          />
        </div>
      </div>
    </div>
  )
}
