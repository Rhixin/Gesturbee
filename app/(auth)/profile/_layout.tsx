import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="changeinformation/index" />
      <Stack.Screen name="changepassword/index" />
    </Stack>
  );
}
