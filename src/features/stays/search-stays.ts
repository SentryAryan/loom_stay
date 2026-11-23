import { stays, type AmenityId, type Stay, type StayCategory } from "./stays";

// Local stand-in for the real search (GROQ filters plus embeddings). Hard constraints are
// parsed from the sentence in code and filter; soft words only rank, as embeddings will.

export interface ParsedQuery {
  maxPrice: number | null;
  amenities: readonly AmenityId[];
  categories: readonly StayCategory[];
  /** Leftover words, matched against the title, place and vibes to rank. */
  words: readonly string[];
}

const amenityPhrases: readonly (readonly [AmenityId, RegExp])[] = [
  ["hot-tub", /\bhot\s*-?\s*tubs?\b|\bjacuzzi\b/],
  ["pets", /\bpet\s*-?\s*friendly\b|\bpets?\b|\bdogs?\b/],
  ["pool", /\bpools?\b/],
  ["ocean-view", /\bocean\s*-?\s*views?\b|\bsea\s*views?\b/],
  ["fireplace", /\bfire\s*places?\b/],
  ["lake-view", /\blake\s*-?\s*views?\b/],
  ["city-view", /\bcity\s*views?\b|\bskyline\b/],
  ["workspace", /\bworkspace\b|\bdesk\b/],
];

const categoryPhrases: readonly (readonly [StayCategory, RegExp])[] = [
  ["cabin", /\bcabins?\b/],
  ["beach", /\bbeach(es)?\b|\bbeachfront\b|\boceanfront\b/],
  ["city", /\bcity\b|\bdowntown\b|\bapartments?\b|\blofts?\b/],
  ["villa", /\bvillas?\b/],
];

const pricePattern = /(?:under|below|less than|up to|max(?:imum)?|<)\s*\$?\s*(\d{2,5})|\$\s*(\d{2,5})\s*(?:or less|max)?/;

// Words that carry no meaning for ranking.
const fillerWords = new Set([
  "a", "an", "and", "the", "with", "in", "at", "near", "for", "to", "of", "on", "stay", "stays",
  "place", "home", "house", "night", "per", "a", "i", "want", "need", "find", "me", "some",
]);

function stripMatch(text: string, pattern: RegExp): { matched: boolean; rest: string } {
  const matched = pattern.test(text);
  return { matched, rest: matched ? text.replace(new RegExp(pattern, "g"), " ") : text };
}

export function parseQuery(query: string): ParsedQuery {
  let rest = query.toLowerCase();

  let maxPrice: number | null = null;
  const price = pricePattern.exec(rest);
  if (price) {
    maxPrice = Number(price[1] ?? price[2]);
    rest = rest.replace(pricePattern, " ");
  }

  const amenities: AmenityId[] = [];
  for (const [id, pattern] of amenityPhrases) {
    const result = stripMatch(rest, pattern);
    if (result.matched) {
      amenities.push(id);
      rest = result.rest;
    }
  }

  const categories: StayCategory[] = [];
  for (const [id, pattern] of categoryPhrases) {
    const result = stripMatch(rest, pattern);
    if (result.matched) {
      categories.push(id);
      rest = result.rest;
    }
  }

  const words = rest
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !fillerWords.has(word));

  return { maxPrice, amenities, categories, words };
}

// Immutable edits for the filter chips on the Search screen.
export function withCategory(parsed: ParsedQuery, category: StayCategory, isOn: boolean): ParsedQuery {
  const rest = parsed.categories.filter((item) => item !== category);
  return { ...parsed, categories: isOn ? [...rest, category] : rest };
}

export function withAmenity(parsed: ParsedQuery, amenity: AmenityId, isOn: boolean): ParsedQuery {
  const rest = parsed.amenities.filter((item) => item !== amenity);
  return { ...parsed, amenities: isOn ? [...rest, amenity] : rest };
}

export function withMaxPrice(parsed: ParsedQuery, maxPrice: number | null): ParsedQuery {
  return { ...parsed, maxPrice };
}

function matchesConstraints(stay: Stay, parsed: ParsedQuery): boolean {
  if (parsed.maxPrice !== null && stay.pricePerNight > parsed.maxPrice) return false;
  if (!parsed.amenities.every((amenity) => stay.amenities.includes(amenity))) return false;
  // Several categories mean "any of these" ("beach or city").
  if (parsed.categories.length > 0 && !parsed.categories.includes(stay.category)) return false;
  return true;
}

function softScore(stay: Stay, words: readonly string[]): number {
  if (words.length === 0) return 0;
  const place = `${stay.title} ${stay.city} ${stay.state}`.toLowerCase();
  let score = 0;
  for (const word of words) {
    if (stay.vibes.includes(word)) score += 2;
    else if (place.includes(word)) score += 1;
  }
  return score;
}

/**
 * Filters by the parsed constraints, then ranks by soft-word matches and rating.
 * Words that match nothing never remove a stay; they just do not help it rank.
 */
export function searchParsed(parsed: ParsedQuery, source: readonly Stay[] = stays): Stay[] {
  return source
    .filter((stay) => matchesConstraints(stay, parsed))
    .map((stay) => ({ stay, score: softScore(stay, parsed.words) }))
    .sort((a, b) => b.score - a.score || b.stay.rating - a.stay.rating || b.stay.reviewCount - a.stay.reviewCount)
    .map(({ stay }) => stay);
}

export type SortId = "best" | "price-asc" | "price-desc" | "rating";

export const sortLabels: Record<SortId, string> = {
  best: "Best match",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

export const sortOrder: readonly SortId[] = ["best", "price-asc", "price-desc", "rating"];

/** "Best match" keeps the order searchParsed produced; the others re-sort a copy of it. */
export function sortStays(list: readonly Stay[], sort: SortId): Stay[] {
  const copy = [...list];
  if (sort === "price-asc") return copy.sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (sort === "price-desc") return copy.sort((a, b) => b.pricePerNight - a.pricePerNight);
  if (sort === "rating") return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  return copy;
}

export function countActiveFilters(parsed: ParsedQuery): number {
  return (parsed.maxPrice !== null ? 1 : 0) + parsed.amenities.length + parsed.categories.length;
}

export function searchStays(query: string, source: readonly Stay[] = stays): Stay[] {
  return searchParsed(parseQuery(query), source);
}
