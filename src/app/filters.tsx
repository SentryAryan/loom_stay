import { router } from "expo-router";
import { Platform, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { countActiveFilters, withAmenity, withCategory, withMaxPrice } from "@/features/stays/search-stays";
import { useSearchState } from "@/features/stays/search-state";
import { useSearchResults } from "@/features/stays/use-search-results";
import { SheetHeader } from "@/features/stays/sheet-header";
import { amenityLabels, categoryLabels, type AmenityId, type StayCategory } from "@/features/stays/stays";
import { ToggleChip } from "@/features/stays/toggle-chip";
import { FILTER_DETENT } from "@/features/stays/sheet-detents";

const categoryIds: readonly StayCategory[] = ["cabin", "beach", "city", "villa"];
const amenityIds = Object.keys(amenityLabels) as AmenityId[];
const PRICE_STEPS: readonly (number | null)[] = [null, 150, 200, 300, 400];

function priceLabel(maxPrice: number | null): string {
  return maxPrice === null ? "Any price" : `Under $${maxPrice}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-sm">
      <AppText variant="labelMd">{title}</AppText>
      <View className="flex-row flex-wrap gap-sm">{children}</View>
    </View>
  );
}

// Filter sheet. Every change applies right away; the button just closes it and shows the count.
export default function Filters() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { filters, setFilters } = useSearchState();
  // Android gives a sheet's content no bounded height, so flex-1 grows past the screen and pushes
  // the bottom bar off it; give it the detent's height instead. iOS bounds it for us.
  // A detent is a fraction of the screen below the status bar.
  const sheetFrame =
    Platform.OS === "android" ? { height: (windowHeight - insets.top) * FILTER_DETENT } : { flex: 1 };
  // Same request the Search tab runs for these filters, so the count matches the list behind the sheet.
  const { status, stays, isRefreshing } = useSearchResults(filters);
  const resultCount = stays.length;
  const hasCount = status !== "loading" && status !== "error" && !isRefreshing;
  const activeCount = countActiveFilters(filters);

  // A price typed in the sentence ("under $250") is not one of the steps; show it as its own chip.
  const priceSteps = PRICE_STEPS.includes(filters.maxPrice)
    ? PRICE_STEPS
    : [...PRICE_STEPS, filters.maxPrice].sort((a, b) => (a ?? 0) - (b ?? 0));

  return (
    <View className="bg-surface" style={sheetFrame}>
      <SheetHeader title="Filters" badge={activeCount} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-lg px-lg py-md"
        showsVerticalScrollIndicator={false}
      >
        <Section title="Category">
          {categoryIds.map((id) => {
            const isOn = filters.categories.includes(id);
            return (
              <ToggleChip
                key={id}
                label={categoryLabels[id]}
                isSelected={isOn}
                onPress={() => setFilters(withCategory(filters, id, !isOn))}
              />
            );
          })}
        </Section>

        <Section title="Price per night">
          {priceSteps.map((step) => (
            <ToggleChip
              key={step ?? "any"}
              label={priceLabel(step)}
              isSelected={filters.maxPrice === step}
              onPress={() => setFilters(withMaxPrice(filters, step))}
            />
          ))}
        </Section>

        <Section title="Amenities">
          {amenityIds.map((id) => {
            const isOn = filters.amenities.includes(id);
            return (
              <ToggleChip
                key={id}
                label={id === "pets" ? "Pet Friendly" : amenityLabels[id]}
                isSelected={isOn}
                onPress={() => setFilters(withAmenity(filters, id, !isOn))}
              />
            );
          })}
        </Section>
      </ScrollView>

      <View
        className="flex-row items-center justify-between gap-md border-t border-outline-variant px-lg pt-md"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <Button
          title="Clear all"
          variant="ghost"
          disabled={activeCount === 0}
          onPress={() => setFilters(withMaxPrice({ ...filters, amenities: [], categories: [] }, null))}
        />
        <Button
          title={!hasCount ? "Show stays" : resultCount === 1 ? "Show 1 stay" : `Show ${resultCount} stays`}
          className="flex-1"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
