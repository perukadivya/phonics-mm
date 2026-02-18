import { sql } from "@vercel/postgres"
import { type PlanId, FREE_LIMITS, DAILY_LIMITS, hasUnlimitedWorksheets, hasUnlimitedQuiz, getActivePlan } from "@/lib/plans"

export type UsageType = "worksheets" | "quiz"

export async function getClientIP(request: Request): Promise<string> {
    const forwarded = request.headers.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()
    const real = request.headers.get("x-real-ip")
    if (real) return real.trim()
    return "unknown"
}

export async function getUserPlan(userId: number): Promise<{ plan: PlanId; expiresAt: string | null }> {
    const result = await sql`SELECT plan, plan_expires_at FROM users WHERE id = ${userId}`
    if (result.rows.length === 0) return { plan: "free", expiresAt: null }
    const row = result.rows[0]
    return {
        plan: getActivePlan(row.plan, row.plan_expires_at),
        expiresAt: row.plan_expires_at,
    }
}

export async function getDailyUsage(userId: number): Promise<{ worksheetCount: number; quizCount: number }> {
    const result = await sql`
    SELECT worksheet_count, quiz_count FROM usage_logs
    WHERE user_id = ${userId} AND log_date = CURRENT_DATE
  `
    if (result.rows.length === 0) return { worksheetCount: 0, quizCount: 0 }
    return {
        worksheetCount: result.rows[0].worksheet_count,
        quizCount: result.rows[0].quiz_count,
    }
}

export async function getTotalUsage(userId: number): Promise<{ totalWorksheets: number; totalQuiz: number }> {
    const result = await sql`
    SELECT COALESCE(SUM(worksheet_count), 0) as tw, COALESCE(SUM(quiz_count), 0) as tq
    FROM usage_logs WHERE user_id = ${userId}
  `
    return {
        totalWorksheets: Number(result.rows[0]?.tw ?? 0),
        totalQuiz: Number(result.rows[0]?.tq ?? 0),
    }
}

export async function getIPUsage(ip: string): Promise<{ worksheetCount: number; quizCount: number }> {
    const result = await sql`
    SELECT worksheet_count, quiz_count FROM ip_usage_logs WHERE ip_address = ${ip}
  `
    if (result.rows.length === 0) return { worksheetCount: 0, quizCount: 0 }
    return {
        worksheetCount: result.rows[0].worksheet_count,
        quizCount: result.rows[0].quiz_count,
    }
}

export async function incrementUsage(userId: number, ip: string, type: UsageType): Promise<void> {
    if (type === "worksheets") {
        // Increment user daily worksheet usage
        await sql`
      INSERT INTO usage_logs (user_id, ip_address, log_date, worksheet_count)
      VALUES (${userId}, ${ip}, CURRENT_DATE, 1)
      ON CONFLICT (user_id, log_date) DO UPDATE SET
        worksheet_count = usage_logs.worksheet_count + 1
    `
        // Increment IP total worksheet usage
        await sql`
      INSERT INTO ip_usage_logs (ip_address, worksheet_count)
      VALUES (${ip}, 1)
      ON CONFLICT (ip_address) DO UPDATE SET
        worksheet_count = ip_usage_logs.worksheet_count + 1
    `
    } else {
        // Increment user daily quiz usage
        await sql`
      INSERT INTO usage_logs (user_id, ip_address, log_date, quiz_count)
      VALUES (${userId}, ${ip}, CURRENT_DATE, 1)
      ON CONFLICT (user_id, log_date) DO UPDATE SET
        quiz_count = usage_logs.quiz_count + 1
    `
        // Increment IP total quiz usage
        await sql`
      INSERT INTO ip_usage_logs (ip_address, quiz_count)
      VALUES (${ip}, 1)
      ON CONFLICT (ip_address) DO UPDATE SET
        quiz_count = ip_usage_logs.quiz_count + 1
    `
    }
}

export interface UsageCheckResult {
    allowed: boolean
    reason?: string
    used: number
    limit: number
    planRequired?: PlanId
}

export async function checkUsage(userId: number, ip: string, type: UsageType): Promise<UsageCheckResult> {
    const { plan } = await getUserPlan(userId)
    const isUnlimited = type === "worksheets" ? hasUnlimitedWorksheets(plan) : hasUnlimitedQuiz(plan)

    if (isUnlimited) {
        // Check daily limits even for paid users
        const daily = await getDailyUsage(userId)
        const dailyUsed = type === "worksheets" ? daily.worksheetCount : daily.quizCount
        const dailyLimit = type === "worksheets" ? DAILY_LIMITS.worksheets : DAILY_LIMITS.quiz

        if (dailyUsed >= dailyLimit) {
            return {
                allowed: false,
                reason: `Daily limit reached (${dailyLimit}/${type === "worksheets" ? "worksheets" : "questions"} per day). Come back tomorrow! 🌙`,
                used: dailyUsed,
                limit: dailyLimit,
            }
        }

        return { allowed: true, used: dailyUsed, limit: dailyLimit }
    }

    // Free tier — check total lifetime usage per account AND per IP
    const totalUsage = await getTotalUsage(userId)
    const ipUsage = await getIPUsage(ip)
    const freeLimit = type === "worksheets" ? FREE_LIMITS.worksheets : FREE_LIMITS.quiz
    const totalUsed = type === "worksheets" ? totalUsage.totalWorksheets : totalUsage.totalQuiz
    const ipUsed = type === "worksheets" ? ipUsage.worksheetCount : ipUsage.quizCount

    // Block if either the account or the IP has exceeded free limits
    const effectiveUsed = Math.max(totalUsed, ipUsed)

    if (effectiveUsed >= freeLimit) {
        const suggestedPlan: PlanId = type === "worksheets" ? "worksheets" : "quiz"
        return {
            allowed: false,
            reason: `You've used all ${freeLimit} free ${type === "worksheets" ? "worksheet generations" : "quiz questions"}. Upgrade to continue! ✨`,
            used: effectiveUsed,
            limit: freeLimit,
            planRequired: suggestedPlan,
        }
    }

    return { allowed: true, used: effectiveUsed, limit: freeLimit }
}
