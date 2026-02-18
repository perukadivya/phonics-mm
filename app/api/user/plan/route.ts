import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserPlan } from "@/lib/usage"

export async function GET() {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { plan, expiresAt } = await getUserPlan(user.id)
        return NextResponse.json({ plan, expiresAt })
    } catch (error) {
        console.error("Get plan error:", error)
        return NextResponse.json({ plan: "free", expiresAt: null })
    }
}
