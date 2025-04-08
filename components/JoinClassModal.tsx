import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";

const JoinClassModal = ({ modalVisible, setModalVisible }) => {
  const [classCode, setClassCode] = useState("");

  const [classCodeisFocused, setClassCodeIsFocused] = useState(false);

  
  const isFormValid = classCode.trim() !== "";

  const handleCreateClass = () => {
    const newClass = { name: classCode};
    setClassCode("");       
   
    setModalVisible(false); 
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}  className="flex-1 justify-center items-center bg-black/50 px-4">
      <View className="bg-white w-full rounded-2xl">
      <Text style={{ marginLeft: 24 }} className="text-3xl font-semibold text-titlegray mb-2 mt-6">Join Class</Text>
      <Text style={{ marginLeft: 24 }} className="text-lg text-subtitlegray mb-6">Ask your teacher for the class code and{"\n"}enter it here. </Text>
        <View className="bg-white w-full rounded-2xl p-6">
        <TextInput
            placeholder="Class Code"
            value={classCode}
            onChangeText={setClassCode}
            className={`rounded-lg p-3 mb-4 border ${
                classCodeisFocused ? "border-primary" : "border-gray-300"
            }`}
            onFocus={() => setClassCodeIsFocused(true)}
            onBlur={() => setClassCodeIsFocused(false)}
            />
          <View className="flex-row justify-end px-5 py-2">
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 10 }}>
              <Text className="text-black font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={!isFormValid} onPress={handleCreateClass}>
              <Text className={`font-semibold text-base ${isFormValid ? "text-primary" : "text-gray-500"}`}>
                Join
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
