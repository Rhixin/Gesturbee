import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

  const handleSaveChanges = () => {
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
    onSave(); // Call parent save function
  };

  const inputFields = [
    {
      label: "Current Password",
      value: currentPassword,
      setValue: setCurrentPassword,
      show: showCurrentPassword,
      toggle: () => setShowCurrentPassword(!showCurrentPassword),
      placeholder: "Enter your current password"
    },
    {
      label: "New Password",
      value: newPassword,
      setValue: setNewPassword,
      show: showNewPassword,
      toggle: () => setShowNewPassword(!showNewPassword),
      placeholder: "Enter new password"
    },
    {
      label: "Confirm Password",
      value: confirmPassword,
      setValue: setConfirmPassword,
      show: showConfirmPassword,
      toggle: () => setShowConfirmPassword(!showConfirmPassword),
      placeholder: "Re-enter new password"
    }
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="bg-primary p-5"
        >
          <Text className="text-2xl font-bold text-center mb-8">Change Your Password</Text>

          {error ? (
            <Text className="text-red-500 text-center mb-4 font-medium">{error}</Text>
          ) : null}

          {inputFields.map(({ label, value, setValue, show, toggle, placeholder }, index) => (
            <View className="mb-5" key={index}>
              <Text className="mb-2 text-base font-semibold">{label}</Text>
              <View className={`bg-white rounded-lg flex-row items-center py-2 border ${error && !value ? 'border-red-500' : 'border-gray-200'}`}>
                <TextInput
                  className="flex-1 px-6 h-12 text-base"
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!show}
                  value={value}
                  onChangeText={setValue}
                />
                <Pressable className="px-4 justify-center" onPress={toggle}>
                  <Ionicons name={show ? "eye-off" : "eye"} size={22} color="#6B7280" />
                </Pressable>
              </View>
            </View>
          ))}

          <TouchableOpacity
            className="bg-secondary py-4 rounded-lg mt-4 "
            onPress={handleSaveChanges}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            <Text className="text-center font-bold text-lg text-black">Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
