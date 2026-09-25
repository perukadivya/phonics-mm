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
import { getSession } from "@/lib/auth"
import { checkUsage, incrementUsage, getClientIP } from "@/lib/usage"

const WORKSHEET_EXPORT_TYPES = ["tracing", "matching", "fill-blank"]

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    const userId = user ? user.id : 0
    const ip = await getClientIP(request)

    const body = await request.json()
    const { type, count = 5, level, isWorksheet } = body as {
      type: string
      count?: number
      level?: "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences"
      difficulty?: "easy" | "medium" | "hard"
      isWorksheet?: boolean
    }

    // Only apply rate limiting quota if explicitly generating a printable worksheet or quiz
    const shouldCheckWorksheetQuota = isWorksheet || WORKSHEET_EXPORT_TYPES.includes(type)
    const isQuiz = type === "quiz"

    if (shouldCheckWorksheetQuota) {
      const usage = await checkUsage(userId, ip, "worksheets")
      if (!usage.allowed) {
        return NextResponse.json(
          {
            error: usage.reason,
            usageLimitReached: true,
            used: usage.used,
            limit: usage.limit,
            planRequired: usage.planRequired,
          },
          { status: 402 }
        )
      }
    }

    if (isQuiz) {
      const usage = await checkUsage(userId, ip, "quiz")
      if (!usage.allowed) {
        return NextResponse.json(
          {
            error: usage.reason,
            usageLimitReached: true,
            used: usage.used,
            limit: usage.limit,
            planRequired: usage.planRequired,
          },
          { status: 402 }
        )
      }
    }

    let content

    switch (type) {
      case "letters":
        content = await generateLetterExamples(count)
        break
      case "three-letter-words":
        content = await generateThreeLetterWords(count)
        break
      case "four-letter-words":
        content = await generateFourLetterWords(count)
        break
      case "five-letter-words":
        content = await generateFiveLetterWords(count)
        break
      case "sentences":
        content = await generateSimpleSentences(count)
        break
      case "tracing":
        content = await generateTracingItems(count)
        break
      case "matching":
        content = await generateMatchingItems(count)
        break
      case "fill-blank":
        content = await generateFillBlankItems(count)
        break
      case "quiz":
        content = await generatePhonicsQuiz(level || "letters", count)
        break
      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    // Increment usage after successful generation
    if (shouldCheckWorksheetQuota) {
      await incrementUsage(userId, ip, "worksheets")
    }
    if (isQuiz) {
      await incrementUsage(userId, ip, "quiz")
    }

    return NextResponse.json({ content, success: true })
  } catch (error) {
    console.error("Content generation error:", error)
    // Fallback gracefully instead of failing
    try {
      const fallbackLetters = await generateLetterExamples(5)
      return NextResponse.json({ content: fallbackLetters, success: true })
    } catch {
      return NextResponse.json({ error: "Could not generate content" }, { status: 500 })
    }
  }
}
