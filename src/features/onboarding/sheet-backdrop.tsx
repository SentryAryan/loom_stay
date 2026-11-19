import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useThemeColors } from "@/theme";

// Height of the curved band at the top of the sheet. The path is traced from
// assets/images/prompt-images/onboarding.png (the white sheet's top edge,
// scaled so the screen is 390 wide): it starts low at the left with a tight
// corner, climbs to a flat crest about a quarter of the way across, slopes down
// gently to the right and curls into the screen edge. Mean fit error to the
// mockup is 0.3 units. Stretched to the screen width.
const CURVE_HEIGHT = 72;
const CURVE_PATH =
  "M0 72 V50 C0.3 47.4 1.1 38.3 1.9 34.6 C2.7 30.9 3.3 30.6 5 27.8 C6.8 25 9.1 21 12.4 17.9 C15.7 14.8 19.7 11.5 24.8 9.2 C29.9 6.9 32.9 5.2 43.3 4.2 C53.7 3.2 73.5 3 87 3 C100.5 3 109.7 3.5 124 4.2 C138.3 4.9 156.5 5.9 173 7.3 C189.5 8.7 206.5 10.3 223 12.3 C239.5 14.3 255.5 16.5 272 19.1 C288.5 21.7 308.5 25.3 322 27.8 C335.5 30.3 344.5 31.6 353 34 C361.5 36.4 367.8 38.8 373 42 C378.2 45.2 381.5 49.8 384 53 C386.5 56.2 387 57.8 388 61 C389 64.2 389.7 70.2 390 72 Z";

/**
 * Background of the onboarding bottom sheet: a curved top edge over a solid
 * body. Render it as the first child of a `relative` wrapper; the sheet content
 * goes after it in normal flow and draws on top.
 */
export function SheetBackdrop() {
  const colors = useThemeColors();

  return (
    <>
      <Svg
        pointerEvents="none"
        width="100%"
        height={CURVE_HEIGHT}
        viewBox={`0 0 390 ${CURVE_HEIGHT}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <Path d={CURVE_PATH} fill={colors.surfaceContainerLowest} />
      </Svg>
      {/* Solid body below the curve; 1pt overlap avoids a hairline seam. */}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 bottom-0 bg-surface-container-lowest"
        style={{ top: CURVE_HEIGHT - 1 }}
      />
    </>
  );
}
