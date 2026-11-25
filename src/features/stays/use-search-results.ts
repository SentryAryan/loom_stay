import { useCallback, useEffect, useMemo, useState } from "react";

import { SANITY_SEARCH_URL } from "./sanity-config";
import { toStays, type SanityStay } from "./sanity-stay";
import { buildSearchRequest, type SearchRequest } from "./search-query";
import type { ParsedQuery } from "./search-stays";
import type { Stay } from "./stays";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_CACHED_SEARCHES = 20;

export interface SearchResultsState {
  status: "loading" | "error" | "empty" | "ready";
  stays: readonly Stay[];
  /** True while a new search runs and the previous results are still on screen. */
  isRefreshing: boolean;
  retry: () => void;
}

async function fetchSearch(request: SearchRequest, signal: AbortSignal): Promise<readonly Stay[]> {
  const res = await fetch(SANITY_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
  const body = (await res.json()) as { result?: SanityStay[] };
  return toStays(body.result ?? []);
}

// Recent searches, so coming back to one is instant. Oldest entry goes first. Cleared by retry.
const cache = new Map<string, readonly Stay[]>();

function remember(key: string, stays: readonly Stay[]): void {
  cache.delete(key);
  cache.set(key, stays);
  if (cache.size > MAX_CACHED_SEARCHES) cache.delete(cache.keys().next().value as string);
}

// What the last finished request left behind. Only set from async callbacks.
interface Settled {
  key: string;
  status: "none" | "ready" | "empty" | "error";
  stays: readonly Stay[];
}

const NOTHING_YET: Settled = { key: "", status: "none", stays: [] };

export function useSearchResults(parsed: ParsedQuery): SearchResultsState {
  const request = useMemo(() => buildSearchRequest(parsed), [parsed]);
  const key = JSON.stringify(request);
  const [settled, setSettled] = useState<Settled>(NOTHING_YET);
  const [attempt, setAttempt] = useState(0);

  // The cache is only read here, never during render: React Compiler would memoize a render-time
  // read of module state and never see the result arrive.
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const cachedStays = cache.get(key);
    (cachedStays ? Promise.resolve(cachedStays) : fetchSearch(request, controller.signal))
      .then((stays) => {
        remember(key, stays);
        if (isActive) setSettled({ key, status: stays.length ? "ready" : "empty", stays });
      })
      .catch(() => {
        if (isActive) setSettled({ key, status: "error", stays: [] });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [key, request, attempt]);

  const retry = useCallback(() => {
    cache.clear();
    setSettled(NOTHING_YET);
    setAttempt((n) => n + 1);
  }, []);

  if (settled.status !== "none" && settled.key === key) {
    return { status: settled.status, stays: settled.stays, isRefreshing: false, retry };
  }
  // A new search is running: keep the last results visible instead of flashing an empty list.
  if (settled.status === "ready" || settled.status === "empty") {
    return { status: settled.status, stays: settled.stays, isRefreshing: true, retry };
  }
  return { status: "loading", stays: [], isRefreshing: false, retry };
}
