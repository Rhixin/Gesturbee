import React, { useState, useRef, useMemo } from "react";
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
import { useToast } from "../context/ToastContext";

const AddStudentModal = ({
  modalVisible,
  setModalVisible,
  onAddStudents,
  allUsers,
  studentsAlreadyAdded,
  loadData,
  classId,
}) => {
  const { showToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [inviteLink, setInviteLink] = useState("ifjSg25");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [validUsersToAdd, setValidUsersToAdd] = useState(allUsers);

  // Apis here
  const fetchAddStudent = async (studentId, classId) => {
    setIsLoading(true);

    const response = await ClassRoomService.addStudent(studentId, classId);

    if (response.success) {
      showToast("Successfully Added a Student", "success");
    } else {
      showToast(response.error, "error");
    }

    resetForm();
    setIsLoading(false);
    return response.data;
  };

  const resetForm = () => {
    setSelectedStudents([]);
    setSelectedStudent(-1);
    setSearchText("");
    setModalVisible(false);
    loadData();
  };

  // Filter students based on search text
  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) {
      return validUsersToAdd;
    }

    const searchLower = searchText.toLowerCase().trim();

    return validUsersToAdd.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [validUsersToAdd, searchText]);

  const copyToClipboard = async () => {
    if (isLoading) return;

    await Clipboard.setStringAsync(inviteLink);
    Toast.show({
      type: "success",
      text1: "Copied to Clipboard",
    });
  };

  const toggleStudentSelection = (studentId) => {
    if (isLoading) return; // Prevent selection changes during loading

    if (selectedStudents.includes(studentId)) {
      setSelectedStudents([]);
      setSelectedStudent(-1);
    } else {
      setSelectedStudents([studentId]);
      setSelectedStudent(studentId);
    }
  };

  const handleInvite = () => {
    const selected = allUsers.filter((s) => selectedStudents.includes(s.id));
    onAddStudents(selected);
    setSelectedStudents([]);
    setSearchText("");
    setModalVisible(false);
  };

  const handleCancel = () => {
    if (isLoading) return; // Prevent closing during loading

    setSelectedStudents([]);
    setSelectedStudent(-1);
    setSearchText("");
    setModalVisible(false);
  };

  const handleAddStudent = async () => {
    if (selectedStudent === -1 || isLoading) return;

    await fetchAddStudent(selectedStudent, classId);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        if (!isLoading) {
          handleCancel();
        }
      }}
    >
      <View
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        className="flex-1 justify-center items-center px-4"
      >
        <View className="bg-white w-full rounded-2xl p-6">
          <Text className="text-3xl font-semibold text-titlegray mb-2">
            Invite students
          </Text>
          <Text className="text-lg text-subtitlegray mb-2">
            Invite students to join this class!{" "}
          </Text>

          {/* Invite Link Section */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Invite link</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg p-2">
              <Text className="flex-1">{inviteLink}</Text>
              <TouchableOpacity onPress={copyToClipboard} disabled={isLoading}>
                <Ionicons
                  name="copy-outline"
                  color={isLoading ? "#ccc" : "#000"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          <View className="mb-2 relative">
            <TextInput
              placeholder="Type a name or email"
              value={searchText}
              onChangeText={setSearchText}
              editable={!isLoading}
              className={`border border-gray-300 rounded-lg p-2 mb-4 ${
                isLoading ? "opacity-50" : ""
              }`}
            />
            {searchText.length > 0 && !isLoading && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                className="absolute right-3 top-2"
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Students List */}
          <ScrollView className="max-h-64">
            {filteredStudents.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text className="text-gray-500 mt-2 text-center">
                  {searchText.trim()
                    ? `No students found matching "${searchText}"`
                    : "No students available to add"}
                </Text>
              </View>
            ) : (
              filteredStudents.map((user) => (
                <Pressable
                  key={user.id}
                  onPress={() => toggleStudentSelection(user.id)}
                  disabled={isLoading}
                  className={`flex-row items-center py-3 border-b border-gray-100 px-2 rounded-lg px-6 ${
                    selectedStudents.includes(user.id) ? "bg-secondary" : ""
                  } ${isLoading ? "opacity-50" : ""}`}
                >
                  <View className="flex-1">
                    <Text
                      className={`font-medium ${
                        selectedStudents.includes(user.id)
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {user.firstName + " " + user.lastName}
                    </Text>
                  </View>
                  {selectedStudents.includes(user.id) && (
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>

          {/* Show search results count */}
          {searchText.trim() && (
            <Text className="text-sm text-gray-500 mt-2">
              {filteredStudents.length} student
              {filteredStudents.length !== 1 ? "s" : ""} found
            </Text>
          )}

          {/* Action Buttons */}
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
              onPress={handleAddStudent}
              className="px-4 py-2 flex-row items-center"
              disabled={selectedStudents.length === 0 || isLoading}
            >
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#00BFAF"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                className={`font-semibold text-base ${
                  selectedStudents.length > 0 && !isLoading
                    ? "text-primary"
                    : "text-gray-400"
                }`}
              >
                {isLoading ? "Adding..." : "Add"}{" "}
                {selectedStudents.length > 0 && !isLoading
                  ? `(${selectedStudents.length})`
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddStudentModal;
