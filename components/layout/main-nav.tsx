"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
// Removed Unlock as it's not used, only Lock is.
import { Home, BookText, PenTool, SpellCheck, MessageSquare, Brain, Lock, Puzzle } from "lucide-react"; 

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  requiresAuth: boolean;
  isUnlocked?: (progress: UserProgress) => boolean;
  isChallenge?: boolean; // To differentiate the new user challenge
}

// Mirrored from app/page.tsx for progress state
interface UserProgress {
  letters: number;
  threeLetterWords: number;
  fourLetterWords: number;
  fiveLetterWords: number;
  sentences: number;
  totalStickers: number;
  currentStreak: number;
  // newUserChallengeCompleted?: boolean; // For future use, as per PROGRESS_MIGRATION_NOTES.md
}

// Default progress state
const defaultUserProgress: UserProgress = {
  letters: 0,
  threeLetterWords: 0,
  fourLetterWords: 0,
  fiveLetterWords: 0,
  sentences: 0,
  totalStickers: 0,
  currentStreak: 0,
};

const navItemsList: NavItem[] = [
  { path: "/", label: "Home", icon: Home, requiresAuth: false },
  {
    path: "/letters",
    label: "Letter Sounds",
    icon: BookText,
    requiresAuth: true,
    isUnlocked: () => true, // Removed unused 'progress' parameter
  },
  {
    path: "/three-letter-words",
    label: "3-Letter Words",
    icon: PenTool,
    requiresAuth: true,
    isUnlocked: (progress) => progress.letters >= 13,
  },
  {
    path: "/four-letter-words",
    label: "4-Letter Words",
    icon: SpellCheck,
    requiresAuth: true,
    isUnlocked: (progress) => progress.threeLetterWords >= 10,
  },
  {
    path: "/five-letter-words",
    label: "5-Letter Words",
    icon: Puzzle, // Using Puzzle as an example, consider changing
    requiresAuth: true,
    isUnlocked: (progress) => progress.fourLetterWords >= 8,
  },
  {
    path: "/sentences",
    label: "Simple Sentences",
    icon: MessageSquare,
    requiresAuth: true,
    isUnlocked: (progress) => progress.fiveLetterWords >= 6,
  },
  {
    path: "/quiz?challenge=true", // Link to the new user challenge
    label: "New User Challenge",
    icon: Brain,
    requiresAuth: true,
    isUnlocked: (progress) => progress.letters >= 5, // Same unlock as regular quiz for now
    isChallenge: true,
  },
  {
    path: "/quiz", // Regular Quiz
    label: "Practice Quiz",
    icon: Brain, // Can use a different icon if desired
    requiresAuth: true,
    isUnlocked: (progress) => progress.letters >= 5, // Example: unlock after some progress
                                                // Or after new_user_challenge_completed = true (future)
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { status: sessionStatus } = useSession(); // Removed 'data: session'
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultUserProgress);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setIsLoadingProgress(true);
      fetch("/api/progress")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch progress");
          return res.json();
        })
        .then((data) => {
          setUserProgress({
            letters: data.letters_progress ?? 0,
            threeLetterWords: data.three_letter_words_progress ?? 0,
            fourLetterWords: data.four_letter_words_progress ?? 0,
            fiveLetterWords: data.five_letter_words_progress ?? 0,
            sentences: data.sentences_progress ?? 0,
            totalStickers: data.total_stickers ?? 0,
            currentStreak: data.current_streak ?? 0,
            // newUserChallengeCompleted: data.new_user_challenge_completed ?? false,
          });
        })
        .catch((error) => {
          console.error("Error fetching user progress for sidebar:", error);
          setUserProgress(defaultUserProgress); // Fallback to default on error
        })
        .finally(() => setIsLoadingProgress(false));
    } else if (sessionStatus === "unauthenticated") {
      // For unauthenticated users, use default progress (all locked except public pages)
      // Or load from localStorage if sidebar should reflect that for guests
      setUserProgress(defaultUserProgress);
      setIsLoadingProgress(false);
    }
    // If "loading", wait for session status to resolve
  }, [sessionStatus]);

  const isAuthenticated = sessionStatus === "authenticated";

  // In a loading state for session or progress, show minimal or skeleton UI
  if (sessionStatus === "loading" || (isAuthenticated && isLoadingProgress)) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="text-muted-foreground">Loading...</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {navItemsList.map((item) => {
        const isActive = pathname === item.path;
        let isItemUnlocked = true; // Default to unlocked for non-auth or non-progress items

        if (item.requiresAuth) {
          if (!isAuthenticated) {
            isItemUnlocked = false; // Lock if auth is required but user is not authenticated
          } else {
            // User is authenticated, check progress-based unlock
            isItemUnlocked = item.isUnlocked ? item.isUnlocked(userProgress) : true;
          }
        }
        
        // Special handling for challenge vs practice quiz based on future 'newUserChallengeCompleted' flag
        // For now, this subtask asks for a simpler approach: one link to /quiz or /quiz?challenge=true
        // The current navItemsList has both, which is fine. We can refine later.
        // Example: if (item.path === "/quiz" && userProgress.newUserChallengeCompleted === false) return null; // Hide practice if challenge not done
        // Example: if (item.isChallenge && userProgress.newUserChallengeCompleted === true) return null; // Hide challenge if done

        return (
          <SidebarMenuItem key={item.path} isActive={isActive}>
            {isItemUnlocked ? (
              <Link href={item.path} legacyBehavior passHref>
                <SidebarMenuButton>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            ) : (
              <SidebarMenuButton disabled className="text-muted-foreground cursor-not-allowed">
                <Lock className="h-5 w-5 mr-2" /> 
                {item.label}
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
export default MainNav;
