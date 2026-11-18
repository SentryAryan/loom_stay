// Text style names. The styles themselves are `type-*` utilities in global.css.
export const textVariants = {
  displayLg: "type-display-lg",
  displayLgMobile: "type-display-lg-mobile",
  headlineXl: "type-headline-xl",
  headlineLg: "type-headline-lg",
  headlineMd: "type-headline-md",
  headlineSm: "type-headline-sm",
  bodyLg: "type-body-lg",
  bodyMd: "type-body-md",
  bodySm: "type-body-sm",
  priceDisplay: "type-price-display",
  labelMd: "type-label-md",
  labelSm: "type-label-sm",
  wordmarkSm: "type-wordmark-sm",
  wordmarkMd: "type-wordmark-md",
  wordmarkLg: "type-wordmark-lg",
} as const;

export type TextVariant = keyof typeof textVariants;
