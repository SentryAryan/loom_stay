// Local stay data for Home and Search until the Sanity content exists. The fields mirror
// what a Sanity `property` document will hold, so swapping the source later only touches
// this file and search-stays.ts.
//
// Photos are Unsplash hotlinks (free to use under the Unsplash license); photographer
// credits are not recorded here. Size params crop each photo to the card's frame.
const photo = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=900&q=80`;

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

export const stays: readonly Stay[] = [
  {
    id: "lake-arrowhead-cabin",
    title: "Modern Cabin with Hot Tub",
    city: "Lake Arrowhead",
    state: "CA",
    category: "cabin",
    rating: 4.9,
    reviewCount: 342,
    pricePerNight: 289,
    amenities: ["hot-tub", "pets", "fireplace", "lake-view"],
    vibes: ["quiet", "cozy", "secluded", "romantic", "mountain"],
    imageUri: photo("1510798831971-661eb04b3739"),
    imageAlt: "A snow-dusted wooden cabin with glowing windows beside a still lake",
  },
  {
    id: "malibu-villa",
    title: "Oceanview Villa with Private Pool",
    city: "Malibu",
    state: "CA",
    category: "villa",
    rating: 4.8,
    reviewCount: 128,
    pricePerNight: 412,
    amenities: ["pool", "ocean-view", "pets", "workspace"],
    vibes: ["luxury", "modern", "romantic", "sunny"],
    imageUri: photo("1512917774080-9991f1c4c750"),
    imageAlt: "A white modern villa with floor-to-ceiling windows beside a turquoise pool",
  },
  {
    id: "monte-rio-a-frame",
    title: "A-Frame in the Redwoods",
    city: "Monte Rio",
    state: "CA",
    category: "cabin",
    rating: 4.9,
    reviewCount: 96,
    pricePerNight: 236,
    amenities: ["fireplace", "pets", "hot-tub"],
    vibes: ["quiet", "cozy", "secluded", "romantic", "forest"],
    imageUri: photo("1542718610-a1d656d1884c"),
    imageAlt: "A dark timber cabin with a steep roof against an orange sunset sky",
  },
  {
    id: "napa-designer-home",
    title: "Designer Home in Wine Country",
    city: "Napa",
    state: "CA",
    category: "villa",
    rating: 4.7,
    reviewCount: 74,
    pricePerNight: 358,
    amenities: ["pool", "workspace", "pets"],
    vibes: ["quiet", "modern", "luxury", "sunny", "vineyard"],
    imageUri: photo("1613490493576-7fde63acd811"),
    imageAlt: "A white modern house with a long swimming pool under a blue sky",
  },
  {
    id: "laguna-beach-bungalow",
    title: "Beach Bungalow Steps from the Sand",
    city: "Laguna Beach",
    state: "CA",
    category: "beach",
    rating: 4.8,
    reviewCount: 211,
    pricePerNight: 327,
    amenities: ["ocean-view", "pets", "workspace"],
    vibes: ["sunny", "relaxing", "family", "tropical"],
    imageUri: photo("1499793983690-e29da59ef1c2"),
    imageAlt: "A thatched-roof beach bungalow with palm trees over turquoise water",
  },
  {
    id: "pismo-shore-cottage",
    title: "Sunset Shore Cottage",
    city: "Pismo Beach",
    state: "CA",
    category: "beach",
    rating: 4.6,
    reviewCount: 158,
    pricePerNight: 214,
    amenities: ["ocean-view", "fireplace", "pets"],
    vibes: ["quiet", "cozy", "relaxing", "romantic"],
    imageUri: photo("1507525428034-b723cf961d3e"),
    imageAlt: "Soft waves rolling onto an empty beach at sunset",
  },
  {
    id: "big-bear-forest-cabin",
    title: "Cozy Forest Cabin with Fireplace",
    city: "Big Bear Lake",
    state: "CA",
    category: "cabin",
    rating: 4.8,
    reviewCount: 187,
    pricePerNight: 198,
    amenities: ["fireplace", "pets", "hot-tub"],
    vibes: ["quiet", "cozy", "secluded", "forest", "family"],
    imageUri: photo("1449158743715-0a90ebb6d2d8"),
    imageAlt: "A weathered log cabin among tall pines in a misty forest",
  },
  {
    id: "tahoe-boathouse",
    title: "Lakeside Boathouse Retreat",
    city: "Lake Tahoe",
    state: "CA",
    category: "cabin",
    rating: 4.9,
    reviewCount: 263,
    pricePerNight: 342,
    amenities: ["lake-view", "fireplace", "hot-tub"],
    vibes: ["quiet", "secluded", "romantic", "mountain", "luxury"],
    imageUri: photo("1470770841072-f978cf4d019e"),
    imageAlt: "A wooden boathouse on a green alpine lake below snow-capped peaks",
  },
  {
    id: "sf-downtown-loft",
    title: "Sunny Downtown Loft",
    city: "San Francisco",
    state: "CA",
    category: "city",
    rating: 4.7,
    reviewCount: 305,
    pricePerNight: 224,
    amenities: ["city-view", "workspace"],
    vibes: ["modern", "sunny", "business", "central"],
    imageUri: photo("1480714378408-67cf0d13bc1b"),
    imageAlt: "Downtown skyscrapers glowing in late afternoon light",
  },
  {
    id: "la-skyline-studio",
    title: "Skyline Studio with City Views",
    city: "Los Angeles",
    state: "CA",
    category: "city",
    rating: 4.5,
    reviewCount: 142,
    pricePerNight: 168,
    amenities: ["city-view", "workspace", "pool"],
    vibes: ["modern", "business", "central", "lively"],
    imageUri: photo("1486406146926-c627a92ad1ab"),
    imageAlt: "Glass towers rising against a pale sky seen from street level",
  },
  {
    id: "san-diego-apartment",
    title: "Bright Mid-Century Apartment",
    city: "San Diego",
    state: "CA",
    category: "city",
    rating: 4.6,
    reviewCount: 89,
    pricePerNight: 149,
    amenities: ["workspace", "pets"],
    vibes: ["quiet", "cozy", "modern", "sunny", "family"],
    imageUri: photo("1522708323590-d24dbb6b0267"),
    imageAlt: "A sunny apartment living room with a red armchair and tall windows",
  },
  {
    id: "ojai-resort-villa",
    title: "Resort Villa with Pool and Garden",
    city: "Ojai",
    state: "CA",
    category: "villa",
    rating: 4.8,
    reviewCount: 119,
    pricePerNight: 395,
    amenities: ["pool", "hot-tub", "pets", "workspace"],
    vibes: ["quiet", "luxury", "relaxing", "tropical", "secluded"],
    imageUri: photo("1520250497591-112f2f40a3f4"),
    imageAlt: "A tropical pool surrounded by palms and thatched-roof villas",
  },
];

export const categoryLabels: Record<StayCategory, string> = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
};
