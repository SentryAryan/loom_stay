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
  // Only apply the default color when the caller has not passed one. Both
  // classes would otherwise be present and the generated CSS order, not the
  // className order, decides which wins (text-on-scrim lost to text-on-surface).
  const hasColor = /(^|\s)text-(?!left\b|right\b|center\b|justify\b|start\b|end\b)/.test(className ?? "");

  return (
    <Text
      className={`${hasColor ? "" : "text-on-surface"} ${textVariants[variant]} ${className ?? ""}`}
      style={[numeric ? { fontVariant: ["tabular-nums"] } : null, style]}
      {...props}
    />
  );
}
