import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-600">
        Welcome to Loom Stay!!
      </Text>
      <Text className="mt-2 text-sm text-gray-500">
        NativeWind v5 RC + Tailwind CSS v4
      </Text>
    </View>
  );
}