"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Home, LogOut, User, Sparkles, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SoundToggle } from "@/components/sound-toggle"
import { StickerAlbum } from "@/components/sticker-album"
import { useProgress } from "@/hooks/useProgress"
import { playClickSound, playPopSound } from "@/lib/audio"

interface UserInfo {
  id: number
  email: string
  name: string
}

const NAV_ITEMS = [
  { href: "/letters", label: "Letters", emoji: "🔤" },
  { href: "/three-letter-words", label: "3-Letter", emoji: "📝" },
  { href: "/four-letter-words", label: "4-Letter", emoji: "📚" },
  { href: "/five-letter-words", label: "5-Letter", emoji: "🌟" },
  { href: "/sentences", label: "Sentences", emoji: "💬" },
  { href: "/quiz", label: "AI Quiz", emoji: "🧠" },
  { href: "/worksheets", label: "Worksheets", emoji: "🖨️" },
]

export function NavBar() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { progress } = useProgress()

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false))
  }, [])

  const handleLogout = async () => {
    playClickSound()
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/login")
  }

  const isHome = pathname === "/"

  return (
    <header className="mb-6 print:hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white/80 backdrop-blur-md rounded-3xl p-3 shadow-lg border-2 border-white/60">
        {/* Left Section: Home & Brand */}
        <div className="flex items-center gap-2">
          {!isHome ? (
            <Link href="/" onClick={() => playPopSound()}>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4 text-base font-black rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-md hover:from-purple-600 hover:to-indigo-700 active:scale-95 transition-all"
              >
                <Home className="w-5 h-5 mr-1.5" />
                Home
              </Button>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 px-2 group">
              <span className="text-3xl animate-bounce-slow">🎵</span>
              <span className="font-black text-xl text-purple-900 tracking-tight hidden sm:inline group-hover:text-purple-700 transition-colors">
                Phonics Fun!
              </span>
            </Link>
          )}

          {/* Quick Nav Chips */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => playClickSound()}>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
                      active
                        ? "bg-purple-600 text-white shadow-md scale-105"
                        : "bg-purple-50/70 hover:bg-purple-100/90 text-purple-800"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Section: Sound, Stickers, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Sound Toggle */}
          <SoundToggle />

          {/* Sticker Album Modal Trigger */}
          <StickerAlbum
            totalStickers={progress.totalStickers}
            currentStreak={progress.currentStreak}
          />

          {/* User Account / Guest State */}
          {!loadingUser && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-purple-50 rounded-full px-3 py-1.5 border border-purple-200 shadow-sm max-w-36">
                    <User className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => playClickSound()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 px-3.5 rounded-full font-bold text-xs border-2 border-purple-200 text-purple-700 bg-white hover:bg-purple-50 shadow-sm"
                  >
                    <span>🎈 Guest</span>
                    <span className="ml-1 text-[10px] text-purple-500 hidden sm:inline">(Sign In)</span>
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 px-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => playClickSound()} className="shrink-0">
              <button
                type="button"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 select-none active:scale-95 ${
                  active
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white/80 hover:bg-white text-purple-800 shadow-sm border border-purple-100"
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            </Link>
          )
        })}
      </div>
    </header>
  )
}
