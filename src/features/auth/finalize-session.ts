import { authErrorMessage } from "./auth-errors";

// The slice of a Clerk sign-in/sign-up attempt that finalizing needs.
interface Finalizable {
  finalize: (params?: {
    navigate?: (params: { session: { currentTask?: unknown } }) => void | Promise<unknown>;
  }) => Promise<{ error: unknown }>;
}

const SESSION_TASK_MESSAGE = "Your account needs an extra step that Loom Stay doesn't support yet.";

// Turns a completed sign-in or sign-up into the active session. Navigation is left
// to the route guards: once the session is active they move the guest to /home.
// Returns an error message, or null on success.
export async function finalizeSession(attempt: Finalizable, fallback: string): Promise<string | null> {
  let hasPendingTask = false;
  const { error } = await attempt.finalize({
    navigate: ({ session }) => {
      hasPendingTask = session.currentTask != null;
    },
  });
  if (error) return authErrorMessage(error, fallback);
  return hasPendingTask ? SESSION_TASK_MESSAGE : null;
}
