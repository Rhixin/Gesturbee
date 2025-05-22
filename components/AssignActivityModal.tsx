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

const AssignActivityModal = ({ modalVisible, setModalVisible }) => {
  const [searchText, setSearchText] = useState("");

  const activities = [
    {
      id: 1,
      title: "Alphabets A-G",
      numQuestions: "10",
    },
    {
      id: 2,
      title: "Greetings",
      numQuestions: "10",
    },
    {
      id: 3,
      title: "Numbers",
      numQuestions: "10",
    },
    {
      id: 4,
      title: "Numbers",
      numQuestions: "10",
    },
    {
      id: 5,
      title: "Numbers",
      numQuestions: "10",
    },
    {
      id: 6,
      title: "Numbers",
      numQuestions: "10",
    },
  ];

  //filtering activities, working search bar
  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchText.toLowerCase())
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
            Assign Activity
          </Text>
          <Text className="text-lg mb-4">Assign activities to students</Text>
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
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <View
                    key={activity.id}
                    className="flex-row items-center justify-between bg-gray-100 rounded-lg p-4 mb-4"
                  >
                    <View>
                      <Text className="text-lg font-semibold">
                        {activity.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {activity.numQuestions} Questions
                      </Text>
                    </View>
                    <TouchableOpacity className="bg-yellow-400 rounded-full py-2 px-4">
                      <Text className="text-white font-semibold">Assign</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text className="text-center text-gray-500">
                  No activities found
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

export default AssignActivityModal;
