import { router, type Href } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";

interface AuthPlaceholderProps {
  title: string;
  body: string;
  switchTitle: string;
  switchHref: Href;
}

// Placeholder until Clerk is wired: no form, just the route and the way through.
export function AuthPlaceholder({ title, body, switchTitle, switchHref }: AuthPlaceholderProps) {
  return (
    <View className="flex-1 justify-between bg-surface px-lg pb-xl pt-md">
      <View className="gap-lg">
        <Logo size="md" />
        <View className="gap-sm">
          <AppText variant="displayLgMobile" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="bodyLg" className="text-on-surface-variant">
            {body}
          </AppText>
        </View>
      </View>

      <View className="gap-sm">
        <Button title={switchTitle} variant="ghost" size="lg" onPress={() => router.replace(switchHref)} />
        <Button title="Browse as a guest" variant="secondary" size="lg" onPress={() => router.replace("/home")} />
      </View>
    </View>
  );
}
