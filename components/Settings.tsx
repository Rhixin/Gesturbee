import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
} from "react-native";

export default function SettingsScreen({ onClose = () => {} }) {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
          <Text className="text-2xl font-bold text-center mb-8">Settings</Text>

          {/* Notifications Settings */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold">Notifications</Text>
            <View className="flex-row justify-between items-center bg-white rounded-lg h-12 py-2 border border-gray-200">
              <Text className="flex-1 text-base px-6">
                Enable Notifications
              </Text>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                thumbColor={isNotificationsEnabled ? "#10B981" : "#6B7280"}
              />
            </View>
          </View>

          {/* Save Settings Button */}
          <TouchableOpacity
            className="bg-secondary py-4 rounded-lg mt-6"
            onPress={handleSaveChanges}
            accessibilityLabel="Save Settings"
          >
            <Text className="text-center font-bold text-lg text-black">
              Save Settings
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
