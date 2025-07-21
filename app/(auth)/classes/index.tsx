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
import CreateClassModal from "@/components/classroom/CreateClassModal";
import JoinClassModal from "@/components/classroom/JoinClassModal";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ClassRoomService from "@/api/services/classroom-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import MultipleChoiceLesson from "../../../components/lessons/MultipleChoiceLesson";
import ClassSkeleton from "@/components/skeletons/ClassSkeleton";

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
      console.log("My Classes data:", response.data);
      
      // Fetch student count for each class
      const classesWithStudentCount = await Promise.all(
        response.data.map(async (classItem) => {
          const studentsResponse = await ClassRoomService.getAllStudentsInThisClass(
            classItem.id
          );
          return {
            ...classItem,
            studentCount: studentsResponse.success ? studentsResponse.data.length : 0
          };
        })
      );
      
      setMyClasses(classesWithStudentCount);
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const fetchCreatedClasses = async () => {
    const response = await ClassRoomService.getAllTeacherClasses(
      currentUser.id
    );

    if (response.success) {
      console.log("Created Classes data:", response.data);
      
      // Fetch student count for each class
      const classesWithStudentCount = await Promise.all(
        response.data.map(async (classItem) => {
          console.log("Processing created class item:", classItem);
          const studentsResponse = await ClassRoomService.getAllStudentsInThisClass(
            classItem.id
          );
          return {
            ...classItem,
            studentCount: studentsResponse.success ? studentsResponse.data.length : 0
          };
        })
      );
      
      console.log("Created classes with student count:", classesWithStudentCount);
      setCreatedClasses(classesWithStudentCount);
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [myClasses, createdClasses] = await Promise.all([
        fetchMyClasses(),
        fetchCreatedClasses(),
      ]);

      if (!myClasses || !createdClasses) {
        throw new Error("Failed to load required class data");
      }
    } catch (error) {
      showToast("Failed to load classes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
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
          {[...Array(4)].map((_, index) => (
            <ClassSkeleton key={index}></ClassSkeleton>
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
            onPress={loadData}
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
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigateToClassroom(item.id)}
            className="mb-4"
          >
            <View className="bg-primary rounded-xl p-6">
              {/* Header with icon */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white text-xl font-poppins-bold flex-1" numberOfLines={1}>
                  {item.className}
                </Text>
                <Ionicons name="school-outline" size={24} color="white" />
              </View>
              
              {/* Teacher info for joined classes */}
              {item.teacher?.profile && activeTab === "Joined Classes" && (
                <View className="flex-row items-center mb-4">
                  <Ionicons name="person-circle" size={16} color="white" />
                  <Text className="text-white ml-2 font-poppins-medium">
                    {item.teacher.profile.firstName} {item.teacher.profile.lastName}
                  </Text>
                </View>
              )}
              
              {/* Student count and button section */}
              <View className="flex-row items-center justify-between">
                {/* Student count */}
                <View className="flex-row items-center">
                  <Ionicons name="people" size={16} color="white" />
                  <Text className="text-white ml-2 font-poppins-medium">
                    {item.studentCount || 0} student{(item.studentCount || 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                {/* View Class button */}
                <TouchableOpacity 
                  className="bg-yellow-400 px-4 py-3 rounded-lg"
                  onPress={() => navigateToClassroom(item.id)}
                >
                  <Text className="text-white font-poppins-semibold">View Class</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
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
        loadData={fetchMyClasses}
      />
    </View>
  );
};

export default Classes;
