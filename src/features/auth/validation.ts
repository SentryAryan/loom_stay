// Client-side form checks. Each returns an error message, or null when valid.
export const MIN_PASSWORD_LENGTH = 8;
export const CODE_LENGTH = 6;

const MIN_NAME_LENGTH = 2;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  const name = value.trim();
  if (name.length === 0) return "Enter your full name.";
  if (name.length < MIN_NAME_LENGTH) return "Your name needs at least 2 characters.";
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (email.length === 0) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length === 0) return "Enter a password.";
  if (value.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export function isCompleteCode(value: string): boolean {
  return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(value);
}
