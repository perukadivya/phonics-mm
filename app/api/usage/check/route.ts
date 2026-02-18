import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkUsage, getClientIP } from "@/lib/usage"
import type { UsageType } from "@/lib/usage"

export async function POST(request: Request) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: "Please log in first" }, { status: 401 })
    }

    try {
        const { type } = (await request.json()) as { type: UsageType }

        if (type !== "worksheets" && type !== "quiz") {
            return NextResponse.json({ error: "Invalid usage type" }, { status: 400 })
        }

        const ip = await getClientIP(request)
        const result = await checkUsage(user.id, ip, type)

        return NextResponse.json(result)
    } catch (error) {
        console.error("Usage check error:", error)
        return NextResponse.json({ error: "Failed to check usage" }, { status: 500 })
    }
}
