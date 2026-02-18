import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PLANS, type PlanId } from "@/lib/plans"
import { sql } from "@vercel/postgres"

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ""
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

export async function POST(request: Request) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: "Please log in first" }, { status: 401 })
    }

    try {
        const { planId } = (await request.json()) as { planId: PlanId }
        const plan = PLANS[planId]

        if (!plan || plan.price === 0) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
        }

        const amountInPaise = plan.price * 100

        // Create Razorpay order via REST API
        const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")
        const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: "INR",
                receipt: `phonics_${user.id}_${Date.now()}`,
                notes: {
                    user_id: String(user.id),
                    plan_id: planId,
                    user_email: user.email,
                },
            }),
        })

        if (!orderResponse.ok) {
            const errorData = await orderResponse.text()
            console.error("Razorpay order creation failed:", errorData)
            return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
        }

        const order = await orderResponse.json()

        // Save order to DB
        await sql`
      INSERT INTO payments (user_id, razorpay_order_id, plan, amount, currency, status)
      VALUES (${user.id}, ${order.id}, ${planId}, ${plan.price}, 'INR', 'created')
    `

        return NextResponse.json({
            orderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            keyId: RAZORPAY_KEY_ID,
            plan: {
                id: plan.id,
                name: plan.name,
                price: plan.price,
            },
        })
    } catch (error) {
        console.error("Create order error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
