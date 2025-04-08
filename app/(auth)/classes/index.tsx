import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CreateClassModal from "@/components/CreateClassModal";
import JoinClassModal from "@/components/JoinClassModal";


const Classes = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [createClassModalVisible, setCreateClassModalVisible] = useState(false);

  const [joinClassModalVisible, setJoinClassModalVisible] = useState(false);

  const [classes, setClasses] = useState([
    { id: "1", name: "Sped-1", students: 30 },
  ]);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const addNewClass = (newClass) => 
  {
    setClasses((prevClasses) => [
      ...prevClasses,
      { id: String(prevClasses.length + 1), ...newClass },
    ]);
  };

  return (
    <View className="flex-1 bg-gray">
      <SafeAreaView className="px-6 pt-10 flex-row justify-between items-center z-50 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-titlegray">My Classes</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={toggleDropdown}
            className="bg-secondary w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>

          {dropdownVisible && (
            <View className="absolute top-12 right-0 bg-white shadow-md min-w-[120px] rounded-md z-50">
              <TouchableOpacity className="px-4 py-3 flex-row items-center border-b border-gray-100"
                onPress={() => {
                  setCreateClassModalVisible(true);
                  setDropdownVisible(false);
                }}>
                <Ionicons name="add-circle-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-medium">Create Class</Text>
              </TouchableOpacity>

              <TouchableOpacity className="px-4 py-3 flex-row items-center"
              onPress={() => {
                setJoinClassModalVisible(true);
                setDropdownVisible(false);
              }}>
                <Ionicons name="enter-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-medium">Join Class</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
        renderItem={({ item }) => (
          <View className="bg-primary rounded-xl p-6 mb-4 z-10">
            <Text className="text-white text-xl font-bold">{item.name}</Text>
            <View className="flex-row items-center mt-2 mb-4">
              <Ionicons name="person" size={16} color="white" />
              <Text className="text-white ml-2">{item.students} students</Text>
            </View>
            <TouchableOpacity className="bg-yellow-400 px-4 py-2 rounded-md self-end">
              <Text className="text-white font-semibold">View Class</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <CreateClassModal 
        modalVisible={createClassModalVisible} 
        setModalVisible={setCreateClassModalVisible} 
        addNewClass={addNewClass}  
      />

      <JoinClassModal 
        modalVisible={joinClassModalVisible} 
        setModalVisible={setJoinClassModalVisible} 
        addNewClass={addNewClass}  
      />
    </View>
  );
};

export default Classes;
