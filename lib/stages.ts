// Define UserProgress interface, mirroring what's used elsewhere (e.g., main-nav.tsx, app/page.tsx)
// This helps in defining unlock conditions clearly.
export interface UserProgress {
  letters: number; // e.g., count of letters learned or a percentage
  threeLetterWords: number;
  fourLetterWords: number;
  fiveLetterWords: number;
  sentences: number;
  // newUserChallengeCompleted?: boolean; // For future use
  // other progress fields like totalStickers, currentStreak can be here if relevant for unlocking
}

export interface LearningStage {
  id: string;
  title: string;
  href: string;
  description?: string; // Optional, but good for consistency with app/page.tsx
  icon?: string;      // Optional
  total?: number;     // Optional, total items for this stage
  isUnlocked: (progress: UserProgress, isAuthenticated: boolean) => boolean;
}

// Placeholder default progress for isUnlocked checks if progress is null/undefined
export const defaultUserProgress: UserProgress = {
  letters: 0,
  threeLetterWords: 0,
  fourLetterWords: 0,
  fiveLetterWords: 0,
  sentences: 0,
};

export const ALL_LEARNING_STAGES: LearningStage[] = [
  {
    id: "letters",
    title: "Letter Sounds",
    href: "/letters",
    description: "Learn the sounds of each letter!",
    icon: "🔤",
    total: 26, // Example total
    isUnlocked: (progress, isAuthenticated) => isAuthenticated, // Always unlocked for authenticated users
  },
  {
    id: "three-letter",
    title: "3-Letter Words",
    href: "/three-letter-words",
    description: "Build your first words!",
    icon: "📝",
    total: 20, // Example total
    isUnlocked: (progress, isAuthenticated) => isAuthenticated && progress.letters >= 13, // Example: half of letters
  },
  {
    id: "four-letter",
    title: "4-Letter Words",
    href: "/four-letter-words",
    description: "Longer words, more fun!",
    icon: "📚",
    total: 15, // Example total
    isUnlocked: (progress, isAuthenticated) => isAuthenticated && progress.threeLetterWords >= 10, // Example: half of 3-letter words
  },
  {
    id: "five-letter",
    title: "5-Letter Words",
    href: "/five-letter-words",
    description: "You're getting really good!",
    icon: "🌟",
    total: 12, // Example total
    isUnlocked: (progress, isAuthenticated) => isAuthenticated && progress.fourLetterWords >= 8, // Example: half of 4-letter words
  },
  {
    id: "sentences",
    title: "Simple Sentences",
    href: "/sentences",
    description: "Put words together!",
    icon: "💬",
    total: 10, // Example total
    isUnlocked: (progress, isAuthenticated) => isAuthenticated && progress.fiveLetterWords >= 6, // Example: half of 5-letter words
  },
  // Quiz stages are handled separately by main-nav.tsx for sidebar navigation.
  // For "Next/Prev Task" buttons, we might want to navigate from sentences to a general quiz page,
  // or consider the quiz as a separate track.
  // For now, let's end the sequential learning path at "sentences".
  // A "Next Task" from sentences could go to the main quiz page.
  {
    id: "quiz_practice", // A distinct ID for the practice quiz if we want to navigate to it
    title: "Practice Quiz",
    href: "/quiz", // Regular quiz page
    description: "Test all your phonics skills!",
    icon: "🧠",
    isUnlocked: (progress, isAuthenticated) => isAuthenticated && progress.sentences >= 5, // Example: After some sentence progress
  }
];

// Helper function to get a specific stage by ID
export const getStageById = (id: string): LearningStage | undefined => {
  return ALL_LEARNING_STAGES.find(stage => stage.id === id);
};

// Helper function to get the next sequential stage that is unlocked
export const getNextStage = (currentStageId: string, progress: UserProgress, isAuthenticated: boolean): LearningStage | undefined => {
  const currentIndex = ALL_LEARNING_STAGES.findIndex(stage => stage.id === currentStageId);
  if (currentIndex === -1 || currentIndex === ALL_LEARNING_STAGES.length - 1) {
    return undefined; // No next stage or current stage not found
  }
  // Iterate from the next stage to find the first one that's unlocked
  for (let i = currentIndex + 1; i < ALL_LEARNING_STAGES.length; i++) {
    const nextStageCandidate = ALL_LEARNING_STAGES[i];
    if (nextStageCandidate.isUnlocked(progress, isAuthenticated)) {
      return nextStageCandidate;
    }
  }
  return undefined; // No subsequent unlocked stage
};

// Helper function to get the previous sequential stage (which should always be unlocked if current is accessible)
export const getPreviousStage = (currentStageId: string, progress: UserProgress, isAuthenticated: boolean): LearningStage | undefined => {
  const currentIndex = ALL_LEARNING_STAGES.findIndex(stage => stage.id === currentStageId);
  if (currentIndex <= 0) {
    return undefined; // No previous stage
  }
  // The immediately previous stage in the defined sequence.
  // We assume if the user is on currentStageId, the previous ones were completed/unlocked.
  const previousStageCandidate = ALL_LEARNING_STAGES[currentIndex - 1];
  // Double check if it's actually unlocked (should be, but good for robustness)
  if (previousStageCandidate && previousStageCandidate.isUnlocked(progress, isAuthenticated)) {
      return previousStageCandidate;
  }
  return undefined; // Should ideally not happen if sequence is linear and unlock conditions are met for current stage
};

// Note: The `isUnlocked` functions use example thresholds (e.g., progress.letters >= 13).
// These should match the actual unlock logic used in `app/page.tsx` for displaying stages
// and in `components/layout/main-nav.tsx` for sidebar link enabling.
// The progress values (e.g., 13, 10, 8, 6) are based on the `total`s defined in `app/page.tsx`'s `stages` array.
// I've used half of those totals as example unlock thresholds.
// Ensure these are consistent with the actual progress values stored and what they represent.
// For instance, if `progress.letters` is a percentage (0-100), then `progress.letters >= 50` might be used.
// The current `UserProgress` interface implies counts, so `progress.letters >= 13` (out of 26) is 50%.
