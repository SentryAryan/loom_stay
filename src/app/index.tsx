import { Ionicons } from "@expo/vector-icons";
import { BlurTargetView } from "expo-blur";
import { router } from "expo-router";
import { useRef, useState, type ComponentRef } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { GoogleLogo } from "@/components/google-logo";
import { Logo } from "@/components/logo";
import { SigningInOverlay } from "@/features/auth/signing-in-overlay";
import { useGoogleSignIn } from "@/features/auth/use-google-sign-in";
import { HeroPager } from "@/features/onboarding/hero-pager";
import { LocationChip } from "@/features/onboarding/location-chip";
import { ProgressSegments } from "@/features/onboarding/progress-segments";
import { SheetBackdrop } from "@/features/onboarding/sheet-backdrop";
import { onboardingSlides, type OnboardingSlide } from "@/features/onboarding/slides";
import { useThemeColors } from "@/theme";

const LAST_INDEX = onboardingSlides.length - 1;

export default function Onboarding() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);
  const [index, setIndex] = useState(0);
  const { signInWithGoogle, isFinishing } = useGoogleSignIn();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Signs in (or up) with Google right here; the route guards move a signed-in guest to /home.
  const handleGoogle = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    const message = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (message) setGoogleError(message);
  };

  const slide = onboardingSlides[index];
  const isLast = index === LAST_INDEX;

  const handlePrimary = () => {
    if (isLast) {
      router.push("/sign-up");
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <View className="flex-1 bg-surface-container">
      {/* Android only blurs what is inside the BlurTargetView, so the photos live in it. */}
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
        <HeroPager slides={onboardingSlides} listRef={listRef} onIndexChange={setIndex} />
      </BlurTargetView>

      {/* Brand and Skip, over the photo. */}
      <View className="absolute inset-x-0 top-0" style={{ paddingTop: insets.top }} pointerEvents="box-none">
        <View className="flex-row items-center justify-between px-lg pt-sm" pointerEvents="box-none">
          <View className="rounded-full bg-glass px-md py-xs">
            <Logo size="sm" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            onPress={() => router.push("/sign-up")}
            className="min-h-11 justify-center rounded-full bg-glass px-md active:scale-95"
          >
            <AppText variant="headlineSm">Skip</AppText>
          </Pressable>
        </View>
      </View>

      {/* Location chip and bottom sheet. */}
      <View className="absolute inset-x-0 bottom-0" pointerEvents="box-none">
        <LocationChip key={`place-${slide.id}`} place={slide.place} blurTarget={blurTargetRef} />

        <View className="relative">
          <SheetBackdrop />

          <View className="gap-md px-lg pt-xl" style={{ paddingBottom: insets.bottom + 16 }}>
            <ProgressSegments total={onboardingSlides.length} current={index} />

            <Animated.View key={`copy-${slide.id}`} entering={FadeIn.duration(250)} className="gap-sm">
              <AppText variant="displayLgMobile" accessibilityRole="header">
                {slide.title}
              </AppText>
              <AppText variant="bodyLg" className="text-on-surface-variant">
                {slide.body}
              </AppText>
            </Animated.View>

            <View className="gap-sm pt-sm">
              <Button
                title={isLast ? "Get started" : "Next"}
                size="lg"
                onPress={handlePrimary}
                trailing={<Ionicons name="arrow-forward" size={20} color={colors.onPrimaryContainer} />}
              />
              {googleError ? (
                <AppText variant="bodyMd" className="text-error" accessibilityLiveRegion="polite">
                  {googleError}
                </AppText>
              ) : null}
              <Button
                title="Continue with Google"
                variant="secondary"
                size="lg"
                loading={isGoogleLoading}
                leading={<GoogleLogo size={20} />}
                onPress={handleGoogle}
              />
            </View>
          </View>
        </View>
      </View>

      {isFinishing ? <SigningInOverlay /> : null}
    </View>
  );
}
