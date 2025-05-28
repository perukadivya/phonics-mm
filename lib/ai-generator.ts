import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

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

export async function generateLetterExamples(count = 5): Promise<GeneratedLetter[]> {
  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"),
    prompt: `Generate ${count} letter sound examples for a 5-year-old phonics app. Each should have:
    - A letter (A-Z)
    - The phonetic sound (like "buh" for B, "kuh" for C, "sss" for S)
    - A simple word starting with that letter
    - An appropriate emoji

    Format as JSON array:
    [{"letter": "B", "sound": "buh", "word": "Ball", "emoji": "⚽"}, ...]

    Make sure words are simple, age-appropriate, and the emojis clearly represent the words.`,
  })

  try {
    return JSON.parse(text)
  } catch {
    // Fallback data if parsing fails
    return [
      { letter: "B", sound: "buh", word: "Ball", emoji: "⚽" },
      { letter: "C", sound: "kuh", word: "Cat", emoji: "🐱" },
      { letter: "D", sound: "duh", word: "Dog", emoji: "🐶" },
      { letter: "F", sound: "fuh", word: "Fish", emoji: "🐟" },
      { letter: "M", sound: "muh", word: "Moon", emoji: "🌙" },
    ]
  }
}

export async function generateThreeLetterWords(count = 10): Promise<GeneratedWord[]> {
  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"),
    prompt: `Generate ${count} three-letter words for a 5-year-old phonics app. Each should have:
    - A simple 3-letter word (like CAT, DOG, SUN)
    - Individual sounds array (like ["C", "A", "T"])
    - An appropriate emoji
    - A simple meaning/description

    Format as JSON array:
    [{"word": "CAT", "sounds": ["C", "A", "T"], "emoji": "🐱", "meaning": "A furry pet that says meow!"}, ...]

    Make sure all words are:
    - Exactly 3 letters
    - Age-appropriate for 5-year-olds
    - Common words they would know
    - Have clear, recognizable emojis`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return [
      { word: "CAT", sounds: ["C", "A", "T"], emoji: "🐱", meaning: "A furry pet that says meow!" },
      { word: "DOG", sounds: ["D", "O", "G"], emoji: "🐶", meaning: "A friendly pet that barks!" },
      { word: "SUN", sounds: ["S", "U", "N"], emoji: "☀️", meaning: "The bright star in the sky!" },
    ]
  }
}

export async function generateFourLetterWords(count = 8): Promise<GeneratedWord[]> {
  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"),
    prompt: `Generate ${count} four-letter words for a 5-year-old phonics app. Each should have:
    - A simple 4-letter word (like BOOK, TREE, FISH)
    - Sound chunks array (like ["B", "OO", "K"] or ["T", "R", "EE"])
    - An appropriate emoji
    - A simple meaning/description

    Format as JSON array:
    [{"word": "BOOK", "sounds": ["B", "OO", "K"], "emoji": "📚", "meaning": "Something you read!"}, ...]

    Break words into logical phonetic chunks (not just individual letters).
    Make sure words are age-appropriate and have clear emojis.`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return [
      { word: "BOOK", sounds: ["B", "OO", "K"], emoji: "📚", meaning: "Something you read!" },
      { word: "TREE", sounds: ["T", "R", "EE"], emoji: "🌳", meaning: "A tall plant with leaves!" },
      { word: "FISH", sounds: ["F", "I", "SH"], emoji: "🐟", meaning: "An animal that swims!" },
    ]
  }
}

export async function generateFiveLetterWords(count = 6): Promise<GeneratedWord[]> {
  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"),
    prompt: `Generate ${count} five-letter words for a 5-year-old phonics app. Each should have:
    - A simple 5-letter word (like HOUSE, APPLE, HAPPY)
    - Sound chunks array (like ["H", "OU", "SE"] or ["A", "PP", "LE"])
    - An appropriate emoji
    - A simple meaning/description

    Format as JSON array:
    [{"word": "HOUSE", "sounds": ["H", "OU", "SE"], "emoji": "🏠", "meaning": "Where people live!"}, ...]

    Break words into logical phonetic chunks. Make sure words are age-appropriate.`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return [
      { word: "HOUSE", sounds: ["H", "OU", "SE"], emoji: "🏠", meaning: "Where people live!" },
      { word: "APPLE", sounds: ["A", "PP", "LE"], emoji: "🍎", meaning: "A red or green fruit!" },
      { word: "HAPPY", sounds: ["H", "A", "PP", "Y"], emoji: "😊", meaning: "Feeling good and joyful!" },
    ]
  }
}

export async function generateSimpleSentences(count = 5): Promise<GeneratedSentence[]> {
  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"),
    prompt: `Generate ${count} simple sentences for a 5-year-old phonics app. Each should have:
    - A simple sentence (3-5 words, like "The cat is big.")
    - Words array (like ["The", "cat", "is", "big."])
    - An appropriate emoji
    - A simple meaning/description

    Format as JSON array:
    [{"sentence": "The cat is big.", "words": ["The", "cat", "is", "big."], "emoji": "🐱", "meaning": "A large cat!"}, ...]

    Make sure sentences are:
    - Very simple and age-appropriate
    - Use common words 5-year-olds know
    - Have clear, relevant emojis
    - Easy to understand meanings`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return [
      { sentence: "The cat is big.", words: ["The", "cat", "is", "big."], emoji: "🐱", meaning: "A large cat!" },
      { sentence: "I see a dog.", words: ["I", "see", "a", "dog."], emoji: "🐶", meaning: "Looking at a dog!" },
      { sentence: "The sun is hot.", words: ["The", "sun", "is", "hot."], emoji: "☀️", meaning: "The sun feels warm!" },
    ]
  }
}

export async function generatePhonicsQuiz(
  level: "letters" | "three-letter" | "four-letter" | "five-letter" | "sentences",
  count = 5,
) {
  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-3.5-sonnet"),
    prompt: `Generate ${count} phonics quiz questions for ${level} level for a 5-year-old. 

    For letters: Ask about letter sounds
    For words: Ask about spelling, sounds, or meanings
    For sentences: Ask about word order or comprehension

    Format as JSON array with this structure:
    [
      {
        "question": "What sound does the letter B make?",
        "type": "multiple-choice",
        "options": ["buh", "bee", "bay", "boo"],
        "correct": 0,
        "explanation": "B makes the 'buh' sound!"
      },
      {
        "question": "Spell the word for this picture: 🐱",
        "type": "spelling",
        "answer": "CAT",
        "hint": "It's a furry pet that says meow!"
      }
    ]

    Include both multiple-choice and spelling questions. Make them engaging and age-appropriate.`,
  })

  try {
    return JSON.parse(text)
  } catch {
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
}
