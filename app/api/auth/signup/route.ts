import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth"

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
        const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
        }

        // Create user
        const passwordHash = await hashPassword(password)
        const result = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${name || ''})
      RETURNING id, email, name
    `
        const user = result.rows[0]

        // Create empty progress row
        await sql`INSERT INTO user_progress (user_id) VALUES (${user.id})`

        // Set session cookie
        const token = await signToken({ id: user.id, email: user.email, name: user.name || "" })
        await setSessionCookie(token)

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }
}
