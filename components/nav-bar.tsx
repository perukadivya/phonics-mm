"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Home, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserInfo {
    id: number
    email: string
    name: string
}

export function NavBar() {
    const [user, setUser] = useState<UserInfo | null>(null)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user) setUser(data.user)
            })
            .catch(() => { })
    }, [])

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/login")
    }

    const isHome = pathname === "/"

    return (
        <div className="flex items-center justify-between mb-6 print:hidden">
            {!isHome ? (
                <Link href="/">
                    <Button variant="outline" size="lg" className="text-lg bg-white/90 hover:bg-white border-0 shadow-lg">
                        <Home className="w-5 h-5 mr-2" />
                        Home
                    </Button>
                </Link>
            ) : (
                <div />
            )}

            {user && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 shadow-lg">
                        <User className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-gray-700 max-w-32 truncate">
                            {user.name || user.email}
                        </span>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        size="sm"
                        className="bg-white/90 hover:bg-white border-0 shadow-lg text-red-600 hover:text-red-700"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
