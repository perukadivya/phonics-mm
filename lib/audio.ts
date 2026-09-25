// Kid-friendly Web Audio API Sound Effects + Speech Synthesis Engine
// Zero external MP3/WAV assets needed — works 100% offline & instantly!

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    const ctxClass =
      typeof window.AudioContext !== "undefined"
        ? window.AudioContext
        : "webkitAudioContext" in window
          ? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          : undefined

    if (!ctxClass) return null
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new ctxClass()
    }
    const active = audioCtx
    if (active && active.state === "suspended") {
      active.resume().catch(() => {})
    }
    return active
  } catch {
    return null
  }
}

// Sound enabled preference
export function isAudioMuted(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("phonics-muted") === "true"
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("phonics-muted", muted ? "true" : "false")
}

// ----------------- Web Audio SFX ----------------- //

/**
 * Play a bouncy bubble/pop sound
 */
export function playPopSound(): void {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime

    osc.type = "sine"
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08)

    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.13)
  } catch {
    // Ignore audio context errors
  }
}

/**
 * Play a crisp wooden marimba click sound
 */
export function playClickSound(): void {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime

    osc.type = "triangle"
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.06)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  } catch {
    // Ignore
  }
}

/**
 * Play a bright, happy success chime (C5 -> E5 -> G5 -> C6)
 */
export function playSuccessSound(): void {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.09

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.3, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + 0.5)
    })
  } catch {
    // Ignore
  }
}

/**
 * Play a magical twinkling star sparkle sound
 */
export function playStarSound(): void {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const freqs = [659.25, 880.0, 1046.5, 1318.51, 1567.98] // E5, A5, C6, E6, G6
    const now = ctx.currentTime

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + i * 0.07

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + 0.4)
    })
  } catch {
    // Ignore
  }
}

/**
 * Play a triumphant fanfare / celebration sound
 */
export function playCheerSound(): void {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.12 },
      { f: 523.25, t: 0.28, d: 0.12 },
      { f: 659.25, t: 0.42, d: 0.35 },
      { f: 587.33, t: 0.8, d: 0.15 },
      { f: 659.25, t: 0.98, d: 0.15 },
      { f: 783.99, t: 1.15, d: 0.6 },
    ]
    const now = ctx.currentTime

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + t

      osc.type = "triangle"
      osc.frequency.setValueAtTime(f, start)

      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, start + d)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + d + 0.05)
    })
  } catch {
    // Ignore
  }
}

/**
 * Play a gentle, curious "boing" / playful sound for wrong attempts (not harsh buzzer!)
 */
export function playWrongSound(): void {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime

    osc.type = "sine"
    osc.frequency.setValueAtTime(280, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)
  } catch {
    // Ignore
  }
}

// ----------------- Speech Synthesis (TTS) ----------------- //

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices || voices.length === 0) return null

  // Prefer friendly English voices
  const preferred = [
    "Google US English",
    "Samantha",
    "Karen",
    "Victoria",
    "Fiona",
    "Moira",
    "en-US",
    "en-GB",
  ]

  for (const name of preferred) {
    const found = voices.find((v) => v.name.includes(name) || v.lang.startsWith(name))
    if (found) return found
  }

  // Fallback to any english voice
  const en = voices.find((v) => v.lang.startsWith("en"))
  return en || voices[0] || null
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // Ignore
  }
}

export function speakText(
  text: string,
  options: { rate?: number; pitch?: number; onEnd?: () => void } = {}
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  if (isAudioMuted()) return

  try {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate ?? 0.82 // Slightly slower for kids
    utterance.pitch = options.pitch ?? 1.15 // Friendly, slightly higher tone

    const voice = getBestVoice()
    if (voice) utterance.voice = voice

    if (options.onEnd) {
      utterance.onend = options.onEnd
    }

    window.speechSynthesis.speak(utterance)
  } catch {
    // Fallback gracefully
  }
}

/**
 * Phonetics sound pronunciation map for speech synthesizer
 */
export const PHONETIC_SPEECH: Record<string, string> = {
  A: "ah",
  B: "buh",
  C: "kuh",
  D: "duh",
  E: "eh",
  F: "fuh",
  G: "guh",
  H: "huh",
  I: "ih",
  J: "juh",
  K: "kuh",
  L: "luh",
  M: "muh",
  N: "nuh",
  O: "oh",
  P: "puh",
  Q: "kwuh",
  R: "ruh",
  S: "sss",
  T: "tuh",
  U: "uh",
  V: "vuh",
  W: "wuh",
  X: "ks",
  Y: "yuh",
  Z: "zzz",
}

/**
 * Cheerful phonics phrase for letter sound
 */
export function speakLetterSound(letter: string, sound?: string): void {
  const cleanLetter = letter.toUpperCase()
  const soundPhonetic = sound || PHONETIC_SPEECH[cleanLetter] || cleanLetter
  speakText(`${cleanLetter} says, ${soundPhonetic}!`, { rate: 0.78, pitch: 1.2 })
}

/**
 * Read letter, sound, and example word clearly
 */
export function speakPhonicsWord(letter: string, sound: string, word: string): void {
  const cleanLetter = letter.toUpperCase()
  speakText(`${cleanLetter}. ${sound}. ${word}!`, { rate: 0.8, pitch: 1.2 })
}
