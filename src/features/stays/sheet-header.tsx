import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/app-text";
import { useThemeColors } from "@/theme";

interface SheetHeaderProps {
  title: string;
  /** Small count pill next to the title, e.g. the number of active filters. */
  badge?: number;
}

// Sticky top of a bottom sheet: title (with an optional count) and a round close button.
// Android draws no native header inside a form sheet, so it is part of the content.
export function SheetHeader({ title, badge }: SheetHeaderProps) {
  const colors = useThemeColors();

  return (
    <View className="min-h-14 flex-row items-center justify-between px-lg pt-sm">
      <View className="flex-row items-center gap-sm">
        <AppText variant="headlineLg" accessibilityRole="header">
          {title}
        </AppText>
        {badge ? (
          <View className="size-6 items-center justify-center rounded-full bg-surface-container">
            <AppText variant="labelSm" numeric>
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        onPress={() => router.back()}
        className="size-8 items-center justify-center rounded-full bg-surface-container transition-transform duration-150 active:scale-95"
      >
        <Ionicons name="close" size={18} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}
