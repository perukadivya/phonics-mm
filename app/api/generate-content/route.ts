import { type NextRequest, NextResponse } from "next/server"
import {
  generateLetterExamples,
  generateThreeLetterWords,
  generateFourLetterWords,
  generateFiveLetterWords,
  generateSimpleSentences,
  generatePhonicsQuiz,
  generateTracingItems,
  generateMatchingItems,
  generateFillBlankItems,
} from "@/lib/ai-generator"
import type { Difficulty } from "@/lib/ai-generator"
import { getSession } from "@/lib/auth"
import { checkUsage, incrementUsage, getClientIP } from "@/lib/usage"

// Worksheet-type content types that consume worksheet quota
const WORKSHEET_TYPES = ["letters", "three-letter-words", "four-letter-words", "five-letter-words", "sentences", "tracing", "matching", "fill-blank"]
const QUIZ_TYPES = ["quiz"]

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 })
    }

    const body = await request.json()
    const { type, count = 5, level, difficulty = "easy" } = body as {
      type: string
      count?: number
      level?: "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences"
      difficulty?: Difficulty
    }

    // Check usage limits for worksheets and quiz
    const ip = await getClientIP(request)

    if (WORKSHEET_TYPES.includes(type)) {
      const usageCheck = await checkUsage(user.id, ip, "worksheets")
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: usageCheck.reason,
          usageLimitReached: true,
          used: usageCheck.used,
          limit: usageCheck.limit,
          planRequired: usageCheck.planRequired,
        }, { status: 402 })
      }
    }

    if (QUIZ_TYPES.includes(type)) {
      const usageCheck = await checkUsage(user.id, ip, "quiz")
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: usageCheck.reason,
          usageLimitReached: true,
          used: usageCheck.used,
          limit: usageCheck.limit,
          planRequired: usageCheck.planRequired,
        }, { status: 402 })
      }
    }

    let content
    switch (type) {
      case "letters":
        content = await generateLetterExamples(count, difficulty)
        break
      case "three-letter-words":
        content = await generateThreeLetterWords(count, difficulty)
        break
      case "four-letter-words":
        content = await generateFourLetterWords(count, difficulty)
        break
      case "five-letter-words":
        content = await generateFiveLetterWords(count, difficulty)
        break
      case "sentences":
        content = await generateSimpleSentences(count, difficulty)
        break
      case "quiz":
        content = await generatePhonicsQuiz(level || "letters", count)
        break
      case "tracing":
        content = await generateTracingItems(count, difficulty)
        break
      case "matching":
        content = await generateMatchingItems(count, difficulty)
        break
      case "fill-blank":
        content = await generateFillBlankItems(count, difficulty)
        break
      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    // Increment usage after successful generation
    if (WORKSHEET_TYPES.includes(type)) {
      await incrementUsage(user.id, ip, "worksheets")
    }
    if (QUIZ_TYPES.includes(type)) {
      await incrementUsage(user.id, ip, "quiz")
    }

    return NextResponse.json({ content })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate content"
    console.error("Error generating content:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
