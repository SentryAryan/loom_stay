// MOCK auth. This is the single swap point for Clerk: replace the body of each
// method (keep the signatures) and the screens keep working. Nothing here talks
// to a server or stores anything.
const LATENCY_MS = 600;
const MOCK_CODE = "123456";

export type SocialProvider = "google" | "apple";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export class AuthError extends Error {}

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

export const authService = {
  async signUp(_input: SignUpInput): Promise<void> {
    await wait();
  },

  async verifyCode(code: string): Promise<void> {
    await wait();
    if (code !== MOCK_CODE) throw new AuthError("That code doesn't match. Try again.");
  },

  async resendCode(_email: string): Promise<void> {
    await wait();
  },

  async signIn(_input: SignInInput): Promise<void> {
    await wait();
  },

  async signInWithProvider(_provider: SocialProvider): Promise<void> {
    await wait();
  },
};
