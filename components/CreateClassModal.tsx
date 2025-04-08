import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";

const CreateClassModal = ({ modalVisible, setModalVisible, addNewClass }) => {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");

  const [classNameFocused, setClassNameFocused] = useState(false);
  const [sectionFocused, setSectionFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const isFormValid = className.trim() !== "" && section.trim() !== "";

  const handleCreateClass = () => {
    const newClass = { name: className, section, description };
    addNewClass(newClass);
    setClassName("");
    setSection("");
    setDescription("");
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} className="flex-1 justify-center items-center px-4">
        <View className="bg-white w-full rounded-2xl p-6">
        <Text className="text-3xl font-semibold text-titlegray mb-2">Create Class</Text>
        <Text className="text-lg text-subtitlegray">Create a class to get started! </Text>

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
            <TouchableOpacity disabled={!isFormValid} onPress={handleCreateClass}>
              <Text className={`font-semibold text-base ${isFormValid ? "text-primary" : "text-gray-500"}`}>
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
