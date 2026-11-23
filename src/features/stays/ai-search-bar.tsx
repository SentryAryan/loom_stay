import { Ionicons } from "@expo/vector-icons";
import type { ComponentRef, Ref } from "react";
import { Pressable, TextInput, View } from "react-native";

import { useThemeColors } from "@/theme";

export type SearchInputInstance = ComponentRef<typeof TextInput>;

interface AiSearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  /** Lets the screen focus the field from another control. */
  inputRef?: Ref<SearchInputInstance>;
}

const PLACEHOLDER = "quiet pet friendly cabin with hot tub";

// The tinted "describe your stay" pill. Type a sentence and press return or the arrow;
// the arrow stays disabled while the field is empty.
export function AiSearchBar({ value, onChangeText, onSubmit, inputRef }: AiSearchBarProps) {
  const colors = useThemeColors();
  const canSubmit = value.trim().length > 0;

  return (
    <View className="min-h-14 flex-row items-center gap-2.5 rounded-full bg-tertiary-fixed py-2 pl-md pr-2">
      <Ionicons name="sparkles-outline" size={22} color={colors.onTertiaryFixed} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={PLACEHOLDER}
        placeholderTextColor={colors.onTertiaryFixedVariant}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Describe your stay"
        className="type-headline-sm min-h-10 flex-1 p-0 text-on-tertiary-fixed"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search stays"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        onPress={onSubmit}
        className={`size-10 items-center justify-center rounded-full bg-surface-container-lowest transition-[transform,opacity] duration-150 active:scale-95 ${
          canSubmit ? "opacity-100" : "opacity-60"
        }`}
      >
        <Ionicons name="arrow-up" size={20} color={colors.onSurface} style={{ transform: [{ rotate: "45deg" }] }} />
      </Pressable>
    </View>
  );
}
