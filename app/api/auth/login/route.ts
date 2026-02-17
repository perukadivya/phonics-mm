import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { comparePassword, signToken, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        // Find user
        const result = await sql`
      SELECT id, email, name, password_hash FROM users WHERE email = ${email.toLowerCase()}
    `
        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        const user = result.rows[0]

        // Verify password
        const valid = await comparePassword(password, user.password_hash)
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        // Set session cookie
        const token = await signToken({ id: user.id, email: user.email, name: user.name || "" })
        await setSessionCookie(token)

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
    }
}
