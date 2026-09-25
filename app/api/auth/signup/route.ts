import { NextResponse } from "next/server"
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth"
import { findUserByEmail, createUser } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // Check if user already exists
        const existing = await findUserByEmail(email)
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
        }

        // Create user
        const passwordHash = await hashPassword(password)
        const user = await createUser(email, passwordHash, name || "")


        // Set session cookie
        const token = await signToken({ id: user.id, email: user.email, name: user.name || "" })
        await setSessionCookie(token)

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }
}
