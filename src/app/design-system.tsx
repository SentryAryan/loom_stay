// Temporary token gallery for comparing against assets/design-systems/v1.
// Delete once real screens use the system.
import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { textVariants, type TextVariant } from "@/theme";

const swatches = [
  "bg-surface",
  "bg-surface-container-lowest",
  "bg-surface-container-low",
  "bg-surface-container",
  "bg-surface-container-high",
  "bg-primary",
  "bg-primary-container",
  "bg-secondary-container",
  "bg-inverse-surface",
  "bg-success-container",
  "bg-warning-container",
  "bg-info-container",
  "bg-error-container",
  "bg-scrim",
  "bg-glass",
  "bg-on-scrim",
] as const;

const radii = ["rounded-sm", "rounded", "rounded-md", "rounded-lg", "rounded-xl", "rounded-full"] as const;
const shadowLevels = ["shadow-level-2", "shadow-level-3", "shadow-level-4"] as const;

export default function DesignSystemPreview() {
  return (
    <ScrollView className="bg-surface" contentContainerClassName="gap-xl p-margin pb-2xl">
      <Stack.Screen options={{ title: "Design system" }} />
      <View className="gap-sm">
        <AppText variant="labelSm" className="text-on-surface-variant">BRAND</AppText>
        <View className="gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
          <Logo size="lg" />
          <Logo size="md" />
          <Logo size="sm" />
          <View className="flex-row items-center gap-lg">
            <Logo variant="symbol" size="lg" />
            <Logo variant="symbol" size="md" />
            <Logo variant="symbol" size="sm" />
          </View>
          <Logo variant="wordmark" size="lg" />
        </View>
        <View className="rounded-lg bg-inverse-surface p-md">
          <Logo size="md" textClassName="text-inverse-on-surface" />
        </View>
      </View>

      <View className="gap-sm">
        <AppText variant="labelSm" className="text-on-surface-variant">COLORS</AppText>
        <View className="flex-row flex-wrap gap-sm">
          {swatches.map((s) => (
            <View key={s} className={`h-14 w-24 justify-end rounded-md border border-outline-variant p-xs ${s}`}>
              <AppText variant="bodySm" className="text-on-surface-variant">{s.slice(3)}</AppText>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-sm">
        <AppText variant="labelSm" className="text-on-surface-variant">TYPE</AppText>
        {(Object.keys(textVariants) as TextVariant[]).map((v) => (
          <AppText key={v} variant={v} numeric>
            {v} $189 night 4.98
          </AppText>
        ))}
      </View>

      <View className="gap-sm">
        <AppText variant="labelSm" className="text-on-surface-variant">RADII</AppText>
        <View className="flex-row flex-wrap gap-sm">
          {radii.map((r) => (
            <View key={r} className={`h-14 w-14 bg-primary-container ${r}`} />
          ))}
        </View>
      </View>

      <View className="gap-sm">
        <AppText variant="labelSm" className="text-on-surface-variant">SHADOWS</AppText>
        <View className="flex-row gap-md">
          {shadowLevels.map((s) => (
            <View key={s} className={`h-16 w-20 rounded-lg bg-surface-container-lowest ${s}`} />
          ))}
        </View>
      </View>

      <View className="gap-sm">
        <AppText variant="labelSm" className="text-on-surface-variant">BUTTONS</AppText>
        <Button title="Show 240+ stays" />
        <Button title="Secondary" variant="secondary" />
        <Button title="Ghost" variant="ghost" />
        <Button title="Disabled" disabled />
        <Button title="Loading" loading />
        <View className="flex-row gap-sm">
          <Button title="Small" size="sm" />
          <Button title="Large" size="lg" />
        </View>
      </View>
    </ScrollView>
  );
}
