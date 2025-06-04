import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import ClassRoomService from "@/api/services/classroom-service";
import { useToast } from "@/context/ToastContext";

const RemoveStudentModal = ({
  modalVisible,
  setModalVisible,
  studentId,
  students,
  loadData,
  classId,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchRemoveStudent = async () => {
    setIsLoading(true);

    const response = await ClassRoomService.removeStudent(studentId, classId);

    if (response.success) {
      showToast(response.message, "success");
    } else {
      showToast(response.message, "error");
    }

    setModalVisible(false);
    loadData();
    setIsLoading(false);
  };

  const handleCancel = () => {
    if (isLoading) return;
    setModalVisible(false);
  };

  const student = students.find((s) => s.id === studentId);

  if (!student) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        if (!isLoading) {
          setModalVisible(false);
        }
      }}
    >
      <View
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        className="flex-1 justify-center items-center px-4"
      >
        <View className="bg-white w-full rounded-2xl p-6">
          <Text className="text-lg font-semibold text-titlegray mb-2">
            Are you sure you want to remove this student?
          </Text>

          <View
            className={`flex-row items-center mb-4 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
              <Ionicons name="person" size={24} color="#999" />
            </View>
            <View>
              <Text className="text-base font-poppins-medium text-gray-800">
                {student.firstName + " " + student.lastName}
              </Text>
            </View>
          </View>

          <Text
            className={`text-lg text-subtitlegray mb-2 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            This action cannot be undone.
          </Text>

          <View className="flex-row justify-end py-2 items-center">
            <TouchableOpacity
              onPress={handleCancel}
              className="px-4 py-2"
              disabled={isLoading}
            >
              <Text
                className={`text-black font-semibold text-base ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={fetchRemoveStudent}
              className="px-4 py-2 flex-row items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#ef4444"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                className={`font-semibold text-base ${
                  isLoading ? "text-gray-400" : "text-red-500"
                }`}
              >
                {isLoading ? "Removing..." : "Remove"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RemoveStudentModal;
