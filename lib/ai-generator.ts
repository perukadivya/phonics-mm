import {
  ALPHABET_DATA,
  THREE_LETTER_WORDS,
  FOUR_LETTER_WORDS,
  FIVE_LETTER_WORDS,
  SIMPLE_SENTENCES,
  QUIZ_BANK,
} from "./phonics-data"

export type Difficulty = "easy" | "medium" | "hard"

export interface GeneratedLetter {
  letter: string
  sound: string
  word: string
  emoji: string
  ipa?: string
  rhyme?: string
}

export interface GeneratedWord {
  word: string
  sounds: string[]
  emoji: string
  meaning: string
  hint?: string
}

export interface GeneratedSentence {
  sentence: string
  words: string[]
  emoji: string
  meaning?: string
}

export interface TracingItem {
  letter: string
  dottedPattern: string
  guideWord: string
  emoji: string
}

export interface MatchingItem {
  word: string
  emoji: string
  options: string[]
  correctIndex: number
}

export interface FillBlankItem {
  word: string
  displayWord: string
  missingLetter: string
  hint: string
  emoji: string
}

export interface PhonicsQuizItem {
  question: string
  type: "multiple-choice" | "spelling"
  options?: string[]
  correct?: number
  answer?: string
  explanation: string
  hint?: string
}

type AIResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

/**
 * Robust JSON generation with Multi-provider support (OpenRouter, OpenAI, or NVIDIA)
 * Timeout protection & graceful failure handling (returns null on error, never crashes caller)
 */
async function generateJson(prompt: string): Promise<{ items?: unknown[] } | null> {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY
  const nvidiaKey = process.env.NVIDIA_API_KEY

  let endpoint = ""
  let apiKey = ""
  let model = ""

  if (openRouterKey) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions"
    apiKey = openRouterKey
    model = "openai/gpt-4o-mini"
  } else if (openAiKey) {
    endpoint = "https://api.openai.com/v1/chat/completions"
    apiKey = openAiKey
    model = "gpt-4o-mini"
  } else if (nvidiaKey) {
    endpoint = "https://integrate.api.nvidia.com/v1/chat/completions"
    apiKey = nvidiaKey
    model = "z-ai/glm5"
  } else {
    // No AI provider keys configured — immediately return null to use fast curated fallback
    return null
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 9000) // 9s timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert children's phonics educator and JSON API. Output ONLY a valid JSON object starting with { and ending with }. Never include markdown or code fences.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) {
      console.warn(`AI provider returned status ${response.status}`)
      return null
    }

    const data = (await response.json()) as AIResponse
    const text = data.choices?.[0]?.message?.content
    if (!text) return null

    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "")
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return null

    return JSON.parse(match[0]) as { items?: unknown[] }
  } catch (err) {
    console.warn("AI generation call error, using curated dataset:", err)
    return null
  }
}

// ----------------- Fallback Helpers ----------------- //

function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

export async function generateLetterExamples(count = 5): Promise<GeneratedLetter[]> {
  try {
    const data = await generateJson(
      `Generate EXACTLY ${count} phonics letter sound items for children.
Return JSON: { "items": [ {"letter": "B", "sound": "buh", "word": "Ball", "emoji": "⚽"} ] }`
    )
    if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
      const valid = data.items
        .filter((item): item is Record<string, string> => typeof item === "object" && item !== null && "letter" in item)
        .map((item) => ({
          letter: String(item.letter).toUpperCase(),
          sound: String(item.sound || ""),
          word: String(item.word || ""),
          emoji: String(item.emoji || "✨"),
        }))
      if (valid.length > 0) return valid.slice(0, count)
    }
  } catch {
    // Continue to fallback
  }

  // Curated fallback from full 26-letter alphabet
  return shuffle(ALPHABET_DATA)
    .slice(0, count)
    .map((l) => ({
      letter: l.letter,
      sound: l.sound,
      word: l.word,
      emoji: l.emoji,
      ipa: l.ipa,
      rhyme: l.rhyme,
    }))
}

export async function generateThreeLetterWords(count = 10): Promise<GeneratedWord[]> {
  try {
    const data = await generateJson(
      `Generate ${count} CVC 3-letter phonics words for kids.
Return JSON: { "items": [ {"word": "CAT", "sounds": ["C", "A", "T"], "emoji": "🐱", "meaning": "A cute pet", "hint": "Says meow"} ] }`
    )
    if (data?.items && Array.isArray(data.items)) {
      const valid = data.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && "word" in item)
        .map((item) => ({
          word: String(item.word).toUpperCase(),
          sounds: Array.isArray(item.sounds) ? item.sounds.map(String) : String(item.word).toUpperCase().split(""),
          emoji: String(item.emoji || "⭐"),
          meaning: String(item.meaning || ""),
          hint: typeof item.hint === "string" ? item.hint : undefined,
        }))
        .filter((item) => item.word.length === 3)
      if (valid.length > 0) return valid.slice(0, count)
    }
  } catch {
    // Fallback
  }

  return shuffle(THREE_LETTER_WORDS).slice(0, count)
}

export async function generateFourLetterWords(count = 8): Promise<GeneratedWord[]> {
  try {
    const data = await generateJson(
      `Generate ${count} 4-letter phonics words for kids.
Return JSON: { "items": [ {"word": "BOOK", "sounds": ["B", "OO", "K"], "emoji": "📚", "meaning": "Something you read", "hint": "Read stories"} ] }`
    )
    if (data?.items && Array.isArray(data.items)) {
      const valid = data.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && "word" in item)
        .map((item) => ({
          word: String(item.word).toUpperCase(),
          sounds: Array.isArray(item.sounds) ? item.sounds.map(String) : String(item.word).toUpperCase().split(""),
          emoji: String(item.emoji || "⭐"),
          meaning: String(item.meaning || ""),
          hint: typeof item.hint === "string" ? item.hint : undefined,
        }))
        .filter((item) => item.word.length === 4)
      if (valid.length > 0) return valid.slice(0, count)
    }
  } catch {
    // Fallback
  }

  return shuffle(FOUR_LETTER_WORDS).slice(0, count)
}

export async function generateFiveLetterWords(count = 6): Promise<GeneratedWord[]> {
  try {
    const data = await generateJson(
      `Generate ${count} 5-letter words for kids.
Return JSON: { "items": [ {"word": "HOUSE", "sounds": ["H", "OU", "SE"], "emoji": "🏠", "meaning": "Where family lives", "hint": "Your home"} ] }`
    )
    if (data?.items && Array.isArray(data.items)) {
      const valid = data.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && "word" in item)
        .map((item) => ({
          word: String(item.word).toUpperCase(),
          sounds: Array.isArray(item.sounds) ? item.sounds.map(String) : String(item.word).toUpperCase().split(""),
          emoji: String(item.emoji || "⭐"),
          meaning: String(item.meaning || ""),
          hint: typeof item.hint === "string" ? item.hint : undefined,
        }))
        .filter((item) => item.word.length === 5)
      if (valid.length > 0) return valid.slice(0, count)
    }
  } catch {
    // Fallback
  }

  return shuffle(FIVE_LETTER_WORDS).slice(0, count)
}

export async function generateSimpleSentences(count = 5): Promise<GeneratedSentence[]> {
  try {
    const data = await generateJson(
      `Generate ${count} simple decodable phonics sentences for 5-year-olds.
Return JSON: { "items": [ {"sentence": "The cat sat on the mat.", "words": ["The", "cat", "sat", "on", "the", "mat"], "emoji": "🐱", "meaning": "A cat rests on a mat."} ] }`
    )
    if (data?.items && Array.isArray(data.items)) {
      const valid = data.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && "sentence" in item)
        .map((item) => ({
          sentence: String(item.sentence),
          words: Array.isArray(item.words) ? item.words.map(String) : String(item.sentence).replace(/[.,!?]/g, "").split(/\s+/),
          emoji: String(item.emoji || "📖"),
          meaning: typeof item.meaning === "string" ? item.meaning : undefined,
        }))
      if (valid.length > 0) return valid.slice(0, count)
    }
  } catch {
    // Fallback
  }

  return shuffle(SIMPLE_SENTENCES).slice(0, count)
}

export async function generateTracingItems(count = 6): Promise<TracingItem[]> {
  const chosenLetters = shuffle(ALPHABET_DATA).slice(0, count)
  return chosenLetters.map((l) => ({
    letter: `${l.letter} ${l.letter.toLowerCase()}`,
    dottedPattern: `${l.letter} ${l.letter} ${l.letter} ${l.letter.toLowerCase()} ${l.letter.toLowerCase()} ${l.letter.toLowerCase()}`,
    guideWord: l.word,
    emoji: l.emoji,
  }))
}

export async function generateMatchingItems(count = 6): Promise<MatchingItem[]> {
  const words = shuffle(THREE_LETTER_WORDS).slice(0, count)
  return words.map((item) => {
    // 3 distractor words
    const distractors = shuffle(THREE_LETTER_WORDS.filter((w) => w.word !== item.word))
      .slice(0, 3)
      .map((w) => w.word)
    const options = shuffle([item.word, ...distractors])
    const correctIndex = options.indexOf(item.word)
    return {
      word: item.word,
      emoji: item.emoji,
      options,
      correctIndex,
    }
  })
}

export async function generateFillBlankItems(count = 6): Promise<FillBlankItem[]> {
  const words = shuffle(THREE_LETTER_WORDS).slice(0, count)
  return words.map((item) => {
    const letters = item.word.split("")
    const missingIndex = 1 // Vowel in CVC word
    const missingLetter = letters[missingIndex]
    const displayWord = `${letters[0]} _ ${letters[2]}`
    return {
      word: item.word,
      displayWord,
      missingLetter,
      hint: item.hint || item.meaning,
      emoji: item.emoji,
    }
  })
}

export async function generatePhonicsQuiz(
  level: "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences",
  count = 5
): Promise<PhonicsQuizItem[]> {
  try {
    const data = await generateJson(
      `Generate ${count} fun phonics quiz questions for level "${level}".
Return JSON: { "items": [
  {"question": "What sound does B make? ⚽", "type": "multiple-choice", "options": ["buh", "duh", "muh", "kuh"], "correct": 0, "explanation": "B makes buh!", "hint": "Pop your lips!"},
  {"question": "Spell the word for: 🐱", "type": "spelling", "answer": "CAT", "explanation": "C-A-T spells cat!", "hint": "Starts with C"}
] }`
    )
    if (data?.items && Array.isArray(data.items)) {
      const valid = data.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && "question" in item)
        .map((item) => ({
          question: String(item.question),
          type: item.type === "spelling" ? ("spelling" as const) : ("multiple-choice" as const),
          options: Array.isArray(item.options) ? item.options.map(String) : undefined,
          correct: typeof item.correct === "number" ? item.correct : 0,
          answer: typeof item.answer === "string" ? item.answer.toUpperCase() : undefined,
          explanation: String(item.explanation || "Great job!"),
          hint: typeof item.hint === "string" ? item.hint : undefined,
        }))
      if (valid.length > 0) return valid.slice(0, count)
    }
  } catch {
    // Fallback
  }

  const pool = QUIZ_BANK[level] || QUIZ_BANK.letters
  return shuffle(pool).slice(0, count)
}
