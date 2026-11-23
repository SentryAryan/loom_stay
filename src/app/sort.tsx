import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { sortLabels, sortOrder, type SortId } from "@/features/stays/search-stays";
import { useSearchState } from "@/features/stays/search-state";
import { SheetHeader } from "@/features/stays/sheet-header";
import { useThemeColors } from "@/theme";

// Sort sheet: one list, a check on the current choice. Picking one applies it and closes.
export default function Sort() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { sort, setSort } = useSearchState();

  function choose(next: SortId) {
    setSort(next);
    router.back();
  }

  return (
    <View className="flex-1 bg-surface">
      <SheetHeader title="Sort by" />

      <View className="gap-md px-lg pt-sm" style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
        <View className="overflow-hidden rounded-xl bg-surface-container-lowest">
          {sortOrder.map((id, index) => {
            const isSelected = id === sort;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityLabel={sortLabels[id]}
                accessibilityState={{ selected: isSelected }}
                onPress={() => choose(id)}
                className={`min-h-14 flex-row items-center justify-between px-lg transition-colors duration-150 active:bg-surface-container ${
                  index > 0 ? "border-t border-outline-variant" : ""
                }`}
              >
                <AppText variant={isSelected ? "headlineMd" : "bodyLg"}>{sortLabels[id]}</AppText>
                {isSelected ? <Ionicons name="checkmark" size={22} color={colors.primaryContainer} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
      </View>
    </View>
  );
}
