"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Printer, RefreshCw, Sparkles } from "lucide-react"
import type { GeneratedLetter, GeneratedSentence, GeneratedWord } from "@/lib/ai-generator"

type WorksheetType = "letters" | "three-letter-words" | "four-letter-words" | "five-letter-words" | "sentences"

type WorksheetData = GeneratedLetter[] | GeneratedWord[] | GeneratedSentence[]

export default function WorksheetGeneratorPage() {
  const [worksheetType, setWorksheetType] = useState<WorksheetType>("letters")
  const [count, setCount] = useState(8)
  const [items, setItems] = useState<WorksheetData>([])
  const [isLoading, setIsLoading] = useState(false)

  const title = useMemo(() => {
    switch (worksheetType) {
      case "letters":
        return "Letter Sounds Worksheet"
      case "three-letter-words":
        return "3-Letter Words Worksheet"
      case "four-letter-words":
        return "4-Letter Words Worksheet"
      case "five-letter-words":
        return "5-Letter Words Worksheet"
      case "sentences":
        return "Simple Sentences Worksheet"
    }
  }, [worksheetType])

  const generateWorksheet = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: worksheetType, count }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate worksheet")
      }

      const { content } = await response.json()
      setItems(content)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const printWorksheet = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-blue-300 to-purple-300 p-4 print:bg-white">
      <div className="max-w-5xl mx-auto print:max-w-none">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-xl">
              <Home className="w-6 h-6 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">🧾 Worksheet Generator 🧾</h1>
          <div className="flex gap-2">
            <Button onClick={generateWorksheet} disabled={isLoading} variant="outline" size="lg" className="text-xl">
              {isLoading ? <RefreshCw className="w-6 h-6 mr-2 animate-spin" /> : <Sparkles className="w-6 h-6 mr-2" />}
              {isLoading ? "Generating..." : "Generate"}
            </Button>
            <Button onClick={printWorksheet} variant="outline" size="lg" className="text-xl" disabled={items.length === 0}>
              <Printer className="w-6 h-6 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <Card className="bg-white/95 shadow-2xl mb-6 print:hidden">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-gray-600">Worksheet Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-3 mt-1"
                  value={worksheetType}
                  onChange={(event) => setWorksheetType(event.target.value as WorksheetType)}
                >
                  <option value="letters">Letter Sounds</option>
                  <option value="three-letter-words">3-Letter Words</option>
                  <option value="four-letter-words">4-Letter Words</option>
                  <option value="five-letter-words">5-Letter Words</option>
                  <option value="sentences">Simple Sentences</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Number of Questions</label>
                <input
                  className="w-full rounded-lg border border-gray-300 p-3 mt-1"
                  type="number"
                  min={4}
                  max={20}
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value || 8))}
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full" size="lg" onClick={generateWorksheet} disabled={isLoading}>
                  {isLoading ? "Generating..." : "Create Worksheet"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-2xl print:shadow-none">
          <CardContent className="p-8 print:p-6">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
              <div className="grid grid-cols-2 gap-4 mt-4 text-lg">
                <div>Name: __________________</div>
                <div>Date: __________________</div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-14 text-xl">Generate a worksheet to get started.</div>
            ) : worksheetType === "letters" ? (
              <div className="space-y-4">
                {(items as GeneratedLetter[]).map((item, index) => (
                  <div key={`${item.letter}-${index}`} className="flex items-center gap-4 border rounded-xl p-3">
                    <div className="text-3xl font-bold w-10 text-center">{item.letter}</div>
                    <div className="text-3xl">{item.emoji}</div>
                    <div className="text-lg">Write the sound: __________________</div>
                    <div className="text-lg">Trace word: {item.word} __________________</div>
                  </div>
                ))}
              </div>
            ) : worksheetType === "sentences" ? (
              <div className="space-y-5">
                {(items as GeneratedSentence[]).map((item, index) => (
                  <div key={`${item.sentence}-${index}`} className="border rounded-xl p-4">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="font-semibold text-lg">
                      {index + 1}. {item.meaning}
                    </div>
                    <div className="mt-2">Build the sentence: ____________________________________________</div>
                    <div className="text-sm text-gray-500 mt-1">Word bank: {item.words.join(" • ")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(items as GeneratedWord[]).map((item, index) => (
                  <div key={`${item.word}-${index}`} className="border rounded-xl p-4">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="font-semibold">
                      {index + 1}. {item.meaning}
                    </div>
                    <div className="mt-2">Word: {"_ ".repeat(item.word.length).trim()}</div>
                    <div className="text-sm text-gray-500 mt-1">Sound chunks: {item.sounds.join(" - ")}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
