import { Text, type TextProps } from "react-native";

import { textVariants, type TextVariant } from "@/theme";

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  /** Tabular figures for prices, dates and counters so digits don't shift. */
  numeric?: boolean;
  className?: string;
}

export function AppText({
  variant = "bodyMd",
  numeric = false,
  className,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      className={`text-on-surface ${textVariants[variant]} ${className ?? ""}`}
      style={[numeric ? { fontVariant: ["tabular-nums"] } : null, style]}
      {...props}
    />
  );
}
