import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/app-text";
import type { TextInputHandle } from "@/components/text-field";
import { useThemeColors } from "@/theme";

import { CODE_LENGTH } from "./validation";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, index) => index);
const FOCUS_DELAY_MS = 300;

// opacity 0 makes iOS skip hit-testing, so the field stays barely visible and
// its text transparent: taps reach the native text field directly.
const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.02, color: "transparent" },
});

// Six digit boxes drawn over one transparent TextInput, so paste and
// one-time-code autofill work and there is only one focus target.
export function OtpInput({ value, onChange, hasError = false, disabled = false }: OtpInputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInputHandle>(null);
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  // Focus after the screen transition ends, or iOS ignores the request.
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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
        ref={inputRef}
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
        style={styles.overlay}
      />
    </View>
  );
}
