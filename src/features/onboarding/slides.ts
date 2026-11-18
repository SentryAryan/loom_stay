// Onboarding slide content. Photos are Unsplash hotlinks (free to use; credit
// recorded here). Size params crop to a portrait frame.
const photo = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1800&q=80`;

export interface OnboardingSlide {
  id: string;
  title: string;
  body: string;
  /** Location chip over the photo. */
  place: string;
  imageUri: string;
  /** Alt text for screen readers. */
  imageAlt: string;
}

export const onboardingSlides: readonly OnboardingSlide[] = [
  {
    id: "story",
    title: "Find a stay that fits your story",
    body: "From mountain cabins to oceanfront villas, Loom Stay helps you find unforgettable stays for every kind of trip.",
    place: "Whistler, BC",
    // Photo: Maciej Marko, Unsplash
    imageUri: photo("1790019853070-657d3fd571c6"),
    imageAlt: "A wooden cabin beside a calm lake under jagged mountains at golden hour",
  },
  {
    id: "describe",
    title: "Just say what you want",
    body: "Describe your stay in one sentence, like a quiet, pet friendly cabin with a hot tub under $300 a night, and see the best matches first.",
    place: "Big Sur, CA",
    // Photo: Daniel Begel, Unsplash
    imageUri: photo("1785202761464-075826cd81e2"),
    imageAlt: "A white house on a sandy beach at sunset",
  },
  {
    id: "trust",
    title: "Answers you can trust",
    body: "Ask about booking and house rules for any stay and get the host's and Loom Stay's own words, with the source.",
    place: "Lake Tahoe, NV",
    // Photo: Hendrik Morkel, Unsplash
    imageUri: photo("1758861356142-546a3822ab1a"),
    imageAlt: "A cozy cabin with a wood stove overlooking a calm lake",
  },
];
