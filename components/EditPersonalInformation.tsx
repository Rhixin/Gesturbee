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

export default function EditProfile({ onClose = () => {}, onSave = () => {} } = {}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [firstName, email, currentPassword]);

  const handleSaveChanges = useCallback(() => {
    if (!firstName || !email || !currentPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError('');
    onSave();
  }, [firstName, email, currentPassword, onSave]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-primary p-5 justify-center">
          <Text className="text-2xl font-bold text-center mb-8">Edit Personal Information</Text>

          {error ? (
            <Text className="text-red-500 text-center mb-4 font-medium">{error}</Text>
          ) : null}

          {/* First Name */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">First name</Text>
            <TextInput
              className="bg-white rounded-lg px-6 h-12 text-base border border-gray-200"
              placeholder="Enter your name"
              value={firstName}
              onChangeText={setFirstName}
            />
            {!firstName && error && (
              <Text className="text-red-500 text-sm mt-1">First name is required</Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">Email</Text>
            <TextInput
              className="bg-white rounded-lg px-6 h-12 text-base border border-gray-200"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {!email && error && (
              <Text className="text-red-500 text-sm mt-1">Email is required</Text>
            )}
          </View>

          {/* Current Password */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">Current password</Text>
            <View className={`bg-white rounded-lg flex-row items-center h-12 py-2 border ${error && !currentPassword ? 'border-red-500' : 'border-gray-200'}`}>
              <TextInput
                className="flex-1 px-6 h-12 text-base"
                placeholder="Type in current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <Pressable className="px-4 justify-center" onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#6B7280" />
              </Pressable>
            </View>
            {!currentPassword && error && (
              <Text className="text-red-500 text-sm mt-1">Password is required</Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-secondary py-4 rounded-lg mt-4"
            onPress={handleSaveChanges}
            disabled={!firstName || !email || !currentPassword}
          >
            <Text className="text-center font-bold text-lg text-black">Save changes</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
