import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { useThemeColors } from "@/theme";

import { AppText } from "./app-text";

// Symbol edge in points and the wordmark style that pairs with it.
const sizes = {
  sm: { symbol: 24, wordmark: "wordmarkSm" },
  md: { symbol: 32, wordmark: "wordmarkMd" },
  lg: { symbol: 48, wordmark: "wordmarkLg" },
} as const;

export interface LogoProps {
  variant?: "lockup" | "symbol" | "wordmark";
  size?: keyof typeof sizes;
  className?: string;
  /** Wordmark color override for non-default surfaces, e.g. "text-inverse-on-surface". */
  textClassName?: string;
}

// Two roof strands and a vertical thread woven over/under each other. The
// tile-colored wide strokes underneath open a small gap where a strand crosses.
const LOWER_STRAND = "M14 44 L32 29 L50 44";
const UPPER_STRAND = "M14 32 L32 17 L50 32";
const THREAD = "M32 24 V52";

export function LogoSymbol({ size = "md" }: { size?: keyof typeof sizes }) {
  const colors = useThemeColors();
  const edge = sizes[size].symbol;
  const tile = colors.primaryContainer;
  const glyph = colors.onPrimaryContainer;

  return (
    <Svg width={edge} height={edge} viewBox="0 0 64 64">
      <Rect width={64} height={64} rx={16} fill={tile} />
      <Path d={LOWER_STRAND} stroke={glyph} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={THREAD} stroke={tile} strokeWidth={10} fill="none" />
      <Path d={THREAD} stroke={glyph} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d={UPPER_STRAND} stroke={tile} strokeWidth={10} strokeLinejoin="round" fill="none" />
      <Path d={UPPER_STRAND} stroke={glyph} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Loom Stay brand mark. One accessible image; the parts are hidden from screen readers. */
export function Logo({ variant = "lockup", size = "md", className, textClassName }: LogoProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Loom Stay"
      className={`flex-row items-center gap-sm ${className ?? ""}`}
    >
      {variant !== "wordmark" ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <LogoSymbol size={size} />
        </View>
      ) : null}
      {variant !== "symbol" ? (
        <AppText
          variant={sizes[size].wordmark}
          className={textClassName}
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          Loom Stay
        </AppText>
      ) : null}
    </View>
  );
}
