// Turns Clerk errors into the copy guests see. Clerk's own messages are written
// for developers, so known codes get ours and everything else falls back.
interface ErrorLike {
  code?: unknown;
  errors?: { code?: unknown }[];
}

const MESSAGES: Record<string, string> = {
  form_password_incorrect: "That email and password don't match. Try again.",
  form_identifier_not_found: "That email and password don't match. Try again.",
  form_identifier_exists: "An account with this email already exists. Try signing in.",
  form_code_incorrect: "That code doesn't match. Try again.",
  verification_failed: "Too many wrong codes. Tap Resend code to get a new one.",
  verification_expired: "That code has expired. Request a new one.",
  form_password_pwned: "That password has appeared in a data breach. Choose a different one.",
  form_password_length_too_short: "Your password is too short. Use a longer one.",
  form_password_size_in_bytes_exceeded: "Your password is too long. Use a shorter one.",
  form_param_format_invalid: "Check your details and try again.",
  too_many_requests: "Too many attempts. Wait a moment and try again.",
  network_error: "We couldn't reach Loom Stay. Check your connection and try again.",
};

// API failures wrap the real code in `errors[0]` and use a generic top-level code,
// so the nested one wins.
function readCode(error: ErrorLike): string | null {
  const nested = error.errors?.[0]?.code;
  if (typeof nested === "string") return nested;
  return typeof error.code === "string" ? error.code : null;
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;
  const code = readCode(error as ErrorLike);
  return (code && MESSAGES[code]) || fallback;
}
