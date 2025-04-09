import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Image, ScrollView, Pressable } from "react-native";
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";

const RemoveStudentModal = ({ 
    modalVisible, 
    setModalVisible, 
    studentId, 
    students, 
    onConfirm 
  }) => {
    const student = students.find(s => s.id === studentId);
  
    if (!student) return null; 
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} className="flex-1 justify-center items-center px-4">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-lg font-semibold text-titlegray mb-2">Are you sure you want to remove this student?</Text>
  
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
                <Ionicons name="person" size={24} color="#999" />
              </View>
              <View>
                <Text className="text-base font-poppins-medium text-gray-800">{student.name}</Text>
                <Text className="text-sm text-gray-500 font-poppins">{student.email}</Text>
              </View>
            </View>
  
            <Text className="text-lg text-subtitlegray mb-2">This action cannot be undone.</Text>
          
            <View className="flex-row justify-end py-2">
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="px-4 py-2"
              >
                <Text className="text-black font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
  
              <TouchableOpacity 
                onPress={onConfirm}
                className="px-4 py-2"
              >
                <Text className="text-red-500 font-semibold text-base">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  

  export default RemoveStudentModal;