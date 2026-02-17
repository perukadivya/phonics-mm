import { type NextRequest, NextResponse } from "next/server"
import {
  generateLetterExamples,
  generateThreeLetterWords,
  generateFourLetterWords,
  generateFiveLetterWords,
  generateSimpleSentences,
  generatePhonicsQuiz,
} from "@/lib/ai-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, count = 5, level } = body

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
      case "quiz":
        content = await generatePhonicsQuiz(level, count)
        break
      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
