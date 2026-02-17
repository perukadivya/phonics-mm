const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet"

export type Difficulty = "easy" | "medium" | "hard"

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
    throw new Error("OPENROUTER_API_KEY is missing. Please set it in your environment variables.")
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
    const statusText = response.statusText || "Unknown error"
    throw new Error(`AI service error (${response.status}): ${statusText}. Please try again.`)
  }

  const data = (await response.json()) as OpenRouterResponse
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    throw new Error("AI response was empty. Please try again.")
  }

  return JSON.parse(text) as { items?: unknown[] }
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

function getDifficultyDescription(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return "very simple, common words suitable for ages 3-4"
    case "medium":
      return "moderately challenging words for ages 5-6"
    case "hard":
      return "slightly advanced words for ages 6-7"
  }
}

export async function generateLetterExamples(count = 5, difficulty: Difficulty = "easy"): Promise<GeneratedLetter[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedLetter[] }.
Generate ${count} letter sound examples for a phonics app. Difficulty: ${diffDesc}. Each item should have:
- letter: A-Z single letter
- sound: phonetic cue without slashes (e.g. buh)
- word: simple word starting with letter
- emoji: one relevant emoji`)
    const parsed = sanitizeLetters(data.items ?? [])
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { letter: "B", sound: "buh", word: "Ball", emoji: "⚽" },
    { letter: "C", sound: "kuh", word: "Cat", emoji: "🐱" },
    { letter: "D", sound: "duh", word: "Dog", emoji: "🐶" },
    { letter: "F", sound: "fuh", word: "Fish", emoji: "🐟" },
    { letter: "M", sound: "muh", word: "Moon", emoji: "🌙" },
  ]
}

export async function generateThreeLetterWords(count = 10, difficulty: Difficulty = "easy"): Promise<GeneratedWord[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedWord[] }.
Generate ${count} three-letter words. Difficulty: ${diffDesc}. Each item should have word, sounds array, emoji, meaning.`)
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 3)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { word: "CAT", sounds: ["C", "A", "T"], emoji: "🐱", meaning: "A furry pet that says meow!" },
    { word: "DOG", sounds: ["D", "O", "G"], emoji: "🐶", meaning: "A friendly pet that barks!" },
    { word: "SUN", sounds: ["S", "U", "N"], emoji: "☀️", meaning: "The bright star in the sky!" },
  ]
}

export async function generateFourLetterWords(count = 8, difficulty: Difficulty = "medium"): Promise<GeneratedWord[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedWord[] }.
Generate ${count} four-letter words. Difficulty: ${diffDesc}. Use phonetic chunks in sounds array.`)
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 4)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { word: "BOOK", sounds: ["B", "OO", "K"], emoji: "📚", meaning: "Something you read!" },
    { word: "TREE", sounds: ["T", "R", "EE"], emoji: "🌳", meaning: "A tall plant with leaves!" },
    { word: "FISH", sounds: ["F", "I", "SH"], emoji: "🐟", meaning: "An animal that swims!" },
  ]
}

export async function generateFiveLetterWords(count = 6, difficulty: Difficulty = "hard"): Promise<GeneratedWord[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedWord[] }.
Generate ${count} five-letter words. Difficulty: ${diffDesc}. Use phonetic chunks in sounds array.`)
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 5)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { word: "HOUSE", sounds: ["H", "OU", "SE"], emoji: "🏠", meaning: "Where people live!" },
    { word: "APPLE", sounds: ["A", "PP", "LE"], emoji: "🍎", meaning: "A red or green fruit!" },
    { word: "HAPPY", sounds: ["H", "A", "PP", "Y"], emoji: "😊", meaning: "Feeling good and joyful!" },
  ]
}

export async function generateSimpleSentences(count = 5, difficulty: Difficulty = "easy"): Promise<GeneratedSentence[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": GeneratedSentence[] }.
Generate ${count} simple, age-appropriate sentences. Difficulty: ${diffDesc}. Include sentence, words array, emoji, meaning.`)
    const parsed = sanitizeSentences(data.items ?? [])
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { sentence: "The cat is big.", words: ["The", "cat", "is", "big."], emoji: "🐱", meaning: "A large cat!" },
    { sentence: "I see a dog.", words: ["I", "see", "a", "dog."], emoji: "🐶", meaning: "Looking at a dog!" },
    { sentence: "The sun is hot.", words: ["The", "sun", "is", "hot."], emoji: "☀️", meaning: "The sun feels warm!" },
  ]
}

export async function generateTracingItems(count = 6, difficulty: Difficulty = "easy"): Promise<TracingItem[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": TracingItem[] }.
Generate ${count} letter tracing practice items. Difficulty: ${diffDesc}. Each item should have:
- letter: A-Z single uppercase letter
- dottedPattern: the letter shown as dots (e.g. "A" becomes "· · ·" in a triangular shape, just use dotted representation)
- guideWord: a simple word starting with that letter
- emoji: one relevant emoji for the guide word`)
    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items.filter((item): item is TracingItem =>
        !!item && typeof item === "object" && "letter" in (item as Record<string, unknown>)
      ).map(item => ({
        ...item,
        letter: String(item.letter).toUpperCase().slice(0, 1),
        dottedPattern: String(item.dottedPattern || `· ${item.letter} ·`),
        guideWord: String(item.guideWord || ""),
        emoji: String(item.emoji || "✏️"),
      }))
    }
  } catch (error) {
    throw error
  }

  return [
    { letter: "A", dottedPattern: "· A ·", guideWord: "Apple", emoji: "🍎" },
    { letter: "B", dottedPattern: "· B ·", guideWord: "Ball", emoji: "⚽" },
    { letter: "C", dottedPattern: "· C ·", guideWord: "Cat", emoji: "🐱" },
    { letter: "D", dottedPattern: "· D ·", guideWord: "Dog", emoji: "🐶" },
    { letter: "E", dottedPattern: "· E ·", guideWord: "Egg", emoji: "🥚" },
    { letter: "F", dottedPattern: "· F ·", guideWord: "Fish", emoji: "🐟" },
  ]
}

export async function generateMatchingItems(count = 6, difficulty: Difficulty = "easy"): Promise<MatchingItem[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": MatchingItem[] }.
Generate ${count} matching exercise items for kids. Difficulty: ${diffDesc}. Each item should have:
- word: a simple word
- emoji: one emoji representing the word
- options: array of 3 emojis where one matches the word
- correctIndex: index (0-2) of the correct emoji in options`)
    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items.filter((item): item is MatchingItem =>
        !!item && typeof item === "object" && "word" in (item as Record<string, unknown>)
      ).map(item => ({
        word: String(item.word),
        emoji: String(item.emoji),
        options: Array.isArray(item.options) ? item.options.map(String) : ["❓", "❓", "❓"],
        correctIndex: Number(item.correctIndex) || 0,
      }))
    }
  } catch (error) {
    throw error
  }

  return [
    { word: "Cat", emoji: "🐱", options: ["🐶", "🐱", "🐟"], correctIndex: 1 },
    { word: "Sun", emoji: "☀️", options: ["☀️", "🌙", "⭐"], correctIndex: 0 },
    { word: "Tree", emoji: "🌳", options: ["🌸", "🌵", "🌳"], correctIndex: 2 },
    { word: "Fish", emoji: "🐟", options: ["🐟", "🐦", "🐛"], correctIndex: 0 },
    { word: "Ball", emoji: "⚽", options: ["🎾", "⚽", "🏐"], correctIndex: 1 },
    { word: "Star", emoji: "⭐", options: ["🌙", "☀️", "⭐"], correctIndex: 2 },
  ]
}

export async function generateFillBlankItems(count = 6, difficulty: Difficulty = "easy"): Promise<FillBlankItem[]> {
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(`Return JSON with this exact shape: {"items": FillBlankItem[] }.
Generate ${count} fill-in-the-missing-letter items. Difficulty: ${diffDesc}. Each item should have:
- word: the complete word (e.g. "CAT")
- displayWord: word with one letter replaced by underscore (e.g. "C_T")
- missingLetter: the missing letter (e.g. "A")
- hint: a short hint about the word
- emoji: one relevant emoji`)
    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items.filter((item): item is FillBlankItem =>
        !!item && typeof item === "object" && "word" in (item as Record<string, unknown>)
      ).map(item => ({
        word: String(item.word).toUpperCase(),
        displayWord: String(item.displayWord).toUpperCase(),
        missingLetter: String(item.missingLetter).toUpperCase().slice(0, 1),
        hint: String(item.hint),
        emoji: String(item.emoji || "🔤"),
      }))
    }
  } catch (error) {
    throw error
  }

  return [
    { word: "CAT", displayWord: "C_T", missingLetter: "A", hint: "A furry pet", emoji: "🐱" },
    { word: "DOG", displayWord: "D_G", missingLetter: "O", hint: "Man's best friend", emoji: "🐶" },
    { word: "SUN", displayWord: "S_N", missingLetter: "U", hint: "Shines in the sky", emoji: "☀️" },
    { word: "BED", displayWord: "B_D", missingLetter: "E", hint: "Where you sleep", emoji: "🛏️" },
    { word: "CUP", displayWord: "C_P", missingLetter: "U", hint: "Drink from it", emoji: "☕" },
    { word: "HAT", displayWord: "H_T", missingLetter: "A", hint: "Goes on your head", emoji: "👒" },
  ]
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
  } catch (error) {
    throw error
  }

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
