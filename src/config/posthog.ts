import Constants from "expo-constants";
import { Platform } from "react-native";
import PostHog from "posthog-react-native";

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;

if (!projectToken && __DEV__) {
  console.error(
    new Error(
      "POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_PROJECT_TOKEN is configured",
    ),
  );
}

if (!host && __DEV__) {
  console.error(
    new Error(
      "POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_HOST is configured",
    ),
  );
}

// Web has no native storage module, so PostHog falls back to localStorage there (the static
// render runs in Node, where there is no window). PostHog stores strings, arrays and objects and
// calls removeItem on reset, so values are kept as JSON.
const hasLocalStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const webStorage =
  Platform.OS === "web"
    ? {
        getItem: (key: string) => {
          const raw = hasLocalStorage ? window.localStorage.getItem(key) : null;
          if (raw === null) return null;
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        },
        setItem: (key: string, value: unknown) => {
          if (hasLocalStorage) window.localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key: string) => {
          if (hasLocalStorage) window.localStorage.removeItem(key);
        },
      }
    : undefined;

const client =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        customStorage: webStorage,
        captureAppLifecycleEvents: true,
        logs: {
          serviceName: "loom-stay",
          serviceVersion: Constants.expoConfig?.version,
          environment: __DEV__ ? "development" : "production",
        },
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
          },
        },
      })
    : undefined;

if (client && __DEV__) {
  client.debug(true);
}

export const posthog = client;
