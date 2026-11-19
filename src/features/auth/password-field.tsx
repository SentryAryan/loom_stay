import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";

import { TextField, type TextFieldProps } from "@/components/text-field";
import { useThemeColors } from "@/theme";

type PasswordFieldProps = Omit<TextFieldProps, "icon" | "label" | "trailing" | "secureTextEntry"> & {
  label?: string;
};

// Password input with a show/hide toggle.
export function PasswordField({ label = "Password", ...props }: PasswordFieldProps) {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      label={label}
      icon="lock-closed-outline"
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      autoCorrect={false}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          hitSlop={8}
          onPress={() => setIsVisible((visible) => !visible)}
          className="size-11 items-center justify-center"
        >
          <Ionicons name={isVisible ? "eye-outline" : "eye-off-outline"} size={22} color={colors.onSurface} />
        </Pressable>
      }
    />
  );
}
