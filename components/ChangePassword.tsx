import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function ChangePassword({ onClose = () => {}, onSave = () => {} } = {}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSaveChanges = useCallback(() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError('');
    onSave();
  }, [currentPassword, newPassword, confirmPassword, onSave]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-primary p-5 justify-center">
          <Text className="text-2xl font-bold text-center mb-8">Change your password</Text>

          {error && (
            <Text className="text-red-500 text-center mb-4 font-medium">{error}</Text>
          )}

          {/* Current Password */}
          <View className="mb-6">
            <Text className="mb-2 text-base font-semibold">Current Password</Text>
            <View className={`bg-white rounded-lg flex-row items-center h-12 py-2 border ${error && !currentPassword ? 'border-red-500' : 'border-gray-200'}`}>
              <TextInput
                className="flex-1 px-6 h-12 text-base"
                placeholder="Enter your current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <Pressable className="px-4 justify-center" onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Ionicons name={showCurrentPassword ? "eye-off" : "eye"} size={22} color="#6B7280" />
              </Pressable>
            </View>
            {!currentPassword && error && (
              <Text className="text-red-500 text-sm mt-1">Current password is required</Text>
            )}
          </View>

          {/* New Password */}
          <View className="mb-6">
            <Text className="mb-2 text-base font-semibold">New Password</Text>
            <View className={`bg-white rounded-lg flex-row items-center h-12 py-2 border ${error && !newPassword ? 'border-red-500' : 'border-gray-200'}`}>
              <TextInput
                className="flex-1 px-6 h-12 text-base"
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Pressable className="px-4 justify-center" onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={22} color="#6B7280" />
              </Pressable>
            </View>
            {!newPassword && error && (
              <Text className="text-red-500 text-sm mt-1">New password is required</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="mb-2 text-base font-semibold">Confirm Password</Text>
            <View className={`bg-white rounded-lg flex-row items-center h-12 py-2 border ${error && !confirmPassword ? 'border-red-500' : 'border-gray-200'}`}>
              <TextInput
                className="flex-1 px-6 h-12 text-base"
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable className="px-4 justify-center" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#6B7280" />
              </Pressable>
            </View>
            {!confirmPassword && error && (
              <Text className="text-red-500 text-sm mt-1">Confirmation is required</Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`bg-secondary py-4 rounded-lg mt-6 ${(!currentPassword || !newPassword || !confirmPassword) ? 'opacity-50' : ''}`}
            onPress={handleSaveChanges}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            accessibilityLabel="Save password changes"
          >
            <Text className="text-center font-bold text-lg text-black">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
