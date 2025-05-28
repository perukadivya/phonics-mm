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
    const body = await request.json();
    const type = body.type;
    const count = body.count || (type === "quiz" ? 10 : 5); // Default to 10 for quiz, 5 for others. Will be overridden by challenge mode.
    const level = body.level;

    let content;
    switch (type) {
      case "letters":
        content = await generateLetterExamples(count);
        break;
      case "three-letter-words":
        content = await generateThreeLetterWords(count);
        break;
      case "four-letter-words":
        content = await generateFourLetterWords(count);
        break;
      case "five-letter-words":
        content = await generateFiveLetterWords(count);
        break;
      case "sentences":
        content = await generateSimpleSentences(count);
        break;
      case "quiz":
        if (!level) {
          return NextResponse.json({ error: "Level is required for quiz type" }, { status: 400 });
        }
        content = await generatePhonicsQuiz(level, count);
        break;
      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
