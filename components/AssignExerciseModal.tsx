import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AssignExerciseModal = ({ modalVisible, setModalVisible, exercises }) => {
  const [searchText, setSearchText] = useState("");

  const filteredExercises = exercises.filter((exercise) =>
    exercise.exerciseTitle.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        className="flex-1 justify-center items-center px-4"
      >
        <View className="bg-white p-6 rounded-2xl w-full">
          {/* <Text className="text-xl font-poppins-bold mb-4">Assign Activity</Text> */}
          <Text className="text-3xl font-semibold text-titlegray mb-2">
            Assign Exercise
          </Text>
          <Text className="text-lg mb-4">Assign exercises to students</Text>
          <TextInput
            placeholder="Search for an activity"
            className="border border-gray-300 rounded-lg p-2 mb-2"
            value={searchText}
            onChangeText={setSearchText}
          />

          <ScrollView
            style={{ height: 400, marginTop: 10 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View>
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <View
                    key={exercise.id}
                    className="flex-row items-center justify-between bg-gray-100 rounded-lg p-4 mb-4"
                  >
                    <View>
                      <Text className="text-lg font-semibold">
                        {exercise.exerciseTitle}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {exercise.exerciseDescription}
                      </Text>
                    </View>
                    <TouchableOpacity className="bg-yellow-400 rounded-full py-2 px-4">
                      <Text className="text-white font-semibold">Assign</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text className="text-center text-gray-500">
                  No exercises found
                </Text>
              )}
            </View>
          </ScrollView>

          <View className="flex-row justify-end py-2">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="px-4"
            >
              <Text className="text-black font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AssignExerciseModal;
