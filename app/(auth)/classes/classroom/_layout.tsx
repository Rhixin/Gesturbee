import React from "react";
import { Stack } from "expo-router";
export default function ClassroomLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[classId]" />
      <Stack.Screen name="exercise/[exerciseId]" />
    </Stack>
  );
}
