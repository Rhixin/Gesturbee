import ClassRoomService from "@/api/services/classroom-service";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

const JoinClassModal = ({
  modalVisible,
  setModalVisible,
  loadData,
}) => {
  const [classCode, setClassCode] = useState("");
  const [classCodeisFocused, setClassCodeIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const validateClassCode = (code) => {
    // Check if code matches the format GB-XXXXXXX (7 characters after GB-)
    const classCodeRegex = /^GB-[A-Z0-9]{7}$/;
    return classCodeRegex.test(code);
  };

  const isFormValid = classCode.trim() !== "" && validateClassCode(classCode.trim());

  const handleCancel = () => {
    if (isLoading) return; // Prevent closing during loading

    setClassCode("");
    setModalVisible(false);
  };

  // Apis here
  const fetchJoinClass = async () => {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    try {
      // First get classId from classCode
      const classResponse = await ClassRoomService.getClassByCode(classCode);
      if (!classResponse.success) {
        showToast("Invalid class code. Please check the code and try again.", "error");
        setIsLoading(false);
        return;
      }

      const classId = classResponse.data.id;
      
      // Now use your endpoint with both classId and classCode
      const response = await ClassRoomService.joinClass(classCode, currentUser.id, classId);

      if (response.success) {
        showToast(response.message, "success");
        resetForm();
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Error joining class. Please try again.", "error");
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setClassCode("");
    setModalVisible(false);
    loadData();
  };
  // If loading, show the loading state
  if (isLoading) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Prevent closing while loading
        }}
      >
        <View
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          className="flex-1 justify-center items-center bg-black/50 px-4"
        >
          <View
            className="bg-white w-full rounded-2xl p-6 items-center justify-center"
            style={{ minHeight: 200 }}
          >
            <ActivityIndicator size="large" color="#00BFAF" />
            <Text className="mt-4 text-gray-600 font-poppins-medium text-center">
              Joining class...
            </Text>
            <Text className="mt-2 text-gray-500 text-sm text-center">
              Please wait while we add you to the class
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCancel}
    >
      <View
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        className="flex-1 justify-center items-center bg-black/50 px-4"
      >
        <View className="bg-white w-full rounded-2xl">
          <Text
            style={{ marginLeft: 24 }}
            className="text-3xl font-semibold text-titlegray mb-2 mt-6"
          >
            Join Class
          </Text>
          <Text
            style={{ marginLeft: 24 }}
            className="text-lg text-subtitlegray mb-6"
          >
            Ask your teacher for the class code and{"\n"}enter it here.{" "}
          </Text>
          <View className="bg-white w-full rounded-2xl p-6">
            <TextInput
              placeholder="Class Code (e.g., GB-ABC123D)"
              value={classCode}
              onChangeText={(text) => setClassCode(text.toUpperCase())}
              editable={!isLoading}
              autoCapitalize="characters"
              maxLength={10}
              className={`rounded-lg p-3 mb-1 border ${
                classCodeisFocused ? "border-primary" : 
                (classCode.trim() && !validateClassCode(classCode.trim())) ? "border-red-500" :
                "border-gray-300"
              } ${isLoading ? "opacity-70" : "opacity-100"}`}
              onFocus={() => setClassCodeIsFocused(true)}
              onBlur={() => setClassCodeIsFocused(false)}
            />
            {classCode.trim() && !validateClassCode(classCode.trim()) && (
              <Text className="text-red-500 text-sm mb-3 px-1">
                Please enter a valid class code (format: GB-XXXXXXX)
              </Text>
            )}
            {(!classCode.trim() || validateClassCode(classCode.trim())) && (
              <View className="mb-3" />
            )}
            <View className="flex-row justify-end px-5 py-2 items-center">
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#00BFAF"
                  style={{ marginRight: 10 }}
                />
              )}
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isLoading}
                style={{ marginRight: 10 }}
              >
                <Text
                  className={`text-black font-semibold text-base ${
                    isLoading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!isFormValid || isLoading}
                onPress={fetchJoinClass}
              >
                <Text
                  className={`font-semibold text-base ${
                    isFormValid && !isLoading ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {isLoading ? "Joining..." : "Join"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default JoinClassModal;
