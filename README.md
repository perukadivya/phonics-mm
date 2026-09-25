# 🎵 Phonics Fun! 🎵
> An interactive, delightful phonics learning application designed specifically for young readers (Ages 3–8).

![Next.js 15](https://img.shields.io/badge/Next.js-15.2.8-black?style=flat&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)

---

## 🌟 What is Phonics Fun?

**Phonics Fun!** teaches children to read through **Systematic Synthetic Phonics** — the most scientifically proven method for early literacy. Children connect letters to their individual sounds, blend phonemes into decodable words, build sentences, earn collectible milestone stickers, and print hands-on practice worksheets.

---

## 🚀 Key Modules & Features

### 1. 🔤 Alphabet Letter Sounds (`/letters`)
- Complete **26-letter phonics alphabet (A through Z)**.
- **Phonetics Audio**: Web Speech API tuned with pitch & rate optimized for child clarity.
- **Mouth Guidance**: Simple instructions on how to shape lips and tongue for each letter sound.
- **Primary & Secondary Vocabulary**: 4+ illustrated words per letter (e.g. A = Apple, Ant, Astronaut, Airplane).
- **Letter Rhymes**: Catchy rhymes for memory retention.
- **Quick A–Z Soundboard**: Jump to any letter instantly.

### 2. 📝 3-Letter Words & CVC Blending (`/three-letter-words`)
- High-frequency **Consonant-Vowel-Consonant (CVC)** word bank (`CAT`, `DOG`, `SUN`, `BAT`, `BED`, etc.).
- **Learn & Blend**: Tap individual phoneme tiles to hear each sound, then tap **Blend** to hear sounds fuse into the whole word.
- **Spell & Pop Game**: Bouncy bubble letter tiles for children to spell the word corresponding to the picture.

### 3. 📚 4-Letter Words & Blends (`/four-letter-words`)
- Initial/final consonant blends (`TR`, `ST`, `FR`, `CK`) and vowel digraphs (`OO`, `EE`, `AI`, `AR`).
- **Picture Match Memory Game**: Interactive flip cards matching words to picture emojis with chime feedback and confetti rewards.

### 4. 🌟 5-Letter Words (`/five-letter-words`)
- Compound and multi-syllable phonics words (`HOUSE`, `APPLE`, `HAPPY`, `WATER`, `SMILE`, `HEART`).
- **Spelling Quest**: Features a child-friendly on-screen keyboard (perfect for tablets & touchscreens) alongside physical keyboard support.

### 5. 💬 Simple Sentences (`/sentences`)
- Decodable phonics sentences for early readers (`"The cat sat on the mat."`, `"A big dog can run fast."`).
- **Word-by-Word Read-Along**: Tap any word in the sentence to listen to its pronunciation individually, or listen to the full sentence.
- **Sentence Puzzle**: Unscramble word blocks to reconstruct the sentence in order.

### 6. 🧠 AI Phonics Quiz Challenge (`/quiz`)
- 5 skill levels (Letters, 3-Letter, 4-Letter, 5-Letter, Sentences).
- Voice narration prompts ("Listen Aloud").
- Cheerful instant feedback with positive reinforcement (no punitive buzzers).
- Star rating system and celebration fanfare (`playCheerSound()`).

### 7. 🖨️ Printable Worksheets (`/worksheets`)
- **Instant Live Preview** across 8 worksheet formats:
  - ✏️ **Letter Tracing** with genuine handwriting guidelines (headline, dashed midline, baseline).
  - 🔤 **Letter Sounds & Picture Coloring**.
  - 📝 **3-Letter CVC Words Copying**.
  - 📚 **4-Letter Blends & Digraphs**.
  - 🌟 **5-Letter Big Words**.
  - 💬 **Sentence Copying**.
  - 🎯 **Picture & Word Line Matching**.
  - 🧩 **Fill-in-the-Blank Vowel Practice**.
- Child name personalization, date field, star rating stamps, and parent/teacher signature box.
- One-click print with optimized `@media print` A4 stylesheets.

---

## 🎨 Kid-Friendly Audio & UI Design System

- **Zero-Dependency Web Audio Synthesizer (`lib/audio.ts`)**:
  - `playPopSound()`: Bubbly tactile pop sound.
  - `playSuccessSound()`: Cheerful C5-E5-G5-C6 major arpeggio.
  - `playStarSound()`: Magical twinkling sparkle.
  - `playCheerSound()`: Triumphant celebration fanfare.
  - `playWrongSound()`: Gentle, curious "boing" tone.
  - `playClickSound()`: Crisp wooden marimba tap.
- **Sound Toggle (`components/sound-toggle.tsx`)**: Quick one-click mute/unmute persisted in `localStorage`.
- **Mascots (`components/mascot.tsx`)**: Friendly animated guides — Leo the Lion 🦁, Pip the Penguin 🐧, Oliver the Owl 🦉, and Bella the Bunny 🐰.
- **Sticker Album (`components/sticker-album.tsx`)**: Collectible milestone badges earned through learning stars.
- **Celebration Confetti (`components/confetti.tsx`)**: Pure CSS particle animations upon completing activities.

---

## 🛠️ Architecture & Resilience

### Dual Database Fallback (`lib/db.ts`)
- **Cloud/Production**: Automatically connects to PostgreSQL (`@vercel/postgres` or Neon) when `POSTGRES_URL` or `DATABASE_URL` is configured.
- **Local/Offline**: Seamlessly defaults to Node.js's built-in SQLite (`node:sqlite`) storing data in `.data/phonics.db` with zero configuration or external setup required.

### Guest Mode & Seamless Auth
- All educational modules are completely open to guests.
- Progress automatically saves to `localStorage` for guests and synchronizes with user accounts when signed in.

### Multi-Provider AI Generator (`lib/ai-generator.ts`)
- Supports **OpenRouter**, **OpenAI**, or **NVIDIA** chat completions.
- Includes a guaranteed, high-quality curated dataset fallback (`lib/phonics-data.ts`) ensuring zero downtime, 500 errors, or crashes if external AI APIs are offline or missing credentials.

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd phonics

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Compile and build production bundle
npm run build

# Start production server
npm start
```

---

## 🔐 Environment Variables (Optional)

All core learning features and offline SQLite work **with zero environment variables**. For optional cloud database, payments, or live AI generation, you can configure:

| Variable | Description |
| :--- | :--- |
| `POSTGRES_URL` | Vercel Postgres / Neon connection URL |
| `JWT_SECRET` | Secret key for JWT session tokens |
| `OPENROUTER_API_KEY` | OpenRouter API key for dynamic AI generation |
| `OPENAI_API_KEY` | OpenAI API key (alternative provider) |
| `NVIDIA_API_KEY` | NVIDIA API key (alternative provider) |
| `RAZORPAY_KEY_ID` | Razorpay Key ID for payments |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

---

## 📄 License

MIT License. Designed with ❤️ for kids and educators everywhere.
