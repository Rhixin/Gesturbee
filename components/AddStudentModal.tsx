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
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const AddStudentModal = ({ modalVisible, setModalVisible, onAddStudents }) => {
  const [searchText, setSearchText] = useState("");
  const [inviteLink, setInviteLink] = useState("ifjSg25");

  const students = [
    {
      id: 1,
      name: "Summer Ishi Rodrigo",
      email: "summerrodrigo07@gmail.com",
    },
    {
      id: 2,
      name: "Fria Mae Camello",
      email: "cool@gmail.com",
    },
    {
      id: 3,
      name: "Joshua Cool",
      email: "kk@gmail.com",
    },
    {
      id: 4,
      name: "zz@nodost.landbank.com",
      email: "zz@nodost.landbank.com",
    },
  ];

  const [selectedStudents, setSelectedStudents] = useState([]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Toast.show({
      type: "success",
      text1: "Copied to Clipboard",
    });
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([studentId]);
    }
  };

  const handleInvite = () => {
    const selected = students.filter((s) => selectedStudents.includes(s.id));
    onAddStudents(selected);
    setSelectedStudents([]);
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
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
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons name="copy-outline" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          <View className="mb-2">
            <TextInput
              placeholder="Type a name or email"
              value={searchText}
              onChangeText={setSearchText}
              className="border border-gray-300 rounded-lg p-3"
            />
          </View>

          {/* Students List */}
          <ScrollView className="max-h-64">
            {students.map((student) => (
              <Pressable
                key={student.id}
                onPress={() => toggleStudentSelection(student.id)}
                className={`flex-row items-center py-3 border-b border-gray-100 px-2 rounded-lg px-6 ${
                  selectedStudents.includes(student.id) ? "bg-secondary" : ""
                }`}
              >
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      selectedStudents.includes(student.id)
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {student.name}
                  </Text>
                  <Text
                    className={`text-sm ${
                      selectedStudents.includes(student.id)
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {student.email}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row justify-end py-2">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="px-4 py-2"
            >
              <Text className="text-black font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleInvite} className="px-4 py-2">
              <Text className="text-primary font-semibold text-base">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddStudentModal;
