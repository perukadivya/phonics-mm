const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const DEFAULT_MODEL = "z-ai/glm5"

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

type AIResponse = {
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
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is missing. Please set it in your environment variables.")
  }

  const response = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a JSON API. You ONLY output valid JSON objects. Never include markdown, code fences, explanations, or any text outside the JSON. Your output must start with { and end with }.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 8192,
    }),
  })

  if (!response.ok) {
    const statusText = response.statusText || "Unknown error"
    throw new Error(`AI service error (${response.status}): ${statusText}. Please try again.`)
  }

  const data = (await response.json()) as AIResponse
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    throw new Error("AI response was empty. Please try again.")
  }

  // Clean up response — strip markdown code fences, thinking tags, etc.
  let cleaned = text
  // Remove <think>...</think> blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "")
  // Remove code fences
  cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "")
  // Extract JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON. Please try again.")
  }

  return JSON.parse(jsonMatch[0]) as { items?: unknown[] }
}

function sanitizeLetters(items: unknown[]): GeneratedLetter[] {
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      letter: String(item.letter ?? "").toUpperCase().slice(0, 1),
      sound: cleanSound(String(item.sound ?? "")),
      word: cleanWord(String(item.word ?? "")),
      emoji: String(item.emoji ?? "🔤"),
    }))
    .filter((item) => item.letter && item.sound && item.word)
}

function sanitizeWords(items: unknown[]): GeneratedWord[] {
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      word: cleanWord(String(item.word ?? "")).toUpperCase(),
      sounds: Array.isArray(item.sounds)
        ? item.sounds.map((s) => cleanSound(String(s)))
        : String(item.word ?? "")
          .toUpperCase()
          .split("")
          .map((c) => c),
      emoji: String(item.emoji ?? "📝"),
      meaning: cleanWord(String(item.meaning ?? "")),
    }))
    .filter((item) => item.word && item.meaning)
}

function sanitizeSentences(items: unknown[]): GeneratedSentence[] {
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      sentence: cleanWord(String(item.sentence ?? "")),
      words: Array.isArray(item.words) ? item.words.map((w) => cleanWord(String(w))) : String(item.sentence ?? "").split(" "),
      emoji: String(item.emoji ?? "💬"),
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
  const requestCount = Math.max(count + 3, Math.ceil(count * 1.3))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} letter sound examples for a children's phonics worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"letter": "B", "sound": "buh", "word": "Ball", "emoji": "⚽"},
    {"letter": "C", "sound": "kuh", "word": "Cat", "emoji": "🐱"}
  ]
}

Rules:
- Each item must have: letter (single A-Z uppercase), sound (phonetic without slashes), word (starting with that letter), emoji (single relevant emoji)
- Use DIFFERENT letters for each item. Do NOT repeat letters.
- You MUST return exactly ${requestCount} items in the items array. This is critical.`
    )
    const parsed = sanitizeLetters(data.items ?? [])
    if (parsed.length >= count) return parsed.slice(0, count)
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
    { letter: "S", sound: "sss", word: "Sun", emoji: "☀️" },
    { letter: "T", sound: "tuh", word: "Tree", emoji: "🌳" },
    { letter: "R", sound: "ruh", word: "Rain", emoji: "🌧️" },
  ].slice(0, count)
}

export async function generateThreeLetterWords(count = 10, difficulty: Difficulty = "easy"): Promise<GeneratedWord[]> {
  const requestCount = Math.max(count + 4, Math.ceil(count * 1.5))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} three-letter CVC words for a children's phonics worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"word": "CAT", "sounds": ["C", "A", "T"], "emoji": "🐱", "meaning": "A furry pet that says meow!"},
    {"word": "DOG", "sounds": ["D", "O", "G"], "emoji": "🐶", "meaning": "A friendly pet that barks!"}
  ]
}

Rules:
- Every word MUST be exactly 3 letters long. This is critical.
- sounds array should break the word into individual letter sounds
- meaning should be a fun, kid-friendly description
- emoji must be a single emoji related to the word
- Use DIFFERENT words. Do NOT repeat any word.
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 3)
    if (parsed.length >= count) return parsed.slice(0, count)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { word: "CAT", sounds: ["C", "A", "T"], emoji: "🐱", meaning: "A furry pet that says meow!" },
    { word: "DOG", sounds: ["D", "O", "G"], emoji: "🐶", meaning: "A friendly pet that barks!" },
    { word: "SUN", sounds: ["S", "U", "N"], emoji: "☀️", meaning: "The bright star in the sky!" },
    { word: "BIG", sounds: ["B", "I", "G"], emoji: "🐘", meaning: "Very large in size!" },
    { word: "CUP", sounds: ["C", "U", "P"], emoji: "☕", meaning: "You drink from it!" },
    { word: "RED", sounds: ["R", "E", "D"], emoji: "🔴", meaning: "A bright warm color!" },
    { word: "HAT", sounds: ["H", "A", "T"], emoji: "👒", meaning: "Goes on your head!" },
    { word: "BED", sounds: ["B", "E", "D"], emoji: "🛏️", meaning: "Where you sleep at night!" },
  ].slice(0, count)
}

export async function generateFourLetterWords(count = 8, difficulty: Difficulty = "medium"): Promise<GeneratedWord[]> {
  const requestCount = Math.max(count + 4, Math.ceil(count * 1.5))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} four-letter words for a children's phonics worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"word": "BOOK", "sounds": ["B", "OO", "K"], "emoji": "📚", "meaning": "Something you read!"},
    {"word": "TREE", "sounds": ["T", "R", "EE"], "emoji": "🌳", "meaning": "A tall plant with leaves!"}
  ]
}

Rules:
- Every word MUST be exactly 4 letters long. This is critical.
- sounds array should use phonetic chunks (blends like SH, TH, CH, OO, EE count as one sound)
- Use DIFFERENT words. Do NOT repeat any word.
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 4)
    if (parsed.length >= count) return parsed.slice(0, count)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { word: "BOOK", sounds: ["B", "OO", "K"], emoji: "📚", meaning: "Something you read!" },
    { word: "TREE", sounds: ["T", "R", "EE"], emoji: "🌳", meaning: "A tall plant with leaves!" },
    { word: "FISH", sounds: ["F", "I", "SH"], emoji: "🐟", meaning: "An animal that swims!" },
    { word: "SHIP", sounds: ["SH", "I", "P"], emoji: "🚢", meaning: "Sails on the sea!" },
    { word: "FROG", sounds: ["F", "R", "O", "G"], emoji: "🐸", meaning: "A green animal that jumps!" },
    { word: "DUCK", sounds: ["D", "U", "CK"], emoji: "🦆", meaning: "A bird that swims and quacks!" },
    { word: "RAIN", sounds: ["R", "AI", "N"], emoji: "🌧️", meaning: "Water from the clouds!" },
    { word: "STAR", sounds: ["S", "T", "AR"], emoji: "⭐", meaning: "Shines in the night sky!" },
  ].slice(0, count)
}

export async function generateFiveLetterWords(count = 6, difficulty: Difficulty = "hard"): Promise<GeneratedWord[]> {
  const requestCount = Math.max(count + 4, Math.ceil(count * 1.5))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} five-letter words for a children's phonics worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"word": "HOUSE", "sounds": ["H", "OU", "SE"], "emoji": "🏠", "meaning": "Where people live!"},
    {"word": "APPLE", "sounds": ["A", "PP", "LE"], "emoji": "🍎", "meaning": "A red or green fruit!"}
  ]
}

Rules:
- Every word MUST be exactly 5 letters long. This is critical.
- sounds array should use phonetic chunks
- Use DIFFERENT words. Do NOT repeat any word.
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    const parsed = sanitizeWords(data.items ?? []).filter((item) => item.word.length === 5)
    if (parsed.length >= count) return parsed.slice(0, count)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { word: "HOUSE", sounds: ["H", "OU", "SE"], emoji: "🏠", meaning: "Where people live!" },
    { word: "APPLE", sounds: ["A", "PP", "LE"], emoji: "🍎", meaning: "A red or green fruit!" },
    { word: "HAPPY", sounds: ["H", "A", "PP", "Y"], emoji: "😊", meaning: "Feeling good and joyful!" },
    { word: "WATER", sounds: ["W", "A", "T", "ER"], emoji: "💧", meaning: "You drink it every day!" },
    { word: "TIGER", sounds: ["T", "I", "G", "ER"], emoji: "🐯", meaning: "A big striped cat!" },
    { word: "TRAIN", sounds: ["T", "R", "AI", "N"], emoji: "🚂", meaning: "Rides on the tracks!" },
  ].slice(0, count)
}

export async function generateSimpleSentences(count = 5, difficulty: Difficulty = "easy"): Promise<GeneratedSentence[]> {
  const requestCount = Math.max(count + 3, Math.ceil(count * 1.3))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} simple sentences for a children's phonics worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"sentence": "The cat is big.", "words": ["The", "cat", "is", "big."], "emoji": "🐱", "meaning": "A large cat!"},
    {"sentence": "I see a dog.", "words": ["I", "see", "a", "dog."], "emoji": "🐶", "meaning": "Looking at a dog!"}
  ]
}

Rules:
- sentences should be simple, 3-6 words, age-appropriate
- words array must contain each word of the sentence including punctuation
- Use DIFFERENT sentences. Do NOT repeat.
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    const parsed = sanitizeSentences(data.items ?? [])
    if (parsed.length >= count) return parsed.slice(0, count)
    if (parsed.length > 0) return parsed
  } catch (error) {
    throw error
  }

  return [
    { sentence: "The cat is big.", words: ["The", "cat", "is", "big."], emoji: "🐱", meaning: "A large cat!" },
    { sentence: "I see a dog.", words: ["I", "see", "a", "dog."], emoji: "🐶", meaning: "Looking at a dog!" },
    { sentence: "The sun is hot.", words: ["The", "sun", "is", "hot."], emoji: "☀️", meaning: "The sun feels warm!" },
    { sentence: "We go to bed.", words: ["We", "go", "to", "bed."], emoji: "🛏️", meaning: "Time to sleep!" },
    { sentence: "I like red.", words: ["I", "like", "red."], emoji: "🔴", meaning: "Red is a nice color!" },
  ].slice(0, count)
}

export async function generateTracingItems(count = 6, difficulty: Difficulty = "easy"): Promise<TracingItem[]> {
  const requestCount = Math.max(count + 3, Math.ceil(count * 1.3))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} letter tracing items for a children's handwriting worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"letter": "A", "dottedPattern": "· A ·", "guideWord": "Apple", "emoji": "🍎"},
    {"letter": "B", "dottedPattern": "· B ·", "guideWord": "Ball", "emoji": "⚽"}
  ]
}

Rules:
- letter must be a single uppercase letter A-Z
- guideWord should be a simple word starting with that letter
- Use DIFFERENT letters for each item
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    if (Array.isArray(data.items) && data.items.length > 0) {
      const parsed = data.items
        .filter(
          (item): item is TracingItem =>
            !!item && typeof item === "object" && "letter" in (item as Record<string, unknown>)
        )
        .map((item) => ({
          ...item,
          letter: String(item.letter).toUpperCase().slice(0, 1),
          dottedPattern: String(item.dottedPattern || `· ${item.letter} ·`),
          guideWord: String(item.guideWord || ""),
          emoji: String(item.emoji || "✏️"),
        }))
      if (parsed.length >= count) return parsed.slice(0, count)
      if (parsed.length > 0) return parsed
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
    { letter: "G", dottedPattern: "· G ·", guideWord: "Grapes", emoji: "🍇" },
    { letter: "H", dottedPattern: "· H ·", guideWord: "Hat", emoji: "👒" },
  ].slice(0, count)
}

export async function generateMatchingItems(count = 6, difficulty: Difficulty = "easy"): Promise<MatchingItem[]> {
  const requestCount = Math.max(count + 3, Math.ceil(count * 1.3))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} emoji matching exercise items for a children's worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"word": "Cat", "emoji": "🐱", "options": ["🐶", "🐱", "🐟"], "correctIndex": 1},
    {"word": "Sun", "emoji": "☀️", "options": ["☀️", "🌙", "⭐"], "correctIndex": 0}
  ]
}

Rules:
- word is a simple word a child would know
- emoji represents the word
- options is an array of EXACTLY 3 emojis, one of which matches the word
- correctIndex is the 0-based index of the correct emoji in options
- Use DIFFERENT words. Do NOT repeat.
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    if (Array.isArray(data.items) && data.items.length > 0) {
      const parsed = data.items
        .filter(
          (item): item is MatchingItem =>
            !!item && typeof item === "object" && "word" in (item as Record<string, unknown>)
        )
        .map((item) => ({
          word: String(item.word),
          emoji: String(item.emoji),
          options: Array.isArray(item.options) ? item.options.map(String) : ["❓", "❓", "❓"],
          correctIndex: Number(item.correctIndex) || 0,
        }))
      if (parsed.length >= count) return parsed.slice(0, count)
      if (parsed.length > 0) return parsed
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
    { word: "Bird", emoji: "🐦", options: ["🐦", "🐛", "🐟"], correctIndex: 0 },
    { word: "Moon", emoji: "🌙", options: ["⭐", "🌙", "☀️"], correctIndex: 1 },
  ].slice(0, count)
}

export async function generateFillBlankItems(count = 6, difficulty: Difficulty = "easy"): Promise<FillBlankItem[]> {
  const requestCount = Math.max(count + 3, Math.ceil(count * 1.3))
  try {
    const diffDesc = getDifficultyDescription(difficulty)
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} fill-in-the-missing-letter items for a children's phonics worksheet.
Difficulty level: ${diffDesc}.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"word": "CAT", "displayWord": "C_T", "missingLetter": "A", "hint": "A furry pet", "emoji": "🐱"},
    {"word": "DOG", "displayWord": "D_G", "missingLetter": "O", "hint": "Man's best friend", "emoji": "🐶"}
  ]
}

Rules:
- word is the complete word in uppercase
- displayWord has exactly ONE letter replaced with underscore _
- missingLetter is the removed letter
- hint is a short kid-friendly clue
- Use DIFFERENT words. Do NOT repeat.
- You MUST return exactly ${requestCount} items. This is critical.`
    )
    if (Array.isArray(data.items) && data.items.length > 0) {
      const parsed = data.items
        .filter(
          (item): item is FillBlankItem =>
            !!item && typeof item === "object" && "word" in (item as Record<string, unknown>)
        )
        .map((item) => ({
          word: String(item.word).toUpperCase(),
          displayWord: String(item.displayWord).toUpperCase(),
          missingLetter: String(item.missingLetter).toUpperCase().slice(0, 1),
          hint: String(item.hint),
          emoji: String(item.emoji || "🔤"),
        }))
      if (parsed.length >= count) return parsed.slice(0, count)
      if (parsed.length > 0) return parsed
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
    { word: "PEN", displayWord: "P_N", missingLetter: "E", hint: "You write with it", emoji: "🖊️" },
    { word: "MAP", displayWord: "M_P", missingLetter: "A", hint: "Shows places", emoji: "🗺️" },
  ].slice(0, count)
}

export async function generatePhonicsQuiz(
  level: "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences",
  count = 5
) {
  const requestCount = Math.max(count + 2, Math.ceil(count * 1.3))
  try {
    const data = await generateJson(
      `Generate EXACTLY ${requestCount} phonics quiz questions about "${level}" for a 5-year-old child.

Return a JSON object with this EXACT structure:
{
  "items": [
    {"question": "What sound does the letter B make?", "type": "multiple-choice", "options": ["buh", "bee", "bay", "boo"], "correct": 0, "explanation": "B makes the 'buh' sound!"},
    {"question": "Spell the word for this emoji: 🐱", "type": "spelling", "answer": "CAT", "explanation": "C-A-T spells cat!"}
  ]
}

Rules:
- Mix "multiple-choice" and "spelling" question types
- For multiple-choice: include options (array of 4 strings) and correct (0-3 index)
- For spelling: include answer (the correct word in uppercase)
- All questions must have explanation
- You MUST return exactly ${requestCount} items. This is critical.`
    )

    if (Array.isArray(data.items) && data.items.length > 0) {
      const parsed = data.items.slice(0, count)
      return parsed
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
