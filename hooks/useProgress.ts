"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface UserProgress {
    letters: number
    threeLetterWords: number
    fourLetterWords: number
    fiveLetterWords: number
    sentences: number
    totalStickers: number
    currentStreak: number
    completedItems: Record<string, number[]>
}

const defaultProgress: UserProgress = {
    letters: 0,
    threeLetterWords: 0,
    fourLetterWords: 0,
    fiveLetterWords: 0,
    sentences: 0,
    totalStickers: 0,
    currentStreak: 0,
    completedItems: {},
}

export function useProgress() {
    const [progress, setProgress] = useState<UserProgress>(defaultProgress)
    const [loading, setLoading] = useState(true)
    const saveTimeout = useRef<NodeJS.Timeout | null>(null)

    // Load progress from API
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/progress")
                if (res.ok) {
                    const data = await res.json()
                    setProgress(data.progress)
                }
            } catch (err) {
                console.error("Failed to load progress:", err)
                // Fall back to localStorage
                const saved = localStorage.getItem("phonics-progress")
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved)
                        setProgress({ ...defaultProgress, ...parsed })
                    } catch { /* ignore */ }
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Debounced save to API
    const saveToApi = useCallback((newProgress: UserProgress) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(async () => {
            try {
                await fetch("/api/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newProgress),
                })
            } catch (err) {
                console.error("Failed to save progress:", err)
            }
        }, 500) // debounce 500ms
    }, [])

    const updateProgress = useCallback(
        (updates: Partial<UserProgress>) => {
            setProgress((prev) => {
                const merged = { ...prev, ...updates }
                // Also save to localStorage as backup
                localStorage.setItem("phonics-progress", JSON.stringify(merged))
                // Save to API (debounced)
                saveToApi(merged)
                return merged
            })
        },
        [saveToApi]
    )

    // Helper: mark an item as complete in a section
    const markItemComplete = useCallback(
        (section: string, itemIndex: number) => {
            setProgress((prev) => {
                const completed = prev.completedItems[section] || []
                if (completed.includes(itemIndex)) return prev

                const newCompleted = [...completed, itemIndex]
                const newCompletedItems = { ...prev.completedItems, [section]: newCompleted }

                // Map section names to progress keys
                const sectionProgressMap: Record<string, keyof UserProgress> = {
                    letters: "letters",
                    "three-letter-words": "threeLetterWords",
                    "four-letter-words": "fourLetterWords",
                    "five-letter-words": "fiveLetterWords",
                    sentences: "sentences",
                }

                const progressKey = sectionProgressMap[section]
                const merged = {
                    ...prev,
                    completedItems: newCompletedItems,
                    totalStickers: prev.totalStickers + 1,
                    ...(progressKey ? { [progressKey]: newCompleted.length } : {}),
                }

                localStorage.setItem("phonics-progress", JSON.stringify(merged))
                saveToApi(merged)
                return merged
            })
        },
        [saveToApi]
    )

    // Helper: get completed items for a section
    const getCompletedItems = useCallback(
        (section: string): Set<number> => {
            return new Set(progress.completedItems[section] || [])
        },
        [progress.completedItems]
    )

    return {
        progress,
        loading,
        updateProgress,
        markItemComplete,
        getCompletedItems,
    }
}
