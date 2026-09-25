"use client"

import { useEffect, useState } from "react"

interface ConfettiProps {
  active: boolean
  duration?: number
  onComplete?: () => void
}

const COLORS = [
  "#f43f5e", // rose
  "#ec4899", // pink
  "#a855f7", // purple
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#eab308", // yellow
  "#06b6d4", // cyan
]

const SHAPES = ["★", "●", "▲", "✦", "■", "🌸", "⭐", "🎉"]

export function Confetti({ active, duration = 3500, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      color: string
      size: number
      shape: string
      delay: number
      duration: number
      rotation: number
    }>
  >([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const newParticles = Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across screen
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.floor(Math.random() * 20) + 16,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      delay: Math.random() * 0.6,
      duration: Math.random() * 1.5 + 2,
      rotation: Math.random() * 360,
    }))

    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [active, duration, onComplete])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none font-bold"
          style={{
            left: `${p.x}vw`,
            top: "-40px",
            color: p.color,
            fontSize: `${p.size}px`,
            animation: `confetti-fall ${p.duration}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.shape}
        </div>
      ))}
    </div>
  )
}
