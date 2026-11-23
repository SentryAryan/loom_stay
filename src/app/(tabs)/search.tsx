import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { FilterChips } from "@/features/stays/filter-chips";
import { useSearchState } from "@/features/stays/search-state";
import {
  countActiveFilters,
  searchParsed,
  sortLabels,
  sortStays,
} from "@/features/stays/search-stays";
import { StayRow } from "@/features/stays/stay-row";
import { useThemeColors } from "@/theme";

export default function SearchScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { text, setText, filters, setFilters, sort, searchId, commitText } = useSearchState();
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());

  const results = useMemo(() => sortStays(searchParsed(filters), sort), [filters, sort]);
  const activeCount = countActiveFilters(filters);

  function handleSubmit() {
    Keyboard.dismiss();
    commitText();
  }

  function handleToggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 12 }}>
      <View className="flex-row items-center gap-3 px-md">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          onPress={() => router.navigate("/home")}
          className="size-13 items-center justify-center rounded-full bg-surface-container transition-transform duration-150 active:scale-95"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View className="h-13 flex-1 flex-row items-center gap-3 rounded-full bg-surface-container pl-5 pr-2">
          <Ionicons name="search-outline" size={22} color={colors.onSurface} />
          {/* Android ignores a text change pushed into a tab that is not on screen, so a new search from Home remounts the field. */}
          <TextInput
            key={searchId}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSubmit}
            placeholder="Describe your stay"
            placeholderTextColor={colors.onSurfaceVariant}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search stays"
            className="type-body-lg min-h-11 flex-1 p-0 text-on-surface"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"}
            hitSlop={4}
            onPress={() => router.push("/filters")}
            className="size-11 items-center justify-center rounded-full transition-transform duration-150 active:scale-95"
          >
            <Ionicons name="options-outline" size={22} color={colors.onSurface} />
            {activeCount > 0 ? (
              <View className="absolute right-1 top-1 size-4 items-center justify-center rounded-full bg-primary-container">
                <AppText variant="labelSm" numeric className="text-on-primary-container">
                  {activeCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View className="pt-md">
        <FilterChips parsed={filters} onChange={setFilters} />
      </View>

      <View className="flex-row items-center justify-between px-5 pb-sm pt-lg">
        <AppText variant="bodyLg" numeric className="text-on-surface-variant" accessibilityLiveRegion="polite">
          {results.length} {results.length === 1 ? "stay" : "stays"}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${sortLabels[sort]}`}
          hitSlop={8}
          onPress={() => router.push("/sort")}
          className="min-h-11 flex-row items-center gap-1 transition-transform duration-150 active:scale-95"
        >
          <AppText variant="bodyMd" className="text-on-surface-variant">
            Sort by
          </AppText>
          <AppText variant="headlineSm">{sortLabels[sort]}</AppText>
          <Ionicons name="chevron-down" size={18} color={colors.onSurface} />
        </Pressable>
      </View>

      <FlatList
        data={results}
        keyExtractor={(stay) => stay.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 pb-md pt-sm"
        renderItem={({ item }) => (
          <StayRow
            stay={item}
            highlightAmenities={filters.amenities}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        ListEmptyComponent={
          <View className="items-center gap-sm px-xl pt-2xl">
            <Ionicons name="home-outline" size={32} color={colors.onSurfaceVariant} />
            <AppText variant="headlineMd" className="text-center">
              No stays match yet
            </AppText>
            <AppText variant="bodyMd" className="text-center text-on-surface-variant">
              Try removing a filter or describing the stay another way, like a quiet cabin under $300.
            </AppText>
          </View>
        }
      />
    </View>
  );
}
