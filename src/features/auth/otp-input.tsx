import { useState } from "react";
import { TextInput, View } from "react-native";

import { AppText } from "@/components/app-text";
import { useThemeColors } from "@/theme";

import { CODE_LENGTH } from "./validation";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, index) => index);

// Six digit boxes drawn over one transparent TextInput, so paste and
// one-time-code autofill work and there is only one focus target.
export function OtpInput({ value, onChange, hasError = false, disabled = false }: OtpInputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <View className="h-16">
      <View className="absolute inset-0 flex-row gap-sm" pointerEvents="none">
        {SLOTS.map((index) => {
          const isActive = isFocused && index === activeIndex;
          const border = hasError ? "border-error" : isActive ? "border-primary-container" : "border-transparent";
          return (
            <View
              key={index}
              className={`flex-1 items-center justify-center rounded-lg border-2 bg-surface-container ${border}`}
            >
              <AppText variant="headlineXl" numeric>
                {value[index] ?? ""}
              </AppText>
            </View>
          );
        })}
      </View>
      <TextInput
        accessibilityLabel={`${CODE_LENGTH}-digit verification code`}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, CODE_LENGTH))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        caretHidden
        selectionColor={colors.primaryContainer}
        className="absolute inset-0 opacity-0"
      />
    </View>
  );
}
