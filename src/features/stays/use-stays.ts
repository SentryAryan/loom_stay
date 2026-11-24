import { useCallback, useEffect, useState } from "react";

import { SANITY_QUERY_URL } from "./sanity-config";
import { amenityLabels, type AmenityId, type Stay, type StayCategory } from "./stays";

const REQUEST_TIMEOUT_MS = 10_000;
const IMAGE_PARAMS = "?auto=format&fit=crop&w=1200&h=900&q=80";
const categories: readonly StayCategory[] = ["cabin", "beach", "city", "villa"];

// Constant query, no interpolation. The `->` only projects the image URL; nothing is filtered by it.
const QUERY = `*[_type == "property" && defined(slug.current)] | order(rating desc, reviewCount desc) {
  "id": _id, title, city, "state": region, country, category, rating, reviewCount,
  "pricePerNight": nightlyPrice, amenities, petsAllowed, vibes,
  "imageUri": images[0].asset->url, "imageAlt": images[0].alt
}`;

interface SanityStay {
  id: string;
  title?: string;
  city?: string;
  country?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  pricePerNight?: number;
  amenities?: string[];
  petsAllowed?: boolean;
  vibes?: string[];
  imageUri?: string;
  imageAlt?: string;
}

export type StaysState =
  | { status: "loading"; stays: readonly Stay[] }
  | { status: "error"; stays: readonly Stay[] }
  | { status: "empty"; stays: readonly Stay[] }
  | { status: "ready"; stays: readonly Stay[] };

// Docs with a missing image, price, title, place or category are dropped instead of crashing a card.
// `state` carries the country: Home shows "City, Country".
function toStay(doc: SanityStay): Stay | null {
  const category = categories.find((c) => c === doc.category);
  if (!doc.title || !doc.city || !doc.country || !category || !doc.imageUri || typeof doc.pricePerNight !== "number") {
    return null;
  }
  const known = (doc.amenities ?? []).filter((id): id is AmenityId => id in amenityLabels);
  // "pets" is an amenity locally; it goes after the first two so the first-two-tags rule still holds.
  const amenities = doc.petsAllowed ? [...known.slice(0, 2), "pets" as const, ...known.slice(2)] : known;
  return {
    id: doc.id,
    title: doc.title,
    city: doc.city,
    state: doc.country,
    category,
    rating: doc.rating ?? 0,
    reviewCount: doc.reviewCount ?? 0,
    pricePerNight: doc.pricePerNight,
    amenities,
    vibes: doc.vibes ?? [],
    imageUri: `${doc.imageUri}${IMAGE_PARAMS}`,
    imageAlt: doc.imageAlt ?? doc.title,
  };
}

async function fetchStays(): Promise<readonly Stay[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${SANITY_QUERY_URL}?query=${encodeURIComponent(QUERY)}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
    const body = (await res.json()) as { result?: SanityStay[] };
    return (body.result ?? []).map(toStay).filter((s): s is Stay => s !== null);
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
