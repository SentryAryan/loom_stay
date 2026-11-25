import { useCallback, useEffect, useState } from "react";

import { SANITY_QUERY_URL } from "./sanity-config";
import { STAY_PROJECTION, toStays, type SanityStay } from "./sanity-stay";
import type { Stay } from "./stays";

const REQUEST_TIMEOUT_MS = 10_000;

// Constant query, no interpolation of user values.
const QUERY = `*[_type == "property" && defined(slug.current)] | order(rating desc, reviewCount desc) ${STAY_PROJECTION}`;

export type StaysState =
  | { status: "loading"; stays: readonly Stay[] }
  | { status: "error"; stays: readonly Stay[] }
  | { status: "empty"; stays: readonly Stay[] }
  | { status: "ready"; stays: readonly Stay[] };

async function fetchStays(): Promise<readonly Stay[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${SANITY_QUERY_URL}?query=${encodeURIComponent(QUERY)}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
    const body = (await res.json()) as { result?: SanityStay[] };
    return toStays(body.result ?? []);
  } finally {
    clearTimeout(timer);
  }
}

// Module-level cache so switching tabs does not refetch; retry clears it.
let cached: readonly Stay[] | null = null;

export function useStays(): StaysState & { retry: () => void } {
  const [state, setState] = useState<StaysState>(() =>
    cached ? { status: cached.length ? "ready" : "empty", stays: cached } : { status: "loading", stays: [] },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cached) return;
    let active = true;
    fetchStays()
      .then((stays) => {
        cached = stays;
        if (active) setState({ status: stays.length ? "ready" : "empty", stays });
      })
      .catch(() => {
        if (active) setState({ status: "error", stays: [] });
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    cached = null;
    setState({ status: "loading", stays: [] });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
