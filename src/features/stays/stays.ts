// Stay types and display labels. The stays themselves come from Sanity (see use-stays.ts and
// use-search-results.ts); their fields mirror the `property` document.

export type StayCategory = "cabin" | "beach" | "city" | "villa";

export type AmenityId =
  | "hot-tub"
  | "pets"
  | "pool"
  | "ocean-view"
  | "fireplace"
  | "lake-view"
  | "city-view"
  | "workspace";

export const amenityLabels: Record<AmenityId, string> = {
  "hot-tub": "Hot Tub",
  pets: "Pets",
  pool: "Pool",
  "ocean-view": "Ocean View",
  fireplace: "Fireplace",
  "lake-view": "Lake View",
  "city-view": "City View",
  workspace: "Workspace",
};

export interface Stay {
  id: string;
  title: string;
  city: string;
  state: string;
  category: StayCategory;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  /** Most notable first: the first two show as tags on a search result. */
  amenities: readonly AmenityId[];
  /** Soft intent words. They rank results and never filter them. */
  vibes: readonly string[];
  imageUri: string;
  imageAlt: string;
}

export const categoryLabels: Record<StayCategory, string> = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
};
