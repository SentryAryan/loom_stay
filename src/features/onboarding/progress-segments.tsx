import { View } from "react-native";

interface ProgressSegmentsProps {
  total: number;
  /** Zero-based index of the current slide. */
  current: number;
}

export function ProgressSegments({ total, current }: ProgressSegmentsProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current + 1} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
      className="flex-row gap-sm"
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-1 w-10 rounded-full ${i === current ? "bg-primary-container" : "bg-surface-container-high"}`}
        />
      ))}
    </View>
  );
}
