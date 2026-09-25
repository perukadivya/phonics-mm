import fs from "fs"
import path from "path"
import { DatabaseSync } from "node:sqlite"
import { sql as vercelSql } from "@vercel/postgres"
import type { PlanId } from "./plans"

export interface DbUser {
  id: number
  email: string
  name: string
  password_hash: string
  plan: PlanId
  plan_expires_at: string | null
}

export interface DbProgress {
  letters: number
  threeLetterWords: number
  fourLetterWords: number
  fiveLetterWords: number
  sentences: number
  totalStickers: number
  currentStreak: number
  completedItems: Record<string, number[]>
}

export interface DbUsage {
  worksheetCount: number
  quizCount: number
}
interface UserSqliteRow {
  id: number | bigint
  email: string
  name: string | null
  password_hash: string
  plan: string | null
  plan_expires_at: string | null
}

interface ProgressSqliteRow {
  letters: number | null
  three_letter_words: number | null
  four_letter_words: number | null
  five_letter_words: number | null
  sentences: number | null
  total_stickers: number | null
  current_streak: number | null
  completed_items: string | null
}

interface UsageSqliteRow {
  worksheet_count: number | null
  quiz_count: number | null
}

interface TotalUsageSqliteRow {
  total_worksheets: number | null
  total_quiz: number | null
}

interface PaymentSqliteRow {
  plan: string
  user_id: number | bigint
}


// Check if PostgreSQL is configured via env
const hasPostgres = Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL)

// SQLite singleton instance for local / fallback mode
let sqliteInstance: DatabaseSync | null = null

function getSqlite(): DatabaseSync {
  if (sqliteInstance) return sqliteInstance

  const dataDir = path.join(process.cwd(), ".data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const dbPath = path.join(dataDir, "phonics.db")
  const db = new DatabaseSync(dbPath)

  // Initialize SQLite tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      plan TEXT DEFAULT 'free',
      plan_expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      letters INTEGER DEFAULT 0,
      three_letter_words INTEGER DEFAULT 0,
      four_letter_words INTEGER DEFAULT 0,
      five_letter_words INTEGER DEFAULT 0,
      sentences INTEGER DEFAULT 0,
      total_stickers INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      completed_items TEXT DEFAULT '{}',
      last_active TEXT DEFAULT CURRENT_DATE,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ip_address TEXT NOT NULL DEFAULT '',
      log_date TEXT DEFAULT CURRENT_DATE,
      worksheet_count INTEGER DEFAULT 0,
      quiz_count INTEGER DEFAULT 0,
      UNIQUE(user_id, log_date)
    );

    CREATE TABLE IF NOT EXISTS ip_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT UNIQUE NOT NULL,
      worksheet_count INTEGER DEFAULT 0,
      quiz_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'created',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      verified_at TEXT
    );
  `)

  sqliteInstance = db
  return sqliteInstance
}

// ---------------- User Queries ---------------- //

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const normalized = email.toLowerCase().trim()
  if (hasPostgres) {
    try {
      const res = await vercelSql`
        SELECT id, email, name, password_hash, plan, plan_expires_at 
        FROM users WHERE email = ${normalized}
      `
      if (res.rows.length === 0) return null
      const row = res.rows[0]
      return {
        id: row.id,
        email: row.email,
        name: row.name || "",
        password_hash: row.password_hash,
        plan: (row.plan || "free") as PlanId,
        plan_expires_at: row.plan_expires_at ? new Date(row.plan_expires_at).toISOString() : null,
      }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db
    .prepare("SELECT id, email, name, password_hash, plan, plan_expires_at FROM users WHERE email = ?")
    .get(normalized) as unknown as UserSqliteRow | undefined

  if (!row) return null
  return {
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name || ""),
    password_hash: String(row.password_hash),
    plan: (row.plan || "free") as PlanId,
    plan_expires_at: row.plan_expires_at ? String(row.plan_expires_at) : null,
  }
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string
): Promise<{ id: number; email: string; name: string }> {
  const normalized = email.toLowerCase().trim()
  if (hasPostgres) {
    try {
      const res = await vercelSql`
        INSERT INTO users (email, password_hash, name, plan)
        VALUES (${normalized}, ${passwordHash}, ${name || ""}, 'free')
        RETURNING id, email, name
      `
      const user = res.rows[0]
      await vercelSql`INSERT INTO user_progress (user_id) VALUES (${user.id}) ON CONFLICT DO NOTHING`
      return { id: user.id, email: user.email, name: user.name }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const insert = db.prepare("INSERT INTO users (email, password_hash, name, plan) VALUES (?, ?, ?, 'free')")
  const result = insert.run(normalized, passwordHash, name || "")
  const newId = Number(result.lastInsertRowid)

  db.prepare("INSERT OR IGNORE INTO user_progress (user_id) VALUES (?)").run(newId)

  return { id: newId, email: normalized, name: name || "" }
}

export async function getUserPlan(userId: number): Promise<{ plan: PlanId; expiresAt: string | null }> {
  if (hasPostgres) {
    try {
      const res = await vercelSql`SELECT plan, plan_expires_at FROM users WHERE id = ${userId}`
      if (res.rows.length > 0) {
        const row = res.rows[0]
        return {
          plan: (row.plan || "free") as PlanId,
          expiresAt: row.plan_expires_at ? new Date(row.plan_expires_at).toISOString() : null,
        }
      }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db.prepare("SELECT plan, plan_expires_at FROM users WHERE id = ?").get(userId) as unknown as UserSqliteRow | undefined
  if (!row) return { plan: "free", expiresAt: null }
  return {
    plan: (row.plan || "free") as PlanId,
    expiresAt: row.plan_expires_at ? String(row.plan_expires_at) : null,
  }
}

export async function setUserPlan(userId: number, planId: PlanId, expiresAt: string): Promise<void> {
  if (hasPostgres) {
    try {
      await vercelSql`
        UPDATE users SET plan = ${planId}, plan_expires_at = ${expiresAt} WHERE id = ${userId}
      `
      return
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  db.prepare("UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?").run(planId, expiresAt, userId)
}

// ---------------- Progress Queries ---------------- //

export async function getUserProgress(userId: number): Promise<DbProgress> {
  const defaultProgress: DbProgress = {
    letters: 0,
    threeLetterWords: 0,
    fourLetterWords: 0,
    fiveLetterWords: 0,
    sentences: 0,
    totalStickers: 0,
    currentStreak: 0,
    completedItems: {},
  }

  if (hasPostgres) {
    try {
      const res = await vercelSql`
        SELECT letters, three_letter_words, four_letter_words, five_letter_words,
               sentences, total_stickers, current_streak, completed_items
        FROM user_progress WHERE user_id = ${userId}
      `
      if (res.rows.length === 0) {
        await vercelSql`INSERT INTO user_progress (user_id) VALUES (${userId}) ON CONFLICT DO NOTHING`
        return defaultProgress
      }
      const row = res.rows[0]
      return {
        letters: row.letters || 0,
        threeLetterWords: row.three_letter_words || 0,
        fourLetterWords: row.four_letter_words || 0,
        fiveLetterWords: row.five_letter_words || 0,
        sentences: row.sentences || 0,
        totalStickers: row.total_stickers || 0,
        currentStreak: row.current_streak || 0,
        completedItems: row.completed_items || {},
      }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db
    .prepare(
      `SELECT letters, three_letter_words, four_letter_words, five_letter_words,
              sentences, total_stickers, current_streak, completed_items
       FROM user_progress WHERE user_id = ?`
    )
    .get(userId) as unknown as ProgressSqliteRow | undefined

  if (!row) {
    db.prepare("INSERT OR IGNORE INTO user_progress (user_id) VALUES (?)").run(userId)
    return defaultProgress
  }

  let completedItems = {}
  try {
    completedItems = typeof row.completed_items === "string" ? JSON.parse(row.completed_items) : (row.completed_items || {})
  } catch {
    completedItems = {}
  }

  return {
    letters: Number(row.letters || 0),
    threeLetterWords: Number(row.three_letter_words || 0),
    fourLetterWords: Number(row.four_letter_words || 0),
    fiveLetterWords: Number(row.five_letter_words || 0),
    sentences: Number(row.sentences || 0),
    totalStickers: Number(row.total_stickers || 0),
    currentStreak: Number(row.current_streak || 0),
    completedItems,
  }
}

export async function saveUserProgress(userId: number, p: Partial<DbProgress>): Promise<void> {
  const jsonCompleted = JSON.stringify(p.completedItems || {})

  if (hasPostgres) {
    try {
      await vercelSql`
        INSERT INTO user_progress (
          user_id, letters, three_letter_words, four_letter_words, five_letter_words,
          sentences, total_stickers, current_streak, completed_items, updated_at
        ) VALUES (
          ${userId}, ${p.letters ?? 0}, ${p.threeLetterWords ?? 0}, ${p.fourLetterWords ?? 0},
          ${p.fiveLetterWords ?? 0}, ${p.sentences ?? 0}, ${p.totalStickers ?? 0}, ${p.currentStreak ?? 0},
          ${jsonCompleted}::jsonb, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          letters = COALESCE(${p.letters}, user_progress.letters),
          three_letter_words = COALESCE(${p.threeLetterWords}, user_progress.three_letter_words),
          four_letter_words = COALESCE(${p.fourLetterWords}, user_progress.four_letter_words),
          five_letter_words = COALESCE(${p.fiveLetterWords}, user_progress.five_letter_words),
          sentences = COALESCE(${p.sentences}, user_progress.sentences),
          total_stickers = COALESCE(${p.totalStickers}, user_progress.total_stickers),
          current_streak = COALESCE(${p.currentStreak}, user_progress.current_streak),
          completed_items = COALESCE(${jsonCompleted}::jsonb, user_progress.completed_items),
          updated_at = NOW()
      `
      return
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  db.prepare(`
    INSERT INTO user_progress (
      user_id, letters, three_letter_words, four_letter_words, five_letter_words,
      sentences, total_stickers, current_streak, completed_items, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT (user_id) DO UPDATE SET
      letters = COALESCE(excluded.letters, user_progress.letters),
      three_letter_words = COALESCE(excluded.three_letter_words, user_progress.three_letter_words),
      four_letter_words = COALESCE(excluded.four_letter_words, user_progress.four_letter_words),
      five_letter_words = COALESCE(excluded.five_letter_words, user_progress.five_letter_words),
      sentences = COALESCE(excluded.sentences, user_progress.sentences),
      total_stickers = COALESCE(excluded.total_stickers, user_progress.total_stickers),
      current_streak = COALESCE(excluded.current_streak, user_progress.current_streak),
      completed_items = excluded.completed_items,
      updated_at = datetime('now')
  `).run(
    userId,
    p.letters ?? 0,
    p.threeLetterWords ?? 0,
    p.fourLetterWords ?? 0,
    p.fiveLetterWords ?? 0,
    p.sentences ?? 0,
    p.totalStickers ?? 0,
    p.currentStreak ?? 0,
    jsonCompleted
  )
}

// ---------------- Usage Queries ---------------- //

export async function getDailyUsage(userId: number): Promise<DbUsage> {
  const today = new Date().toISOString().slice(0, 10)
  if (hasPostgres) {
    try {
      const res = await vercelSql`
        SELECT worksheet_count, quiz_count FROM usage_logs
        WHERE user_id = ${userId} AND log_date = CURRENT_DATE
      `
      if (res.rows.length === 0) return { worksheetCount: 0, quizCount: 0 }
      return {
        worksheetCount: res.rows[0].worksheet_count || 0,
        quizCount: res.rows[0].quiz_count || 0,
      }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db
    .prepare("SELECT worksheet_count, quiz_count FROM usage_logs WHERE user_id = ? AND log_date = ?")
    .get(userId, today) as unknown as UsageSqliteRow | undefined
  if (!row) return { worksheetCount: 0, quizCount: 0 }
  return {
    worksheetCount: Number(row.worksheet_count || 0),
    quizCount: Number(row.quiz_count || 0),
  }
}

export async function getTotalUsage(userId: number): Promise<{ totalWorksheets: number; totalQuiz: number }> {
  if (hasPostgres) {
    try {
      const res = await vercelSql`
        SELECT COALESCE(SUM(worksheet_count), 0) as total_worksheets,
               COALESCE(SUM(quiz_count), 0) as total_quiz
        FROM usage_logs WHERE user_id = ${userId}
      `
      return {
        totalWorksheets: Number(res.rows[0].total_worksheets),
        totalQuiz: Number(res.rows[0].total_quiz),
      }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db
    .prepare(`
      SELECT COALESCE(SUM(worksheet_count), 0) as total_worksheets,
             COALESCE(SUM(quiz_count), 0) as total_quiz
      FROM usage_logs WHERE user_id = ?
    `)
    .get(userId) as unknown as TotalUsageSqliteRow | undefined
  return {
    totalWorksheets: Number(row?.total_worksheets || 0),
    totalQuiz: Number(row?.total_quiz || 0),
  }
}

export async function getIPUsage(ip: string): Promise<DbUsage> {
  if (hasPostgres) {
    try {
      const res = await vercelSql`
        SELECT worksheet_count, quiz_count FROM ip_usage_logs WHERE ip_address = ${ip}
      `
      if (res.rows.length === 0) return { worksheetCount: 0, quizCount: 0 }
      return {
        worksheetCount: res.rows[0].worksheet_count || 0,
        quizCount: res.rows[0].quiz_count || 0,
      }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db.prepare("SELECT worksheet_count, quiz_count FROM ip_usage_logs WHERE ip_address = ?").get(ip) as unknown as UsageSqliteRow | undefined
  if (!row) return { worksheetCount: 0, quizCount: 0 }
  return {
    worksheetCount: Number(row.worksheet_count || 0),
    quizCount: Number(row.quiz_count || 0),
  }
}

export async function incrementUsage(userId: number, ip: string, type: "worksheets" | "quiz"): Promise<void> {
  const isWorksheet = type === "worksheets"
  const today = new Date().toISOString().slice(0, 10)

  if (hasPostgres) {
    try {
      if (userId > 0) {
        if (isWorksheet) {
          await vercelSql`
            INSERT INTO usage_logs (user_id, ip_address, log_date, worksheet_count)
            VALUES (${userId}, ${ip}, CURRENT_DATE, 1)
            ON CONFLICT (user_id, log_date) DO UPDATE SET
              worksheet_count = usage_logs.worksheet_count + 1,
              ip_address = ${ip}
          `
        } else {
          await vercelSql`
            INSERT INTO usage_logs (user_id, ip_address, log_date, quiz_count)
            VALUES (${userId}, ${ip}, CURRENT_DATE, 1)
            ON CONFLICT (user_id, log_date) DO UPDATE SET
              quiz_count = usage_logs.quiz_count + 1,
              ip_address = ${ip}
          `
        }
      }
      if (ip) {
        if (isWorksheet) {
          await vercelSql`
            INSERT INTO ip_usage_logs (ip_address, worksheet_count)
            VALUES (${ip}, 1)
            ON CONFLICT (ip_address) DO UPDATE SET
              worksheet_count = ip_usage_logs.worksheet_count + 1
          `
        } else {
          await vercelSql`
            INSERT INTO ip_usage_logs (ip_address, quiz_count)
            VALUES (${ip}, 1)
            ON CONFLICT (ip_address) DO UPDATE SET
              quiz_count = ip_usage_logs.quiz_count + 1
          `
        }
      }
      return
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  if (userId > 0) {
    if (isWorksheet) {
      db.prepare(`
        INSERT INTO usage_logs (user_id, ip_address, log_date, worksheet_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT (user_id, log_date) DO UPDATE SET
          worksheet_count = usage_logs.worksheet_count + 1,
          ip_address = excluded.ip_address
      `).run(userId, ip, today)
    } else {
      db.prepare(`
        INSERT INTO usage_logs (user_id, ip_address, log_date, quiz_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT (user_id, log_date) DO UPDATE SET
          quiz_count = usage_logs.quiz_count + 1,
          ip_address = excluded.ip_address
      `).run(userId, ip, today)
    }
  }

  if (ip) {
    if (isWorksheet) {
      db.prepare(`
        INSERT INTO ip_usage_logs (ip_address, worksheet_count)
        VALUES (?, 1)
        ON CONFLICT (ip_address) DO UPDATE SET
          worksheet_count = ip_usage_logs.worksheet_count + 1
      `).run(ip)
    } else {
      db.prepare(`
        INSERT INTO ip_usage_logs (ip_address, quiz_count)
        VALUES (?, 1)
        ON CONFLICT (ip_address) DO UPDATE SET
          quiz_count = ip_usage_logs.quiz_count + 1
      `).run(ip)
    }
  }
}

// ---------------- Payment Queries ---------------- //

export async function createPaymentRecord(
  userId: number,
  orderId: string,
  planId: string,
  amount: number
): Promise<void> {
  if (hasPostgres) {
    try {
      await vercelSql`
        INSERT INTO payments (user_id, razorpay_order_id, plan, amount, currency, status)
        VALUES (${userId}, ${orderId}, ${planId}, ${amount}, 'INR', 'created')
      `
      return
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  db.prepare(`
    INSERT INTO payments (user_id, razorpay_order_id, plan, amount, currency, status)
    VALUES (?, ?, ?, ?, 'INR', 'created')
  `).run(userId, orderId, planId, amount)
}

export async function findPaymentOrder(orderId: string, userId: number): Promise<{ plan: PlanId } | null> {
  if (hasPostgres) {
    try {
      const res = await vercelSql`
        SELECT plan, user_id FROM payments WHERE razorpay_order_id = ${orderId} AND user_id = ${userId}
      `
      if (res.rows.length === 0) return null
      return { plan: res.rows[0].plan as PlanId }
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  const row = db
    .prepare("SELECT plan, user_id FROM payments WHERE razorpay_order_id = ? AND user_id = ?")
    .get(orderId, userId) as unknown as PaymentSqliteRow | undefined
  if (!row) return null
  return { plan: row.plan as PlanId }
}

export async function completePaymentRecord(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<void> {
  if (hasPostgres) {
    try {
      await vercelSql`
        UPDATE payments SET
          razorpay_payment_id = ${paymentId},
          razorpay_signature = ${signature},
          status = 'paid',
          verified_at = NOW()
        WHERE razorpay_order_id = ${orderId}
      `
      return
    } catch (err) {
      console.warn("Postgres error, falling back to local SQLite:", err)
    }
  }

  const db = getSqlite()
  db.prepare(`
    UPDATE payments SET
      razorpay_payment_id = ?,
      razorpay_signature = ?,
      status = 'paid',
      verified_at = datetime('now')
    WHERE razorpay_order_id = ?
  `).run(paymentId, signature, orderId)
}
