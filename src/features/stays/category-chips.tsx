import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/app-text";
import { useThemeColors } from "@/theme";

import { categoryLabels, type StayCategory } from "./stays";

export type CategoryFilter = StayCategory | "all";

const ICON_SIZE = 22;

// Icons match the design: house, fir tree, waves, building, palm tree.
const chips: readonly { id: CategoryFilter; label: string; renderIcon: (color: string) => ReactNode }[] = [
  {
    id: "all",
    label: "All Stays",
    renderIcon: (color) => <Ionicons name="home-outline" size={ICON_SIZE} color={color} />,
  },
  {
    id: "cabin",
    label: categoryLabels.cabin,
    renderIcon: (color) => <MaterialCommunityIcons name="pine-tree" size={ICON_SIZE} color={color} />,
  },
  {
    id: "beach",
    label: categoryLabels.beach,
    renderIcon: (color) => <MaterialCommunityIcons name="waves" size={ICON_SIZE} color={color} />,
  },
  {
    id: "city",
    label: categoryLabels.city,
    renderIcon: (color) => <MaterialCommunityIcons name="office-building-outline" size={ICON_SIZE} color={color} />,
  },
  {
    id: "villa",
    label: categoryLabels.villa,
    renderIcon: (color) => <MaterialCommunityIcons name="palm-tree" size={ICON_SIZE} color={color} />,
  },
];

interface CategoryChipsProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

// Wrapping row of pill chips, one selected at a time. Color eases between states.
export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row flex-wrap gap-sm" accessibilityRole="radiogroup">
      {chips.map((chip) => {
        const isSelected = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            accessibilityRole="radio"
            accessibilityLabel={chip.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(chip.id)}
            className={`min-h-11 flex-row items-center gap-sm rounded-full px-md transition-[transform,background-color] duration-150 active:scale-[0.97] ${
              isSelected ? "bg-primary-container" : "bg-surface-container"
            }`}
          >
            {chip.renderIcon(isSelected ? colors.onPrimaryContainer : colors.onSurface)}
            <AppText
              variant="headlineSm"
              className={isSelected ? "text-on-primary-container" : "text-on-surface"}
            >
              {chip.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
