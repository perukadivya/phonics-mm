"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Check, Crown, Sparkles, Loader2 } from "lucide-react"
import { PLANS, type PlanId } from "@/lib/plans"

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void }
    }
}

const planOrder: PlanId[] = ["free", "study", "worksheets", "quiz", "worksheets_quiz", "complete"]

export default function PricingPage() {
    const [currentPlan, setCurrentPlan] = useState<PlanId>("free")
    const [loading, setLoading] = useState<PlanId | null>(null)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [pageLoading, setPageLoading] = useState(true)

    useEffect(() => {
        // Load current plan
        fetch("/api/user/plan")
            .then((res) => res.json())
            .then((data) => {
                if (data.plan) setCurrentPlan(data.plan)
            })
            .catch(() => { })
            .finally(() => setPageLoading(false))

        // Load Razorpay script
        if (!document.getElementById("razorpay-script")) {
            const script = document.createElement("script")
            script.id = "razorpay-script"
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.async = true
            document.body.appendChild(script)
        }
    }, [])

    const handlePurchase = async (planId: PlanId) => {
        if (planId === "free" || planId === currentPlan) return

        setLoading(planId)
        setMessage(null)

        try {
            // Create order
            const orderRes = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            })
            const orderData = await orderRes.json()

            if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order")

            // Open Razorpay checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Phonics Fun!",
                description: `${orderData.plan.name} — ₹${orderData.plan.price}/month`,
                order_id: orderData.orderId,
                handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                    // Verify payment
                    try {
                        const verifyRes = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        })
                        const verifyData = await verifyRes.json()

                        if (verifyRes.ok && verifyData.success) {
                            setCurrentPlan(verifyData.plan)
                            setMessage({ type: "success", text: "🎉 Payment successful! Your plan is now active." })
                        } else {
                            setMessage({ type: "error", text: verifyData.error || "Verification failed" })
                        }
                    } catch {
                        setMessage({ type: "error", text: "Payment verification failed. Contact support." })
                    }
                    setLoading(null)
                },
                modal: {
                    ondismiss: () => setLoading(null),
                },
                theme: {
                    color: "#9333ea",
                },
            }

            if (typeof window.Razorpay === "undefined") {
                throw new Error("Payment system is loading. Please try again.")
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            setMessage({ type: "error", text: error instanceof Error ? error.message : "Something went wrong" })
            setLoading(null)
        }
    }

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold text-lg">Loading plans...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10 font-bold text-lg gap-2">
                            <Home className="w-5 h-5" /> Home
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg flex items-center gap-2">
                        <Crown className="w-7 h-7" /> Choose Your Plan
                    </h1>
                    <div className="w-24" />
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`rounded-2xl p-4 mb-6 text-center font-bold text-sm animate-fadeIn ${message.type === "success"
                                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                                : "bg-red-100 text-red-700 border-2 border-red-300"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Current Plan Badge */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-white font-bold text-sm">
                        <Sparkles className="w-4 h-4" />
                        Current Plan: {PLANS[currentPlan].emoji} {PLANS[currentPlan].name}
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {planOrder.map((planId) => {
                        const plan = PLANS[planId]
                        const isCurrent = planId === currentPlan
                        const isPopular = planId === "complete"

                        return (
                            <div
                                key={planId}
                                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${isCurrent ? "ring-4 ring-purple-400 scale-[1.02]" : "hover:scale-[1.01] hover:shadow-2xl"
                                    } ${isPopular ? "lg:scale-105 lg:hover:scale-[1.07]" : ""}`}
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl">
                                        ⭐ BEST VALUE
                                    </div>
                                )}

                                {/* Current Badge */}
                                {isCurrent && (
                                    <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-black px-4 py-1.5 rounded-br-2xl">
                                        ✅ ACTIVE
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Plan Header */}
                                    <div className="text-center mb-4">
                                        <div className="text-4xl mb-2">{plan.emoji}</div>
                                        <h3 className="text-xl font-black text-gray-800">{plan.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-center mb-5">
                                        {plan.price === 0 ? (
                                            <div className="text-3xl font-black text-gray-800">Free</div>
                                        ) : (
                                            <div>
                                                <span className="text-4xl font-black text-gray-800">₹{plan.price}</span>
                                                <span className="text-gray-400 font-semibold text-sm">/month</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2.5 mb-6">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Button */}
                                    {isCurrent ? (
                                        <Button
                                            disabled
                                            className="w-full py-5 rounded-2xl font-black text-sm bg-gray-100 text-gray-400"
                                        >
                                            Current Plan
                                        </Button>
                                    ) : plan.price === 0 ? (
                                        <Button
                                            disabled
                                            className="w-full py-5 rounded-2xl font-black text-sm bg-gray-100 text-gray-400"
                                        >
                                            Included
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handlePurchase(planId)}
                                            disabled={loading !== null}
                                            className={`w-full py-5 rounded-2xl font-black text-sm text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-r ${plan.color} hover:scale-[1.02]`}
                                        >
                                            {loading === planId ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Crown className="w-4 h-4 mr-2" />
                                                    {currentPlan !== "free" ? "Switch Plan" : "Upgrade Now"}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 inline-block">
                        <p className="text-white/80 text-xs font-semibold leading-relaxed">
                            🔒 Secure payments via Razorpay (UPI, Cards, Wallets) &nbsp;•&nbsp;
                            📱 Cancel anytime &nbsp;•&nbsp;
                            💳 No hidden charges
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
