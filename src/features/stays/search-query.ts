import { STAY_PROJECTION } from "./sanity-stay";
import type { ParsedQuery } from "./search-stays";

// Exact constraints are GROQ filters; empty arrays and a null price mean "no constraint".
// Embeddings only rank: `score(text::semanticSimilarity($q))` never removes a stay. An empty `$q`
// gives every stay a score of 0, so the order falls back to rating. Values only go in through
// params, never into this string.
export const SEARCH_QUERY = `*[_type == "property" && defined(slug.current)
  && ($max == null || nightlyPrice <= $max)
  && (count($categories) == 0 || category in $categories)
  && count($amenities[!(@ in ^.amenities)]) == 0
  && ($pets == false || petsAllowed == true)
] | score(text::semanticSimilarity($q))
  | order(_score desc, rating desc, reviewCount desc) ${STAY_PROJECTION}`;

export interface SearchParams {
  max: number | null;
  categories: readonly string[];
  amenities: readonly string[];
  pets: boolean;
  /** The words left after price, amenities and category were parsed out. They only rank. */
  q: string;
}

export interface SearchRequest {
  query: string;
  params: SearchParams;
}

export function buildSearchRequest(parsed: ParsedQuery): SearchRequest {
  return {
    query: SEARCH_QUERY,
    params: {
      max: parsed.maxPrice,
      categories: parsed.categories,
      // Pets is a field on the stay (petsAllowed), not an entry in its amenities list.
      amenities: parsed.amenities.filter((amenity) => amenity !== "pets"),
      pets: parsed.amenities.includes("pets"),
      q: parsed.words.join(" "),
    },
  };
}
