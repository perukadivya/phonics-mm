"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { 
  UserProgress, 
  LearningStage, 
  getNextStage, 
  getPreviousStage,
  defaultUserProgress // Use for default state if progress is null
} from "@/lib/stages";

interface TaskNavButtonsProps {
  currentStageId: string;
  userProgressData: UserProgress | null; // Can be null if not loaded or error
  isAuthenticated: boolean;
  isLoadingProgress: boolean; // To handle loading state
}

export function TaskNavButtons({ 
  currentStageId, 
  userProgressData, 
  isAuthenticated,
  isLoadingProgress
}: TaskNavButtonsProps) {
  // Use actual progress if available, otherwise default (which implies minimal access)
  const progress = userProgressData || defaultUserProgress;

  const previousStage: LearningStage | undefined = getPreviousStage(currentStageId, progress, isAuthenticated);
  const nextStage: LearningStage | undefined = getNextStage(currentStageId, progress, isAuthenticated);

  if (isLoadingProgress) {
    return (
      <div className="flex justify-between mt-8 p-4 border-t border-gray-200">
        <Button variant="outline" disabled>
          <ArrowLeftCircle className="mr-2 h-5 w-5 animate-pulse" />
          Loading...
        </Button>
        <Button variant="outline" disabled>
          Loading...
          <ArrowRightCircle className="ml-2 h-5 w-5 animate-pulse" />
        </Button>
      </div>
    );
  }
  
  // Only render if authenticated, as these stages require auth.
  // Or adjust if some stages are public and have next/prev. For this app, learning stages are auth-gated.
  if (!isAuthenticated) {
      return null; 
  }

  return (
    <div className="flex justify-between mt-8 p-4 border-t border-gray-200 dark:border-gray-700">
      {previousStage ? (
        <Link href={previousStage.href} passHref legacyBehavior>
          <Button variant="outline" className="text-lg py-6 px-6">
            <ArrowLeftCircle className="mr-2 h-5 w-5" />
            Previous: {previousStage.title}
          </Button>
        </Link>
      ) : (
        <Button variant="outline" disabled className="text-lg py-6 px-6 invisible"> {/* Placeholder for spacing */}
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          No Previous Task
        </Button>
      )}

      {nextStage ? (
        <Link href={nextStage.href} passHref legacyBehavior>
          <Button variant="outline" className="text-lg py-6 px-6">
            Next: {nextStage.title}
            <ArrowRightCircle className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" disabled className="text-lg py-6 px-6 invisible"> {/* Placeholder for spacing */}
          No Next Task
          <ArrowRightCircle className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default TaskNavButtons;
