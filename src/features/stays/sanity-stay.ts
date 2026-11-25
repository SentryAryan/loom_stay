import { amenityLabels, type AmenityId, type Stay, type StayCategory } from "./stays";

const IMAGE_PARAMS = "?auto=format&fit=crop&w=1200&h=900&q=80";
const categories: readonly StayCategory[] = ["cabin", "beach", "city", "villa"];

// Shared by Home and Search so both read the same fields. The `->` only projects the image URL;
// nothing is filtered by it.
export const STAY_PROJECTION = `{
  "id": _id, title, city, "state": region, country, category, rating, reviewCount,
  "pricePerNight": nightlyPrice, amenities, petsAllowed, vibes,
  "imageUri": images[0].asset->url, "imageAlt": images[0].alt
}`;

export interface SanityStay {
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

// Docs with a missing image, price, title, place or category are dropped instead of crashing a card.
// `state` carries the country: cards show "City, Country".
export function toStay(doc: SanityStay): Stay | null {
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

export function toStays(docs: readonly SanityStay[]): readonly Stay[] {
  return docs.map(toStay).filter((s): s is Stay => s !== null);
}
