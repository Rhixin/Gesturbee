import ClassRoomService from "@/api/services/classroom-service";
import { useToast } from "@/context/ToastContext";
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
  studentId,
  loadData,
}) => {
  const [classCode, setClassCode] = useState("");
  const [classCodeisFocused, setClassCodeIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const isFormValid = classCode.trim() !== "";

  const handleCancel = () => {
    if (isLoading) return; // Prevent closing during loading

    setClassCode("");
    setModalVisible(false);
  };

  // Apis here
  const fetchJoinClass = async (studentId, classId) => {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    const response = await ClassRoomService.joinClass(classId, studentId);

    if (response.success) {
      showToast(response.message, "success");
    } else {
      showToast(response.message, "error");
    }

    resetForm();
    setIsLoading(false);
    return response.data;
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
              placeholder="Class Code"
              value={classCode}
              onChangeText={setClassCode}
              editable={!isLoading}
              className={`rounded-lg p-3 mb-4 border ${
                classCodeisFocused ? "border-primary" : "border-gray-300"
              } ${isLoading ? "opacity-70" : "opacity-100"}`}
              onFocus={() => setClassCodeIsFocused(true)}
              onBlur={() => setClassCodeIsFocused(false)}
            />
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
                onPress={() => {
                  fetchJoinClass(studentId, classCode);
                }}
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
