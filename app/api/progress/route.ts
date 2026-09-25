import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserProgress, saveUserProgress } from "@/lib/db"

export async function GET() {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ guest: true, progress: null })
    }

    try {
        const progress = await getUserProgress(user.id)
        return NextResponse.json({ progress, guest: false })
    } catch (error) {
        console.error("Get progress error:", error)
        return NextResponse.json({ error: "Failed to load progress" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ guest: true, saved: false })
    }

    try {
        const body = await request.json()
        await saveUserProgress(user.id, body)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update progress error:", error)
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }
}
