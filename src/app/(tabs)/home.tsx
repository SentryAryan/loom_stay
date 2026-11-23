import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Logo } from "@/components/logo";
import { AiSearchBar, type SearchInputInstance } from "@/features/stays/ai-search-bar";
import { CategoryChips, type CategoryFilter } from "@/features/stays/category-chips";
import { useEnterAnimation } from "@/features/stays/motion";
import { useSearchState } from "@/features/stays/search-state";
import { StayCard } from "@/features/stays/stay-card";
import { stays } from "@/features/stays/stays";
import { useThemeColors } from "@/theme";

const FILTER_FADE_IN_MS = 200;
const FILTER_FADE_OUT_MS = 120;
const LIST_REFLOW_MS = 200;

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

  const visibleStays = useMemo(
    () => (category === "all" ? stays : stays.filter((stay) => stay.category === category)),
    [category],
  );

  const firstName = user?.firstName;
  const email = user?.primaryEmailAddress?.emailAddress;
  const initials = initialsOf(firstName, user?.lastName, email);

  function handleSearch() {
    const text = query.trim();
    if (!text) return;
    startSearch(text);
    router.navigate("/search");
    setQuery("");
  }

  function handleCategory(next: CategoryFilter) {
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
        <AiSearchBar inputRef={searchRef}value={query} onChangeText={setQuery} onSubmit={handleSearch} />
      </Animated.View>

      <Animated.View entering={enterChips}>
        <CategoryChips value={category} onChange={handleCategory} />
      </Animated.View>

      <Animated.View entering={enterList} className="gap-md">
        {visibleStays.map((stay) => (
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
