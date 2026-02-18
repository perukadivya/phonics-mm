import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "phonics-session"

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/pricing"]
const PUBLIC_API_ROUTES = ["/api/auth/login", "/api/auth/signup"]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(COOKIE_NAME)?.value

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_API_ROUTES.includes(pathname)) {
        // If authenticated user visits login/signup, redirect to home
        if (token && PUBLIC_ROUTES.includes(pathname)) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        return NextResponse.next()
    }

    // Allow all other API routes through (they check auth internally)
    if (pathname.startsWith("/api/")) {
        return NextResponse.next()
    }

    // Redirect unauthenticated users to login
    if (!token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("from", pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
