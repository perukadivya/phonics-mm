"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, BookOpen, Sparkles, Brain } from "lucide-react"
import Link from "next/link"

interface UserProgress {
  letters: number
  threeLetterWords: number
  fourLetterWords: number
  fiveLetterWords: number
  sentences: number
  totalStickers: number
  currentStreak: number
}

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress>({
    letters: 0,
    threeLetterWords: 0,
    fourLetterWords: 0,
    fiveLetterWords: 0,
    sentences: 0,
    totalStickers: 0,
    currentStreak: 0,
  })

  const { data: session, status } = useSession()

  useEffect(() => {
    const loadProgress = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch('/api/progress');
          if (!response.ok) {
            throw new Error(`Failed to fetch progress: ${response.status}`);
          }
          const dbProgress = await response.json();
          setProgress({
            letters: dbProgress.letters_progress ?? 0,
            threeLetterWords: dbProgress.three_letter_words_progress ?? 0,
            fourLetterWords: dbProgress.four_letter_words_progress ?? 0,
            fiveLetterWords: dbProgress.five_letter_words_progress ?? 0,
            sentences: dbProgress.sentences_progress ?? 0,
            totalStickers: dbProgress.total_stickers ?? 0,
            currentStreak: dbProgress.current_streak ?? 0,
          });
        } catch (error) {
          console.error("Error fetching progress from API:", error);
          // Fallback or set default progress if API fetch fails
          const localSavedProgress = localStorage.getItem("phonics-progress");
          if (localSavedProgress) {
            console.log("Falling back to localStorage progress for authenticated user due to API error.");
            setProgress(JSON.parse(localSavedProgress));
          } else {
            // Set to default if no local storage either
            setProgress({ letters: 0, threeLetterWords: 0, fourLetterWords: 0, fiveLetterWords: 0, sentences: 0, totalStickers: 0, currentStreak: 0 });
          }
        }
      } else if (status === "unauthenticated") {
        const localSavedProgress = localStorage.getItem("phonics-progress");
        if (localSavedProgress) {
          setProgress(JSON.parse(localSavedProgress));
        } else {
            setProgress({ letters: 0, threeLetterWords: 0, fourLetterWords: 0, fiveLetterWords: 0, sentences: 0, totalStickers: 0, currentStreak: 0 });
        }
      }
      // If status is "loading", wait for session to resolve.
    };

    if (status !== "loading") {
      loadProgress();
    }
  }, [status]);

  const stages = [
    {
      id: "letters",
      title: "Letter Sounds",
      description: "Learn the sounds of each letter!",
      icon: "🔤",
      progress: progress.letters,
      total: 26,
      href: "/letters",
      unlocked: true,
    },
    {
      id: "three-letter",
      title: "3-Letter Words",
      description: "Build your first words!",
      icon: "📝",
      progress: progress.threeLetterWords,
      total: 20,
      href: "/three-letter-words",
      unlocked: progress.letters >= 13,
    },
    {
      id: "four-letter",
      title: "4-Letter Words",
      description: "Longer words, more fun!",
      icon: "📚",
      progress: progress.fourLetterWords,
      total: 15,
      href: "/four-letter-words",
      unlocked: progress.threeLetterWords >= 10,
    },
    {
      id: "five-letter",
      title: "5-Letter Words",
      description: "You're getting really good!",
      icon: "🌟",
      progress: progress.fiveLetterWords,
      total: 12,
      href: "/five-letter-words",
      unlocked: progress.fourLetterWords >= 8,
    },
    {
      id: "sentences",
      title: "Simple Sentences",
      description: "Put words together!",
      icon: "💬",
      progress: progress.sentences,
      total: 10,
      href: "/sentences",
      unlocked: progress.fiveLetterWords >= 6,
    },
    {
      id: "quiz",
      title: "AI Quiz Challenge",
      description: "Test your phonics skills!",
      icon: "🧠",
      progress: 0, // Progress for this card might be handled differently if it's a one-time challenge
      total: 1,   // or represents completion of the challenge itself.
      href: "/quiz?challenge=true", // Link to the new user challenge mode
      unlocked: progress.letters >= 5, // Keep existing unlock logic or adjust as needed
    },
  ]

  const totalProgress = stages.slice(0, 5).reduce((acc, stage) => acc + stage.progress, 0)
  const totalPossible = stages.slice(0, 5).reduce((acc, stage) => acc + stage.total, 0)
  const overallProgress = (totalProgress / totalPossible) * 100
  // const { data: session, status } = useSession() // already defined above

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Auth Status and Header */}
        <div className="text-center mb-8">
          <div className="mb-4 p-2 rounded-lg bg-white/20 backdrop-blur-sm inline-block">
            {status === "loading" && <p className="text-white">Loading session...</p>}
            {status === "unauthenticated" && (
              <Button onClick={() => signIn("google")} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md">
                Sign In with Google
              </Button>
            )}
            {status === "authenticated" && session?.user && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xl text-white">
                  Welcome, {session.user.name || session.user.email}!
                  {session.user.image && (
                    <img src={session.user.image} alt="User avatar" className="inline-block w-8 h-8 rounded-full ml-2" />
                  )}
                </p>
                <Button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-md shadow-md">
                  Sign Out
                </Button>
              </div>
            )}
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">🎵 Phonics Fun! 🎵</h1>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{progress.totalStickers} Stickers</span>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold text-gray-700">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-4" />
            </div>
          </div>
        </div>

        {/* Learning Stages */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => (
            <Card
              key={stage.id}
              className={`transform transition-all duration-300 hover:scale-105 ${
                stage.unlocked ? "bg-white/95 shadow-xl cursor-pointer" : "bg-gray-300/50 cursor-not-allowed"
              }`}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-2">{stage.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800">{stage.title}</h3>
                  <p className="text-lg text-gray-600">{stage.description}</p>

                  {stage.unlocked ? (
                    <>
                      {stage.id !== "quiz" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Progress</span>
                            <span>
                              {stage.progress}/{stage.total}
                            </span>
                          </div>
                          <Progress value={(stage.progress / stage.total) * 100} className="h-3" />
                        </div>
                      )}

                      <Link href={stage.href}>
                        <Button
                          size="lg"
                          className={`w-full text-xl py-6 font-bold rounded-2xl shadow-lg ${
                            stage.id === "quiz"
                              ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                              : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                          } text-white`}
                        >
                          {stage.id === "quiz" ? (
                            <Brain className="w-6 h-6 mr-2" />
                          ) : (
                            <BookOpen className="w-6 h-6 mr-2" />
                          )}
                          {stage.id === "quiz" ? "Take Quiz!" : "Let's Learn!"}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-gray-500 font-semibold">🔒 Complete previous stages to unlock!</div>
                      <Button disabled size="lg" className="w-full text-xl py-6">
                        Locked
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Streak */}
        {progress.currentStreak > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl inline-block">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <span className="text-2xl font-bold text-gray-800">{progress.currentStreak} Day Streak!</span>
                <span className="text-3xl">🔥</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Features Notice */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-800">Powered by AI</span>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg text-gray-700">Unlimited examples and personalized quizzes generated just for you!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
