import { Appearance, Platform } from "react-native";

// react-native-web's Appearance has no setColorScheme, which react-native-css's
// colorScheme.set() calls on web. The browser already follows prefers-color-scheme,
// so a no-op keeps startup from crashing.
if (Platform.OS === "web" && typeof Appearance.setColorScheme !== "function") {
  Appearance.setColorScheme = () => {};
}
