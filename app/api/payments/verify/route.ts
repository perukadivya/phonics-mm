import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import crypto from "crypto"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

export async function POST(request: Request) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: "Please log in first" }, { status: 401 })
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            console.error("Razorpay signature mismatch")
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
        }

        //  Look up the order to find the plan
        const orderResult = await sql`
      SELECT plan, user_id FROM payments WHERE razorpay_order_id = ${razorpay_order_id} AND user_id = ${user.id}
    `

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const planId = orderResult.rows[0].plan

        // Update payment record
        await sql`
      UPDATE payments SET
        razorpay_payment_id = ${razorpay_payment_id},
        razorpay_signature = ${razorpay_signature},
        status = 'paid',
        verified_at = NOW()
      WHERE razorpay_order_id = ${razorpay_order_id}
    `

        // Activate plan — 30 days from now
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        await sql`
      UPDATE users SET
        plan = ${planId},
        plan_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `

        return NextResponse.json({
            success: true,
            plan: planId,
            expiresAt: expiresAt.toISOString(),
            message: "Payment successful! Your plan is now active. 🎉",
        })
    } catch (error) {
        console.error("Verify payment error:", error)
        return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
    }
}
