import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type PressableProps } from "react-native";

import { useThemeColors } from "@/theme";

import { AppText } from "./app-text";

const variants = {
  primary: {
    container: "bg-primary-container",
    text: "text-on-primary-container",
  },
  secondary: {
    container: "bg-surface-container-lowest border border-outline",
    text: "text-on-surface",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-on-surface-variant",
  },
} as const;

const sizes = {
  sm: "min-h-9 px-md",
  md: "min-h-11 px-lg",
  lg: "min-h-14 px-xl",
} as const;

export interface ButtonProps
  extends Omit<PressableProps, "children" | "className" | "style"> {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  className?: string;
  /** Icon or logo before the title. */
  leading?: ReactNode;
  /** Icon pinned to the right edge (e.g. an arrow); the title stays centered in the button. */
  trailing?: ReactNode;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  leading,
  trailing,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const v = variants[variant];
  const isDisabled = !!(disabled || loading);
  const spinner = variant === "primary" ? colors.onPrimaryContainer : colors.onSurface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-sm rounded-full active:scale-95 ${v.container} ${sizes[size]} ${isDisabled ? "opacity-40" : ""} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinner} />
      ) : (
        <>
          {leading}
          <AppText variant="headlineSm" className={v.text}>
            {title}
          </AppText>
          {trailing ? (
            <View className="absolute inset-y-0 right-5 justify-center">{trailing}</View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
