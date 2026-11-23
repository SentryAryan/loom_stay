import { Pressable } from "react-native";

import { AppText } from "@/components/app-text";

interface ToggleChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

// Pill that flips between a tinted selected state and a neutral one; color and press scale ease.
export function ToggleChip({ label, isSelected, onPress, accessibilityLabel }: ToggleChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      className={`min-h-11 justify-center rounded-full px-5 transition-[transform,background-color] duration-150 active:scale-[0.97] ${
        isSelected ? "bg-primary-fixed" : "bg-surface-container"
      }`}
    >
      <AppText
        variant="headlineSm"
        className={isSelected ? "text-on-primary-fixed-variant" : "text-on-surface"}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
