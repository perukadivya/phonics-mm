import {
    type PlanId,
    FREE_LIMITS,
    DAILY_LIMITS,
    hasUnlimitedWorksheets,
    hasUnlimitedQuiz,
    getActivePlan,
} from "@/lib/plans"
import {
    getUserPlan as dbGetUserPlan,
    getDailyUsage,
    getTotalUsage,
    getIPUsage,
    incrementUsage as dbIncrementUsage,
} from "@/lib/db"

export type UsageType = "worksheets" | "quiz"

export async function getClientIP(request: Request): Promise<string> {
    const forwarded = request.headers.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()
    const real = request.headers.get("x-real-ip")
    if (real) return real.trim()
    return "127.0.0.1"
}

export async function getUserPlan(userId: number): Promise<{ plan: PlanId; expiresAt: string | null }> {
    if (!userId || userId <= 0) return { plan: "free", expiresAt: null }
    const result = await dbGetUserPlan(userId)
    return {
        plan: getActivePlan(result.plan, result.expiresAt),
        expiresAt: result.expiresAt,
    }
}

export { getDailyUsage, getTotalUsage, getIPUsage }

export async function incrementUsage(userId: number, ip: string, type: UsageType): Promise<void> {
    await dbIncrementUsage(userId, ip, type)
}

export interface UsageCheckResult {
    allowed: boolean
    reason?: string
    used: number
    limit: number
    planRequired?: PlanId
}

export async function checkUsage(userId: number, ip: string, type: UsageType): Promise<UsageCheckResult> {
    if (!userId || userId <= 0) {
        // Guest user - check IP usage
        const ipUsage = await getIPUsage(ip)
        const freeLimit = type === "worksheets" ? FREE_LIMITS.worksheets : FREE_LIMITS.quiz
        const ipUsed = type === "worksheets" ? ipUsage.worksheetCount : ipUsage.quizCount
        if (ipUsed >= freeLimit) {
            const suggestedPlan: PlanId = type === "worksheets" ? "worksheets" : "quiz"
            return {
                allowed: false,
                reason: `You've used all ${freeLimit} free ${type === "worksheets" ? "worksheet generations" : "quiz questions"}. Sign up or upgrade to continue! ✨`,
                used: ipUsed,
                limit: freeLimit,
                planRequired: suggestedPlan,
            }
        }
        return { allowed: true, used: ipUsed, limit: freeLimit }
    }

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
