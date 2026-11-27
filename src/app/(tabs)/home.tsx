import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { posthog } from "@/config/posthog";
import { AiSearchBar, type SearchInputInstance } from "@/features/stays/ai-search-bar";
import { CategoryChips, type CategoryFilter } from "@/features/stays/category-chips";
import { useEnterAnimation } from "@/features/stays/motion";
import { useSearchState } from "@/features/stays/search-state";
import { StayCard } from "@/features/stays/stay-card";
import { categoryLabels } from "@/features/stays/stays";
import { useStays } from "@/features/stays/use-stays";
import { useThemeColors } from "@/theme";

const FILTER_FADE_IN_MS = 200;
const FILTER_FADE_OUT_MS = 120;
const LIST_REFLOW_MS = 200;

const SKELETON_COUNT = 3;

// Static placeholder the size of StayCard; no shimmer, so reduced motion needs nothing.
function StayCardSkeleton() {
  return <View aria-hidden className="h-70 rounded-xl bg-surface-container-high" />;
}

function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View accessibilityLiveRegion="polite" className="items-center gap-md rounded-xl bg-surface-container px-5 py-xl">
      <AppText variant="headlineSm" className="text-center">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function initialsOf(firstName?: string | null, lastName?: string | null, email?: string): string {
  const letters = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`;
  return (letters || email?.[0] || "?").toUpperCase();
}

export default function Home() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { startSearch } = useSearchState();
  const isReducedMotion = useReducedMotion();
  const searchRef = useRef<SearchInputInstance>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  // Cards only fade in after the first filter change; on first load the whole list enters as one block.
  const [hasFiltered, setHasFiltered] = useState(false);

  const enterHeader = useEnterAnimation(0);
  const enterGreeting = useEnterAnimation(1);
  const enterSearch = useEnterAnimation(2);
  const enterChips = useEnterAnimation(3);
  const enterList = useEnterAnimation(4);

  const { status, stays, retry } = useStays();
  const visibleStays = useMemo(
    () => (category === "all" ? stays : stays.filter((stay) => stay.category === category)),
    [category, stays],
  );

  const firstName = user?.firstName;
  const email = user?.primaryEmailAddress?.emailAddress;
  const initials = initialsOf(firstName, user?.lastName, email);

  function handleSearch() {
    const text = query.trim();
    if (!text) return;
    posthog?.capture("stay_search_submitted", { query_length: text.length, source: "home" });
    startSearch(text);
    router.navigate("/search");
    setQuery("");
  }

  function handleCategory(next: CategoryFilter) {
    posthog?.capture("stay_category_selected", { category: next });
    setHasFiltered(true);
    setCategory(next);
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-md px-5 pb-md"
      contentContainerStyle={{ paddingTop: insets.top + 20 }}
    >
      <Animated.View entering={enterHeader} className="min-h-14 flex-row items-center justify-between">
        <Logo size="md" />
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${firstName ?? "Your"} profile`}
          className="size-14 items-center justify-center rounded-full bg-secondary-fixed"
        >
          <AppText variant="headlineMd" className="text-on-secondary-fixed">
            {initials}
          </AppText>
        </View>
      </Animated.View>

      <Animated.View entering={enterGreeting} className="flex-row items-end justify-between gap-3">
        <View className="gap-1">
          <AppText variant="headlineSm" className="text-on-surface-variant">
            Hey, {firstName ?? "there"}
          </AppText>
          <AppText variant="displayLg" accessibilityRole="header">
            {"Find your\nnext stay"}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search stays"
          onPress={() => searchRef.current?.focus()}
          className="size-14 items-center justify-center rounded-2xl bg-surface-container transition-transform duration-150 active:scale-95"
        >
          <Ionicons name="search-outline" size={22} color={colors.onSurface} />
        </Pressable>
      </Animated.View>

      <Animated.View entering={enterSearch}>
        <AiSearchBar inputRef={searchRef} value={query} onChangeText={setQuery} onSubmit={handleSearch} />
      </Animated.View>

      <Animated.View entering={enterChips}>
        <CategoryChips value={category} onChange={handleCategory} />
      </Animated.View>

      <Animated.View entering={enterList} className="gap-md">
        {status === "loading" &&
          Array.from({ length: SKELETON_COUNT }, (_, i) => <StayCardSkeleton key={i} />)}
        {status === "error" && (
          <Notice title="Couldn't load stays">
            <Button title="Try again" onPress={retry} />
          </Notice>
        )}
        {status === "empty" && <Notice title="No stays yet" />}
        {status === "ready" && visibleStays.length === 0 && category !== "all" && (
          <Notice title={`No ${categoryLabels[category].toLowerCase()} stays`}>
            <Button title="Show all" variant="secondary" onPress={() => handleCategory("all")} />
          </Notice>
        )}
        {status === "ready" &&
          visibleStays.map((stay) => (
            <Animated.View
              key={stay.id}
              entering={hasFiltered ? FadeIn.duration(FILTER_FADE_IN_MS) : undefined}
              exiting={FadeOut.duration(FILTER_FADE_OUT_MS)}
              layout={isReducedMotion ? undefined : LinearTransition.duration(LIST_REFLOW_MS)}
            >
              <StayCard stay={stay} />
            </Animated.View>
          ))}
      </Animated.View>
    </ScrollView>
  );
}
