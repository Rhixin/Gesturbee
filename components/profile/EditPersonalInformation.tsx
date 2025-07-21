import AuthService from "@/api/services/auth-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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

export default function EditProfile({
  onClose = () => {},
  onSave = () => {},
} = {}) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFirstName(currentUser.firstName);
    setLastName(currentUser.lastName);
    setContactNumber(currentUser.contactNumber);
    setGender(currentUser.gender);
    setBirthDate(currentUser.birthDate);
  }, []);

  useEffect(() => {
    setError("");
  }, [firstName, lastName, contactNumber, gender, birthDate]);

  const handleSaveChanges = useCallback(async () => {
    if (!firstName || !lastName || !contactNumber || !gender || !birthDate) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    const body = {
      userProfileId: currentUser.id,
      firstName,
      lastName,
      contactNumber,
      gender,
      birthDate,
    };

    try {
      const response = await AuthService.changeProfile(body);
      if (response.success) {
        showToast("Successfully changed Profile Information", "success");
        onSave();
      } else {
        showToast("Failed to change Profile Information", "error");
      }
    } catch (err) {
      showToast("An error occurred while saving.", "error");
    } finally {
      setIsLoading(false);
    }

    setError("");
  }, [firstName, lastName, contactNumber, gender, birthDate, onSave]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-primary p-5 justify-center">
          <Text className="text-2xl font-bold text-center mb-8">
            Edit Personal Information
          </Text>

          {error ? (
            <Text className="text-red-500 text-center mb-4 font-medium">
              {error}
            </Text>
          ) : null}

          {/* First Name */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">First name</Text>
            <TextInput
              className="bg-white rounded-lg px-6 h-12 text-base border border-gray-200"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
            {!firstName && error && (
              <Text className="text-red-500 text-sm mt-1">
                First name is required
              </Text>
            )}
          </View>

          {/* Last Name */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">Last name</Text>
            <TextInput
              className="bg-white rounded-lg px-6 h-12 text-base border border-gray-200"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
            {!lastName && error && (
              <Text className="text-red-500 text-sm mt-1">
                Last name is required
              </Text>
            )}
          </View>

          {/* Contact Number */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">Contact number</Text>
            <TextInput
              className="bg-white rounded-lg px-6 h-12 text-base border border-gray-200"
              placeholder="Enter your contact number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
            {!contactNumber && error && (
              <Text className="text-red-500 text-sm mt-1">
                Contact number is required
              </Text>
            )}
          </View>

          {/* Gender */}
          <View className="mb-5">
            <Text className="mb-2 text-base font-semibold">Gender</Text>
            <TextInput
              className="bg-white rounded-lg px-6 h-12 text-base border border-gray-200"
              placeholder="Enter your gender"
              value={gender}
              onChangeText={setGender}
            />
            {!gender && error && (
              <Text className="text-red-500 text-sm mt-1">
                Gender is required
              </Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg mt-4 ${
              !firstName || !lastName || !contactNumber || !gender || isLoading
                ? "bg-tertiary opacity-50 cursor-not-allowed"
                : "bg-secondary hover:bg-secondary-dark"
            }`}
            onPress={handleSaveChanges}
            disabled={
              isLoading || !firstName || !lastName || !contactNumber || !gender
            }
          >
            <Text className="text-center font-bold text-lg text-black">
              {isLoading ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
