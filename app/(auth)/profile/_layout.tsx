import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Static Content */}
      <View
        style={{
          height: 60,
          backgroundColor: "#4CAF50",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          STATIC ELEMENT
        </Text>
      </View>

      {/* Dynamic Content */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="changeinformation/index" />
        <Stack.Screen name="changepassword/index" />
      </Stack>
    </View>
  );
}
