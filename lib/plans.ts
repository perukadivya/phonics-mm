export type PlanId = "free" | "study" | "worksheets" | "quiz" | "worksheets_quiz" | "complete"

export interface PlanInfo {
    id: PlanId
    name: string
    price: number // INR per month
    emoji: string
    description: string
    features: string[]
    color: string // gradient classes
}

export const PLANS: Record<PlanId, PlanInfo> = {
    free: {
        id: "free",
        name: "Free",
        price: 0,
        emoji: "🌱",
        description: "Start your phonics journey",
        features: [
            "Letter Sounds — unlimited",
            "3 worksheet generations",
            "3 AI quiz questions",
        ],
        color: "from-gray-400 to-gray-500",
    },
    study: {
        id: "study",
        name: "Study Plan",
        price: 99,
        emoji: "📚",
        description: "All learning modules",
        features: [
            "Letter Sounds — unlimited",
            "3-Letter Words — unlimited",
            "4-Letter Words — unlimited",
            "5-Letter Words — unlimited",
            "Simple Sentences — unlimited",
            "3 worksheet generations",
            "3 AI quiz questions",
        ],
        color: "from-emerald-500 to-teal-600",
    },
    worksheets: {
        id: "worksheets",
        name: "Worksheets Only",
        price: 99,
        emoji: "📝",
        description: "Unlimited printable worksheets",
        features: [
            "Letter Sounds — unlimited",
            "Unlimited worksheets (20/day)",
            "All worksheet types",
            "3 AI quiz questions",
        ],
        color: "from-blue-500 to-indigo-600",
    },
    quiz: {
        id: "quiz",
        name: "AI Quiz Only",
        price: 99,
        emoji: "🧠",
        description: "Unlimited AI-powered quizzes",
        features: [
            "Letter Sounds — unlimited",
            "Unlimited AI quiz (30/day)",
            "Adaptive difficulty",
            "3 worksheet generations",
        ],
        color: "from-purple-500 to-violet-600",
    },
    worksheets_quiz: {
        id: "worksheets_quiz",
        name: "Worksheets + Quiz",
        price: 149,
        emoji: "✨",
        description: "Worksheets & quizzes together",
        features: [
            "Letter Sounds — unlimited",
            "Unlimited worksheets (20/day)",
            "Unlimited AI quiz (30/day)",
            "All worksheet types",
        ],
        color: "from-orange-500 to-rose-600",
    },
    complete: {
        id: "complete",
        name: "Complete Access",
        price: 200,
        emoji: "🌟",
        description: "Everything — the full experience",
        features: [
            "All learning modules",
            "Unlimited worksheets (20/day)",
            "Unlimited AI quiz (30/day)",
            "All worksheet types",
            "Priority AI generation",
        ],
        color: "from-pink-500 to-fuchsia-600",
    },
}

export const FREE_LIMITS = { worksheets: 3, quiz: 3 }
export const DAILY_LIMITS = { worksheets: 20, quiz: 30 }

type Feature = "letters" | "three-letter-words" | "four-letter-words" | "five-letter-words" | "sentences" | "worksheets" | "quiz"

const PLAN_FEATURES: Record<PlanId, Feature[]> = {
    free: ["letters"],
    study: ["letters", "three-letter-words", "four-letter-words", "five-letter-words", "sentences"],
    worksheets: ["letters", "worksheets"],
    quiz: ["letters", "quiz"],
    worksheets_quiz: ["letters", "worksheets", "quiz"],
    complete: ["letters", "three-letter-words", "four-letter-words", "five-letter-words", "sentences", "worksheets", "quiz"],
}

export function canAccessFeature(plan: PlanId, feature: Feature): boolean {
    return PLAN_FEATURES[plan]?.includes(feature) ?? false
}

export function hasUnlimitedWorksheets(plan: PlanId): boolean {
    return ["worksheets", "worksheets_quiz", "complete"].includes(plan)
}

export function hasUnlimitedQuiz(plan: PlanId): boolean {
    return ["quiz", "worksheets_quiz", "complete"].includes(plan)
}

export function isPlanExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return true
    return new Date(expiresAt) < new Date()
}

export function getActivePlan(plan: string | null | undefined, expiresAt: string | null | undefined): PlanId {
    if (!plan || plan === "free") return "free"
    if (isPlanExpired(expiresAt)) return "free"
    return plan as PlanId
}
