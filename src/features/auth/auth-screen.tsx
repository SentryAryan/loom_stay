import { Link, type Href } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { AuthHeader } from "@/components/auth-header";

interface AuthScreenProps {
  title: string;
  body: ReactNode;
  children: ReactNode;
}

// Shared frame for sign up, verification and sign in: header, title, body, then the form.
export function AuthScreen({ title, body, children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="grow gap-lg px-lg pb-lg pt-md"
        >
          <AuthHeader />
          <View className="gap-sm pt-md">
            <AppText variant="displayLg" accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="bodyLg" className="text-on-surface-variant">
              {body}
            </AppText>
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface AuthSwitchLinkProps {
  prompt: string;
  linkLabel: string;
  href: Href;
}

// "Already have an account? Sign in". Replaces the route so the two forms don't stack.
export function AuthSwitchLink({ prompt, linkLabel, href }: AuthSwitchLinkProps) {
  return (
    <View className="flex-row flex-wrap items-center justify-center pt-sm">
      <AppText variant="bodyMd" className="text-on-surface-variant">
        {prompt}{" "}
      </AppText>
      <Link href={href} replace accessibilityRole="link" className="min-h-11 py-3">
        <AppText variant="headlineSm" className="text-on-surface underline">
          {linkLabel}
        </AppText>
      </Link>
    </View>
  );
}
