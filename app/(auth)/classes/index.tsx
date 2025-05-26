import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CreateClassModal from "@/components/CreateClassModal";
import JoinClassModal from "@/components/JoinClassModal";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ClassRoomService from "@/api/services/classroom-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const Classes = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [myClasses, setMyClasses] = useState(null);
  const [createdClasses, setCreatedClasses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Joined Classes");

  const tabs = ["Joined Classes", "Created Classes"];

  const fetchMyClasses = async () => {
    const response = await ClassRoomService.getAllStudentClasses(
      currentUser.id
    );

    if (response.success) {
      setMyClasses(response.data);
    } else {
      showToast(response.error, "error");
    }

    return response.data;
  };

  const fetchCreatedClasses = async () => {
    const response = await ClassRoomService.getAllTeacherClasses(
      currentUser.id
    );

    if (response.success) {
      setCreatedClasses(response.data);
    } else {
      showToast(response.error, "error");
    }

    return response.data;
  };

  const fetchAllClasses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([fetchMyClasses(), fetchCreatedClasses()]);
    } catch (error) {
      console.error("Error loading classes:", error);
      setError("Failed to load classes");
      showToast("Failed to load classes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAllClasses();
    }, [])
  );

  const router = useRouter();
  const navigateToClassroom = (id: number) => {
    router.push(`/classes/classroom/${id}`);
  };

  const navigateToTab = (tab) => {
    setActiveTab(tab);
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [createClassModalVisible, setCreateClassModalVisible] = useState(false);
  const [joinClassModalVisible, setJoinClassModalVisible] = useState(false);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const renderClassList = (classes, emptyMessage, emptySubMessage) => {
    if (isLoading) {
      return (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 20,
          }}
          className="w-full"
        >
          {[...Array(5)].map((_, index) => (
            <View
              key={index}
              className="bg-gray-200 rounded-xl p-6 mb-4 animate-pulse"
            >
              <View className="w-2/3 h-6 bg-gray-300 rounded mb-3" />
              <View className="flex-row items-center mb-4">
                <View className="w-4 h-4 bg-gray-300 rounded-full" />
                <View className="ml-2 w-1/3 h-4 bg-gray-300 rounded" />
              </View>
              <View className="w-24 h-8 bg-gray-300 rounded self-end" />
            </View>
          ))}
        </ScrollView>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
          <Text className="mt-4 text-gray-800 font-poppins-medium text-center">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-lg"
            onPress={fetchAllClasses}
          >
            <Text className="text-white font-poppins-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!classes || classes.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="school-outline" size={48} color="#00BFAF" />
          <Text className="mt-4 text-gray-800 font-poppins-medium text-center text-lg">
            {emptyMessage}
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            {emptySubMessage}
          </Text>
          <View className="flex-row mt-6">
            {activeTab === "Created Classes" && (
              <TouchableOpacity
                className="mr-3 bg-primary px-6 py-3 rounded-lg flex-row items-center"
                onPress={() => setCreateClassModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text className="ml-2 text-white font-poppins-medium">
                  Create Class
                </Text>
              </TouchableOpacity>
            )}
            {activeTab === "Joined Classes" && (
              <TouchableOpacity
                className="bg-secondary px-6 py-3 rounded-lg flex-row items-center"
                onPress={() => setJoinClassModalVisible(true)}
              >
                <Ionicons name="enter-outline" size={20} color="white" />
                <Text className="ml-2 text-white font-poppins-medium">
                  Join Class
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id + ""}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <View className="bg-primary rounded-xl p-6 mb-4">
            <Text className="text-white text-xl font-bold">
              {item.className}
            </Text>
            <View className="flex-row items-center mt-2 mb-4">
              <Ionicons name="person" size={16} color="white" />
              <Text className="text-white ml-2">
                {item.studentCount || "0"} students
              </Text>
            </View>
            {activeTab === "My Classes" && item.teacherName && (
              <View className="flex-row items-center mb-4">
                <Ionicons name="person-outline" size={16} color="white" />
                <Text className="text-white ml-2">
                  Teacher: {item.teacherName}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-yellow-400 px-4 py-2 rounded-md self-end"
              onPress={() => navigateToClassroom(item.id)}
            >
              <Text className="text-white font-semibold">View Class</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Joined Classes":
        return renderClassList(
          myClasses,
          "You haven't joined any classes yet",
          "Join a class to start learning and participating in activities"
        );
      case "Created Classes":
        return renderClassList(
          createdClasses,
          "You haven't created any classes yet",
          "Create a new class to start teaching and managing students"
        );
      default:
        return renderClassList(myClasses, "No classes found", "");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="px-6 pt-10 flex-row justify-between items-center z-50 bg-white mb-5">
        <Text className="text-3xl font-poppins-bold text-titlegray">
          My Classes
        </Text>

        <View className="relative">
          <TouchableOpacity
            onPress={toggleDropdown}
            className="bg-secondary w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>

          {dropdownVisible && (
            <View className="absolute top-12 right-0 bg-white shadow-md min-w-[150px] rounded-md z-50 border border-gray-100">
              <TouchableOpacity
                className="px-4 py-3 flex-row items-center border-b border-gray-100"
                onPress={() => {
                  setCreateClassModalVisible(true);
                  setDropdownVisible(false);
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-medium">
                  Create Class
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 flex-row items-center"
                onPress={() => {
                  setJoinClassModalVisible(true);
                  setDropdownVisible(false);
                }}
              >
                <Ionicons name="enter-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-medium">
                  Join Class
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      <View className="flex-row bg-white border-b border-gray-200 shadow-sm">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className="flex-1 items-center py-3"
            onPress={() => navigateToTab(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text
              className={`text-base font-poppins-medium ${
                activeTab === tab ? "text-primary" : "text-gray-600"
              }`}
            >
              {tab}
            </Text>
            {activeTab === tab && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      <CreateClassModal
        modalVisible={createClassModalVisible}
        setModalVisible={setCreateClassModalVisible}
        onClassCreated={fetchCreatedClasses}
      />

      <JoinClassModal
        modalVisible={joinClassModalVisible}
        setModalVisible={setJoinClassModalVisible}
        studentId={currentUser.id}
        loadData={fetchMyClasses}
      />
    </View>
  );
};

export default Classes;
