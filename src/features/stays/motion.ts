import { Easing, FadeIn, Keyframe, useReducedMotion } from "react-native-reanimated";

// Shared motion for the stays screens. Strong ease-out for anything entering, short and small:
// content rises 8pt while it fades in, each section starting a beat after the one above.
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const ENTER_MS = 250;
const STAGGER_MS = 40;
const RISE_PX = 8;

/** `order` is the section's position on the screen; later sections start later. */
export function useEnterAnimation(order: number) {
  const isReducedMotion = useReducedMotion();

  // Reduced motion keeps the fade (it explains the change) and drops the movement.
  if (isReducedMotion) return FadeIn.duration(150);

  return new Keyframe({
    0: { opacity: 0, transform: [{ translateY: RISE_PX }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
  })
    .duration(ENTER_MS)
    .delay(order * STAGGER_MS);
}
