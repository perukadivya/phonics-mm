import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "phonics-app-secret-change-me-in-production"
)

const COOKIE_NAME = "phonics-session"

export interface SessionUser {
    id: number
    email: string
    name: string
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export async function signToken(user: SessionUser): Promise<string> {
    return new SignJWT({ sub: String(user.id), email: user.email, name: user.name })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return {
            id: Number(payload.sub),
            email: payload.email as string,
            name: (payload.name as string) || "",
        }
    } catch {
        return null
    }
}

export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    })
}

export async function clearSessionCookie() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

export { COOKIE_NAME }
