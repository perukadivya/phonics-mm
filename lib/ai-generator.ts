const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet"

export interface GeneratedLetter {
  letter: string
  sound: string
  word: string
  emoji: string
}

export interface GeneratedWord {
  word: string
  sounds: string[]
  emoji: string
  meaning: string
}

export interface GeneratedSentence {
  sentence: string
  words: string[]
  emoji: string
  meaning: string
}

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

function cleanSound(sound: string) {
  return sound.trim().replace(/^\/+|\/+$/g, "")
}

function cleanWord(word: string) {
  return word.trim().replace(/\s+/g, " ")
}

async function generateJson(prompt: string) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing")
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`)
  }

  const data = (await response.json()) as OpenRouterResponse
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    throw new Error("OpenRouter response did not include content")
  }

  return JSON.parse(text) as { items?: unknown[] }
}


function normalizeCount(count: number, fallbackCount: number) {
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : fallbackCount
}

function ensureCount<T>(items: T[], fallbackItems: T[], requestedCount: number) {
  const target = normalizeCount(requestedCount, fallbackItems.length)
  const base = items.slice(0, target)

  if (base.length >= target) {
    return base
  }

  const padded = [...base]
  for (let i = 0; padded.length < target; i += 1) {
    padded.push(fallbackItems[i % fallbackItems.length])
  }

  return padded
}

function sanitizeLetters(items: unknown[]): GeneratedLetter[] {
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      letter: String(item.letter ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1),
      sound: cleanSound(String(item.sound ?? "")),
      word: cleanWord(String(item.word ?? "")),
      emoji: String(item.emoji ?? "🔤").trim() || "🔤",
    }))
    .filter((item) => item.letter && item.sound && item.word)
}

function sanitizeWords(items: unknown[]): GeneratedWord[] {
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      word: cleanWord(String(item.word ?? "")).toUpperCase().replace(/[^A-Z]/g, ""),
      sounds: Array.isArray(item.sounds) ? item.sounds.map((sound) => cleanSound(String(sound))).filter(Boolean) : [],
      emoji: String(item.emoji ?? "📘").trim() || "📘",
      meaning: cleanWord(String(item.meaning ?? "")),
    }))
    .filter((item) => item.word && item.sounds.length > 0 && item.meaning)
}

function sanitizeSentences(items: unknown[]): GeneratedSentence[] {
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      sentence: cleanWord(String(item.sentence ?? "")),
      words: Array.isArray(item.words) ? item.words.map((word) => cleanWord(String(word))).filter(Boolean) : [],
      emoji: String(item.emoji ?? "💬").trim() || "💬",
      meaning: cleanWord(String(item.meaning ?? "")),
    }))
    .filter((item) => item.sentence && item.words.length > 0 && item.meaning)
}

export async function generateLetterExamples(count = 5): Promise<GeneratedLetter[]> {
  const fallback: GeneratedLetter[] = [
    { letter: "B", sound: "buh", word: "Ball", emoji: "⚽" },
    { letter: "C", sound: "kuh", word: "Cat", emoji: "🐱" },
    { letter: "D", sound: "duh", word: "Dog", emoji: "🐶" },
    { letter: "F", sound: "fuh", word: "Fish", emoji: "🐟" },
    { letter: "M", sound: "muh", word: "Moon", emoji: "🌙" },
  ]

  try {
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedLetter[] }.
Generate exactly ${count} letter sound examples for a 5-year-old phonics app. Each item should have:
- letter: A-Z single letter
- sound: phonetic cue without slashes (e.g. buh)
- word: simple word starting with letter
- emoji: one relevant emoji`)
    const parsed = sanitizeLetters(data.items ?? [])
    return ensureCount(parsed, fallback, count)
  } catch {}

  return ensureCount([], fallback, count)
}

export async function generateThreeLetterWords(count = 10): Promise<GeneratedWord[]> {
  const fallback: GeneratedWord[] = [
    { word: "CAT", sounds: ["C", "A", "T"], emoji: "🐱", meaning: "A furry pet that says meow!" },
    { word: "DOG", sounds: ["D", "O", "G"], emoji: "🐶", meaning: "A friendly pet that barks!" },
    { word: "SUN", sounds: ["S", "U", "N"], emoji: "☀️", meaning: "The bright star in the sky!" },
  ]

  try {
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedWord[] }.
Generate exactly ${count} three-letter words for a 5-year-old. Each item should have word, sounds array, emoji, meaning.`)
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 3)
    return ensureCount(parsed, fallback, count)
  } catch {}

  return ensureCount([], fallback, count)
}

export async function generateFourLetterWords(count = 8): Promise<GeneratedWord[]> {
  const fallback: GeneratedWord[] = [
    { word: "BOOK", sounds: ["B", "OO", "K"], emoji: "📚", meaning: "Something you read!" },
    { word: "TREE", sounds: ["T", "R", "EE"], emoji: "🌳", meaning: "A tall plant with leaves!" },
    { word: "FISH", sounds: ["F", "I", "SH"], emoji: "🐟", meaning: "An animal that swims!" },
  ]

  try {
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedWord[] }.
Generate exactly ${count} four-letter words for a 5-year-old. Use phonetic chunks in sounds array.`)
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 4)
    return ensureCount(parsed, fallback, count)
  } catch {}

  return ensureCount([], fallback, count)
}

export async function generateFiveLetterWords(count = 6): Promise<GeneratedWord[]> {
  const fallback: GeneratedWord[] = [
    { word: "HOUSE", sounds: ["H", "OU", "SE"], emoji: "🏠", meaning: "Where people live!" },
    { word: "APPLE", sounds: ["A", "PP", "LE"], emoji: "🍎", meaning: "A red or green fruit!" },
    { word: "HAPPY", sounds: ["H", "A", "PP", "Y"], emoji: "😊", meaning: "Feeling good and joyful!" },
  ]

  try {
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedWord[] }.
Generate exactly ${count} five-letter words for a 5-year-old. Use phonetic chunks in sounds array.`)
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 5)
    return ensureCount(parsed, fallback, count)
  } catch {}

  return ensureCount([], fallback, count)
}

export async function generateSimpleSentences(count = 5): Promise<GeneratedSentence[]> {
  const fallback: GeneratedSentence[] = [
    { sentence: "The cat is big.", words: ["The", "cat", "is", "big."], emoji: "🐱", meaning: "A large cat!" },
    { sentence: "I see a dog.", words: ["I", "see", "a", "dog."], emoji: "🐶", meaning: "Looking at a dog!" },
    { sentence: "The sun is hot.", words: ["The", "sun", "is", "hot."], emoji: "☀️", meaning: "The sun feels warm!" },
  ]

  try {
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedSentence[] }.
Generate exactly ${count} simple, age-appropriate sentences with sentence, words array, emoji, meaning.`)
    const parsed = sanitizeSentences(data.items ?? [])
    return ensureCount(parsed, fallback, count)
  } catch {}

  return ensureCount([], fallback, count)
}

export async function generatePhonicsQuiz(
  level: "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences",
  count = 5,
) {
  try {
    const data = await generateJson(`Return JSON with this exact shape: {"items": QuizQuestion[] }.
Generate ${count} phonics quiz questions for ${level} for a 5-year-old. Include multiple-choice and spelling items.`)

    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items
    }
  } catch {}

  return [
    {
      question: "What sound does the letter B make?",
      type: "multiple-choice",
      options: ["buh", "bee", "bay", "boo"],
      correct: 0,
      explanation: "B makes the 'buh' sound!",
    },
  ]
}
