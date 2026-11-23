import { ScrollView } from "react-native";

import {
  withAmenity,
  withCategory,
  withMaxPrice,
  type ParsedQuery,
} from "./search-stays";
import { amenityLabels, categoryLabels, type AmenityId, type StayCategory } from "./stays";
import { ToggleChip } from "./toggle-chip";

const SUGGESTED_PRICE = 300;
const suggestedCategories: readonly StayCategory[] = ["cabin"];
const suggestedAmenities: readonly AmenityId[] = ["pets", "pool", "hot-tub", "fireplace"];

interface Chip {
  key: string;
  label: string;
  isActive: boolean;
  toggle: () => ParsedQuery;
}

function buildChips(parsed: ParsedQuery): Chip[] {
  const categoryIds = [...new Set([...parsed.categories, ...suggestedCategories])];
  const amenityIds = [...new Set([...parsed.amenities, ...suggestedAmenities])];
  const hasPrice = parsed.maxPrice !== null;

  const priceChip: Chip = {
    key: "price",
    label: `Under $${parsed.maxPrice ?? SUGGESTED_PRICE}`,
    isActive: hasPrice,
    toggle: () => withMaxPrice(parsed, hasPrice ? null : SUGGESTED_PRICE),
  };
  const categoryChips = categoryIds.map<Chip>((id) => {
    const isActive = parsed.categories.includes(id);
    return {
      key: `category-${id}`,
      label: categoryLabels[id],
      isActive,
      toggle: () => withCategory(parsed, id, !isActive),
    };
  });
  const amenityChips = amenityIds.map<Chip>((id) => {
    const isActive = parsed.amenities.includes(id);
    return {
      key: `amenity-${id}`,
      label: id === "pets" ? "Pet Friendly" : amenityLabels[id],
      isActive,
      toggle: () => withAmenity(parsed, id, !isActive),
    };
  });

  // What the guest asked for first, then the suggestions they can add.
  const all = [...categoryChips, priceChip, ...amenityChips];
  return [...all.filter((chip) => chip.isActive), ...all.filter((chip) => !chip.isActive)];
}

interface FilterChipsProps {
  parsed: ParsedQuery;
  onChange: (parsed: ParsedQuery) => void;
}

// Filters taken from the sentence show selected; the rest are suggestions. Tap to flip one.
export function FilterChips({ parsed, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-sm px-md"
    >
      {buildChips(parsed).map((chip) => (
        <ToggleChip
          key={chip.key}
          label={chip.label}
          isSelected={chip.isActive}
          accessibilityLabel={chip.isActive ? `${chip.label}, on. Tap to remove` : `${chip.label}. Tap to add`}
          onPress={() => onChange(chip.toggle())}
        />
      ))}
    </ScrollView>
  );
}
