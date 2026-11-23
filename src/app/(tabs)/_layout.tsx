import { NativeTabs } from "expo-router/native-tabs";

import { useThemeColors } from "@/theme";

// The signed-in app: the platform's own tab bar. Tabs are peers, so switching never animates.
export default function TabsLayout() {
  const colors = useThemeColors();
  const contentStyle = { backgroundColor: colors.surface };

  return (
    <NativeTabs
      tintColor={colors.primaryContainer}
      backgroundColor={colors.surfaceContainerLowest}
      indicatorColor={colors.primaryFixed}
      labelVisibilityMode="labeled"
      labelStyle={{ fontFamily: "PlusJakartaSans_600SemiBold" }}
    >
      <NativeTabs.Trigger name="home" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trips" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar" }} md="calendar_month" />
        <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
