const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const nativewindConfig = withNativewind(config);

// react-native-css redirects every `import ... from "react-native"` to its own
// shim, which does not export `AssetRegistry` (react-native-css issues #506 and
// #570, RN 0.88). expo-asset reads `AssetRegistry` from "react-native", so
// expo-font (icons, Plus Jakarta Sans) crashed with "Cannot read property
// 'getAssetByID' of undefined". Send only expo-asset to the real React Native.
// Remove this once react-native-css ships a fix.
const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;
const EXPO_ASSET_PATH = /[\\/]node_modules[\\/]expo-asset[\\/]/;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native" && EXPO_ASSET_PATH.test(context.originModulePath)) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return nativewindResolveRequest(context, moduleName, platform);
};

module.exports = nativewindConfig;
