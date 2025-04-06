import React, { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HalfScreenModal({
  children,
  modalVisible,
  setModalVisible,
}: {
  children: ReactNode;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View className="flex-1 justify-end items-center">
        <View className="w-full bg-white p-6 rounded-t-lg shadow-lg h-[60%]">
          <Pressable
            className="p-3 rounded-md"
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Ionicons name="close" size={32} color="black" />
          </Pressable>
          {children}
        </View>
      </View>
    </Modal>
  );
}
