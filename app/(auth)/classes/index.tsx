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
import ClassRoomService from "@/api/services/classroom-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const Classes = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [classes, setClasses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      setError(null);

      //console.log(currentUser.id);

      try {
        const response = await ClassRoomService.getAllTeacherClasses(
          currentUser.id,
          showToast
        );

        const classes = response.data.data;
        setClasses(classes);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setError("Failed to load classes. Please try again later.");
        showToast("Failed to load classes", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchClasses();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const router = useRouter();
  const navigateToClassroom = (id: number) => {
    router.push(`/classes/classroom/${id}`);
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [createClassModalVisible, setCreateClassModalVisible] = useState(false);
  const [joinClassModalVisible, setJoinClassModalVisible] = useState(false);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const addNewClass = (newClass) => {
    setClasses((prevClasses) => [
      ...prevClasses,
      { id: String(prevClasses.length + 1), ...newClass },
    ]);
  };

  const renderContent = () => {
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
            onPress={async () => {
              if (currentUser?.id) {
                setIsLoading(true);
                try {
                  const response = await ClassRoomService.getAllTeacherClasses(
                    currentUser.id,
                    showToast
                  );
                  setClasses(response.data.data);
                  setError(null);
                } catch (err) {
                  console.error("Retry failed:", err);
                  setError("Failed to load classes. Please try again later.");
                  showToast("Failed to load classes", "error");
                } finally {
                  setIsLoading(false);
                }
              }
            }}
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
            You don't have any classes yet
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            Create a new class or join an existing one to get started
          </Text>
          <View className="flex-row mt-6">
            <TouchableOpacity
              className="mr-3 bg-primary px-6 py-3 rounded-lg flex-row items-center"
              onPress={() => setCreateClassModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="ml-2 text-white font-poppins-medium">
                Create Class
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-secondary px-6 py-3 rounded-lg flex-row items-center"
              onPress={() => setJoinClassModalVisible(true)}
            >
              <Ionicons name="enter-outline" size={20} color="white" />
              <Text className="ml-2 text-white font-poppins-medium">
                Join Class
              </Text>
            </TouchableOpacity>
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
          <View className="bg-primary rounded-xl p-6 mb-4 z-10">
            <Text className="text-white text-xl font-bold">
              {item.className}
            </Text>
            <View className="flex-row items-center mt-2 mb-4">
              <Ionicons name="person" size={16} color="white" />
              <Text className="text-white ml-2">
                {item.studentCount || "0"} students
              </Text>
            </View>

            <TouchableOpacity
              className="bg-yellow-400 px-4 py-2 rounded-md self-end"
              onPress={() => navigateToClassroom(item.id)}
            >
              <Text className="text-white font-semibold">View Class</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshing={isLoading}
        onRefresh={async () => {
          if (currentUser?.id) {
            setIsLoading(true);
            try {
              const response = await ClassRoomService.getAllTeacherClasses(
                currentUser.id,
                showToast
              );
              setClasses(response.data.data);
              setError(null);
            } catch (err) {
              console.error("Refresh failed:", err);
              setError("Failed to refresh classes. Please try again later.");
              showToast("Failed to refresh classes", "error");
            } finally {
              setIsLoading(false);
            }
          }
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray">
      <SafeAreaView className="px-6 pt-10 flex-row justify-between items-center z-50 bg-white shadow-sm">
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
            <View className="absolute top-12 right-0 bg-white shadow-md min-w-[120px] rounded-md z-50">
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

      {renderContent()}

      <CreateClassModal
        modalVisible={createClassModalVisible}
        setModalVisible={setCreateClassModalVisible}
        addNewClass={addNewClass}
      />

      <JoinClassModal
        modalVisible={joinClassModalVisible}
        setModalVisible={setJoinClassModalVisible}
      />
    </View>
  );
};

export default Classes;
