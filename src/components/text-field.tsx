import { Ionicons } from "@expo/vector-icons";
import { useRef, type ComponentRef, type ReactNode } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { useThemeColors } from "@/theme";

import { AppText } from "./app-text";

/** Instance type of a `TextInput`, for refs (call `.focus()` on it). */
export type TextInputHandle = ComponentRef<typeof TextInput>;

export interface TextFieldProps
  extends Omit<TextInputProps, "className" | "style" | "placeholderTextColor"> {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  /** Control pinned to the right, e.g. the show/hide password toggle. */
  trailing?: ReactNode;
  ref?: React.Ref<TextInputHandle>;
}

export function TextField({ label, icon, error, trailing, ref, editable = true, ...inputProps }: TextFieldProps) {
  const colors = useThemeColors();
  const innerRef = useRef<TextInputHandle>(null);
  const hasError = !!error;

  return (
    <View className="gap-xs">
      <Pressable
        onPress={() => innerRef.current?.focus()}
        accessible={false}
        className={`min-h-16 flex-row items-center gap-md rounded-lg border bg-surface-container px-md ${hasError ? "border-error" : "border-transparent"} ${editable ? "" : "opacity-60"}`}
      >
        <Ionicons name={icon} size={24} color={colors.onSurface} />
        <View className="flex-1 py-sm">
          <AppText variant="headlineSm">{label}</AppText>
          <TextInput
            ref={(node) => {
              innerRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            accessibilityLabel={label}
            accessibilityHint={error ?? undefined}
            editable={editable}
            placeholderTextColor={colors.onSurfaceVariant}
            selectionColor={colors.primaryContainer}
            className="type-body-md p-0 text-on-surface"
            {...inputProps}
          />
        </View>
        {trailing}
      </Pressable>
      {hasError ? (
        <AppText variant="bodySm" className="px-xs text-error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
