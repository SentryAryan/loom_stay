import type { TokenCache } from "@clerk/expo";
import { tokenCache as keychainTokenCache } from "@clerk/expo/token-cache";
import { AppState } from "react-native";

// Clerk's keychain token cache, with a fallback for when the keychain can't be used.
//
// If a keychain read fails, Clerk's load never finishes and the app stays on the splash.
// On a real iPhone this almost never happens; in an unsigned simulator build (native-sim
// builds with CODE_SIGNING_ALLOWED=NO) every keychain call fails. When that happens while
// the app is open, this switches to memory for the rest of the run: the guest starts
// signed out, and a new sign-in lasts until the app is closed.
//
// A failed read while the app is not active (a background launch before the first unlock)
// is passed through unchanged, so Clerk waits for the app to become active instead of
// treating a briefly unreadable session as signed out.
function createTokenCache(keychain: TokenCache): TokenCache {
  const memory = new Map<string, string>();
  let isKeychainUnusable = false;

  function switchToMemory(error: unknown) {
    if (!isKeychainUnusable && __DEV__) {
      console.warn("Keychain unavailable; keeping the Clerk session in memory for this run.", error);
    }
    isKeychainUnusable = true;
  }

  return {
    getToken: async (key) => {
      if (!isKeychainUnusable) {
        try {
          return await keychain.getToken(key);
        } catch (error) {
          if (AppState.currentState !== "active") throw error;
          switchToMemory(error);
        }
      }
      return memory.get(key) ?? null;
    },
    saveToken: async (key, token) => {
      memory.set(key, token);
      if (isKeychainUnusable) return;
      try {
        await keychain.saveToken(key, token);
      } catch (error) {
        switchToMemory(error);
      }
    },
    clearToken: async (key) => {
      memory.delete(key);
      if (isKeychainUnusable) return;
      try {
        await keychain.clearToken?.(key);
      } catch (error) {
        switchToMemory(error);
      }
    },
  };
}

// Undefined on web, like Clerk's own token cache.
export const tokenCache = keychainTokenCache ? createTokenCache(keychainTokenCache) : undefined;
