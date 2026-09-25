"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isAudioMuted, setAudioMuted, playClickSound } from "@/lib/audio"

export function SoundToggle({ className = "" }: { className?: string }) {
  const [muted, setMuted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMuted(isAudioMuted())
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const nextState = !muted
    setMuted(nextState)
    setAudioMuted(nextState)
    if (!nextState) {
      playClickSound()
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full p-2 h-10 w-10 bg-white/80 ${className}`}
        aria-label="Sound settings"
      >
        <Volume2 className="w-5 h-5 text-purple-600" />
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className={`rounded-full h-11 px-3 border-2 border-purple-200 bg-white/90 hover:bg-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
        muted ? "text-gray-400 border-gray-200" : "text-purple-600 hover:text-purple-700"
      } ${className}`}
      title={muted ? "Sound muted — click to unmute" : "Sound on — click to mute"}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      {muted ? (
        <>
          <VolumeX className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-bold text-rose-500 hidden sm:inline">Muted</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-bold text-purple-700 hidden sm:inline">Sound</span>
        </>
      )}
    </Button>
  )
}
