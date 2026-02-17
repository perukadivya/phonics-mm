import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getSession } from "@/lib/auth"

export async function GET() {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const result = await sql`
      SELECT letters, three_letter_words, four_letter_words, five_letter_words,
             sentences, total_stickers, current_streak, completed_items
      FROM user_progress WHERE user_id = ${user.id}
    `
        if (result.rows.length === 0) {
            // Create progress row if it doesn't exist
            await sql`INSERT INTO user_progress (user_id) VALUES (${user.id})`
            return NextResponse.json({
                progress: {
                    letters: 0, threeLetterWords: 0, fourLetterWords: 0, fiveLetterWords: 0,
                    sentences: 0, totalStickers: 0, currentStreak: 0, completedItems: {},
                },
            })
        }

        const row = result.rows[0]
        return NextResponse.json({
            progress: {
                letters: row.letters,
                threeLetterWords: row.three_letter_words,
                fourLetterWords: row.four_letter_words,
                fiveLetterWords: row.five_letter_words,
                sentences: row.sentences,
                totalStickers: row.total_stickers,
                currentStreak: row.current_streak,
                completedItems: row.completed_items || {},
            },
        })
    } catch (error) {
        console.error("Get progress error:", error)
        return NextResponse.json({ error: "Failed to load progress" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            letters, threeLetterWords, fourLetterWords, fiveLetterWords,
            sentences, totalStickers, currentStreak, completedItems,
        } = body

        await sql`
      INSERT INTO user_progress (user_id, letters, three_letter_words, four_letter_words, five_letter_words, sentences, total_stickers, current_streak, completed_items, updated_at)
      VALUES (${user.id}, ${letters ?? 0}, ${threeLetterWords ?? 0}, ${fourLetterWords ?? 0}, ${fiveLetterWords ?? 0}, ${sentences ?? 0}, ${totalStickers ?? 0}, ${currentStreak ?? 0}, ${JSON.stringify(completedItems || {})}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        letters = COALESCE(${letters}, user_progress.letters),
        three_letter_words = COALESCE(${threeLetterWords}, user_progress.three_letter_words),
        four_letter_words = COALESCE(${fourLetterWords}, user_progress.four_letter_words),
        five_letter_words = COALESCE(${fiveLetterWords}, user_progress.five_letter_words),
        sentences = COALESCE(${sentences}, user_progress.sentences),
        total_stickers = COALESCE(${totalStickers}, user_progress.total_stickers),
        current_streak = COALESCE(${currentStreak}, user_progress.current_streak),
        completed_items = COALESCE(${JSON.stringify(completedItems || {})}, user_progress.completed_items),
        updated_at = NOW()
    `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update progress error:", error)
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }
}
