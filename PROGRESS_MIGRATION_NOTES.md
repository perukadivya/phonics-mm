# Progress System Migration to Supabase API

This document outlines the general pattern for migrating individual learning stage pages (e.g., `app/letters/page.tsx`, `app/three-letter-words/page.tsx`) to use the new Supabase-backed progress system for authenticated users, while retaining localStorage for unauthenticated users.

The core of this system relies on:
1.  An API route `/api/progress` for fetching (GET) and saving (POST) user progress.
2.  Client-side logic using `useSession` from `next-auth/react` to determine authentication status.
3.  Mapping between frontend camelCase progress keys (e.g., `threeLetterWords`) and backend/API snake_case keys (e.g., `three_letter_words_progress`).

## General Pattern for Learning Stage Pages

Each learning stage page (e.g., `app/letters/page.tsx`) should be updated as follows:

### 1. State Management and Session Hook

*   Import `useSession` from `next-auth/react`.
    ```tsx
    import { useSession } from "next-auth/react";
    ```
*   Initialize the session hook within your component:
    ```tsx
    const { data: session, status: sessionStatus } = useSession();
    ```
*   Maintain a local state for the specific progress relevant to that page (e.g., completed letters, words). This might be part of a larger progress object loaded initially.
    ```tsx
    // Example for app/letters/page.tsx
    const [completedLetters, setCompletedLetters] = useState<string[]>([]);
    // Or, if using the main progress object:
    // const [userProgress, setUserProgress] = useState<UserProgressType>(initialProgressState);
    ```

### 2. Fetching Initial Progress

*   Use a `useEffect` hook that depends on `sessionStatus`.
*   When `sessionStatus` is `"authenticated"`:
    *   Make a GET request to `/api/progress`.
    *   On success, parse the response. Remember the API returns snake_case keys. Map these to your component's camelCase state variables.
    *   Example:
        ```tsx
        useEffect(() => {
          const loadPageProgress = async () => {
            if (sessionStatus === "authenticated") {
              try {
                const response = await fetch('/api/progress');
                if (!response.ok) throw new Error('Failed to fetch progress');
                const dbProgress = await response.json(); // snake_case
                
                // Assuming 'userProgress' state uses camelCase
                // setUserProgress({
                //   letters: dbProgress.letters_progress,
                //   threeLetterWords: dbProgress.three_letter_words_progress,
                //   // ... other fields
                // });

                // Or for specific state like completedLetters for /letters page
                // This would require dbProgress.letters_progress to be structured
                // in a way that can inform 'completedLetters' (e.g., an array or count)
                // For instance, if letters_progress is a count:
                // setSomeLocalLettersProgressCount(dbProgress.letters_progress);

              } catch (error) {
                console.error("Failed to load progress from API:", error);
                // Potentially load from localStorage as a fallback or set defaults
              }
            } else if (sessionStatus === "unauthenticated") {
              // Load from localStorage
              // const localProgress = JSON.parse(localStorage.getItem("phonics-progress") || "{}");
              // setUserProgress({
              //    letters: localProgress.letters || 0,
              //    // ...
              // });
            }
          };

          if (sessionStatus !== "loading") {
            loadPageProgress();
          }
        }, [sessionStatus]);
        ```

### 3. Saving Progress Updates

*   When a user completes an action that affects their progress (e.g., finishes a letter, completes a word list):
    1.  Update the local component state immediately for UI responsiveness.
    2.  If `sessionStatus` is `"authenticated"`:
        *   Fetch the latest full progress object from `/api/progress` (GET). This is crucial to avoid overwriting concurrent updates from other parts of the app or other devices.
        *   Modify the fetched progress object with the new changes from this page (e.g., increment `letters_progress`).
        *   Make a POST request to `/api/progress` with the *entire updated progress object*. Ensure the payload sent to the API uses snake_case keys.
        *   Example of updating and POSTing:
            ```tsx
            // Assume 'newLetterCompleted' is the action
            // Update local state first for responsiveness

            if (sessionStatus === "authenticated") {
              try {
                // 1. Get current full progress from server
                const currentProgressResponse = await fetch('/api/progress');
                if (!currentProgressResponse.ok) throw new Error('Failed to get current progress');
                const currentDbProgress = await currentProgressResponse.json(); // snake_case

                // 2. Prepare updated payload (snake_case)
                const updatedPayload = {
                  ...currentDbProgress,
                  letters_progress: (currentDbProgress.letters_progress || 0) + 1, // Example update
                  // Potentially update last_played_date and current_streak if applicable
                };
                
                // 3. POST updated full progress object
                const postResponse = await fetch('/api/progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedPayload),
                });

                if (!postResponse.ok) throw new Error('Failed to save progress');
                console.log("Progress saved to server.");

              } catch (error) {
                console.error("Error saving progress to API:", error);
                // Handle error: notify user, maybe offer retry, or queue update.
                // Optionally, could save to localStorage as a temporary backup.
              }
            }
            ```
    3.  If `sessionStatus` is `"unauthenticated"`:
        *   Update `localStorage` as previously implemented.
        *   Example:
            ```tsx
            // const localProgress = JSON.parse(localStorage.getItem("phonics-progress") || "{}");
            // localProgress.letters = (localProgress.letters || 0) + 1; // Example for camelCase localStorage
            // localStorage.setItem("phonics-progress", JSON.stringify(localProgress));
            ```

### 4. Key Considerations

*   **Data Mapping (snake_case vs. camelCase):** Be meticulous. The API consumes and produces snake_case. The frontend components typically use camelCase for state variables and props.
*   **Initial Default State:** Ensure a consistent default progress object is defined (as in `/api/progress/route.ts`) and used if no progress is found either in the DB or localStorage.
*   **Error Handling:** Implement robust error handling for API calls (network errors, server errors). Provide feedback or fallback mechanisms.
*   **Consistency:** Fetching the full progress object before POSTing an update helps maintain data consistency, especially if progress can be updated from multiple places or devices.
*   **localStorage Key:** Use a consistent key for localStorage (e.g., `"phonics-progress"`).
*   **Progress Object Structure:** The `user_progress` table fields (and thus the API payload) should align with the data needs of all learning stages (e.g., `letters_progress`, `three_letter_words_progress`, etc.).

By following this pattern, each learning stage can be systematically migrated to the new authenticated progress system while maintaining functionality for unauthenticated users.

## Future Enhancement: New User Challenge First Completion Logic

The application includes a "New User Challenge" accessible via `/quiz?challenge=true`. This is a 5-question quiz fixed at the "letters" level, intended as an introductory experience.

To enhance this, a "first completion" logic could be implemented:

1.  **Database Schema Update:**
    *   Add a new boolean column to the `user_progress` table, for example: `new_user_challenge_completed BOOLEAN DEFAULT FALSE`.

2.  **API Update (`/api/progress/route.ts` POST handler):**
    *   When a user completes the "New User Challenge" (i.e., when `calculateScore` is called in `app/quiz/page.tsx` while `challengeMode` is true), the client could send an additional flag or the API could infer from the context (e.g., if `level` was "letters" and `count` was 5, and perhaps a specific referrer).
    *   Alternatively, and more robustly, the client-side `calculateScore` function in `app/quiz/page.tsx`, when in challenge mode, should explicitly include `new_user_challenge_completed: true` in the payload sent to the `POST /api/progress` endpoint.
    *   The `POST` handler in `/api/progress/route.ts` would then update this field in the database.

3.  **Homepage Logic Update (`app/page.tsx`):**
    *   The `UserProgress` interface and the state in `app/page.tsx` would need to include `newUserChallengeCompleted`.
    *   The "AI Quiz Challenge" card's `href` and potentially its `title` or `description` could change based on this flag:
        *   If `progress.newUserChallengeCompleted` is `false`, the card links to `/quiz?challenge=true`.
        *   If `progress.newUserChallengeCompleted` is `true`, the card could link to the regular quiz page `/quiz` (allowing level selection and default 10 questions). The card title might change to "Practice Quiz" or "Advanced Quiz".
    *   The `unlocked` condition for the card might also be updated or removed after first completion.

4.  **Quiz Page (`app/quiz/page.tsx`):**
    *   No major changes needed here other than ensuring the `calculateScore` function correctly signals to the API that the *challenge* was completed (if this isn't handled by a separate API endpoint or a specific payload structure).

This enhancement would provide a clearer progression path for the user, transitioning them from the introductory challenge to the standard quiz mode.
