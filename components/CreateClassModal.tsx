import ClassRoomService from "@/api/services/classroom-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { router, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

const CreateClassModal = ({ modalVisible, setModalVisible }) => {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [classNameFocused, setClassNameFocused] = useState(false);
  const [sectionFocused, setSectionFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();
  const navigate = (path) => {
    router.push(path);
  };

  const { currentUser } = useAuth();

  const isFormValid = className.trim() !== "" && section.trim() !== "";

  const handleCreateClass = async () => {
    const userId = currentUser.id;

    setIsLoading(true);
    const response = await ClassRoomService.createClassroom(
      userId,
      className,
      description
    );
    setIsLoading(false);

    if (response.success) {
      showToast("Created a Classroom Successfully!", "success");
      navigate("/(auth)/classes");
    } else {
      showToast(response.error, "error");
    }

    resetForm();
  };

  const resetForm = () => {
    setClassName("");
    setSection("");
    setDescription("");
    setModalVisible(false);
  };

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
          className="flex-1 justify-center items-center px-4"
        >
          <View
            className="bg-white w-full rounded-2xl p-6 items-center justify-center"
            style={{ minHeight: 200 }}
          >
            <ActivityIndicator size="large" color="#FBBC05" />
            <Text className="mt-4 text-secondary font-poppins-medium">
              Creating class...
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
      onRequestClose={() => setModalVisible(false)}
    >
      <View
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        className="flex-1 justify-center items-center px-4"
      >
        <View className="bg-white w-full rounded-2xl p-6">
          <Text className="text-3xl font-semibold text-titlegray mb-2">
            Create Class
          </Text>
          <Text className="text-lg text-subtitlegray">
            Create a class to get started!{" "}
          </Text>

          <TextInput
            placeholder="Class Name"
            value={className}
            onChangeText={setClassName}
            onFocus={() => setClassNameFocused(true)}
            onBlur={() => setClassNameFocused(false)}
            className={`rounded-lg p-3 mb-4 border mt-6 ${
              classNameFocused ? "border-primary" : "border-gray-300"
            }`}
          />
          <TextInput
            placeholder="Section"
            value={section}
            onChangeText={setSection}
            onFocus={() => setSectionFocused(true)}
            onBlur={() => setSectionFocused(false)}
            className={`rounded-lg p-3 mb-4 border ${
              sectionFocused ? "border-primary" : "border-gray-300"
            }`}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            className={`rounded-lg p-3 mb-4 text-left text-base border ${
              descriptionFocused ? "border-primary" : "border-gray-300"
            }`}
          />
          <View className="flex-row justify-end px-5 py-2">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginRight: 10 }}
            >
              <Text className="text-black font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!isFormValid}
              onPress={handleCreateClass}
            >
              <Text
                className={`font-semibold text-base ${
                  isFormValid ? "text-secondary" : "text-gray-500"
                }`}
              >
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateClassModal;
