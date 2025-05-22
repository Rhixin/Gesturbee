import React, { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AddStudentModal from "@/components/AddStudentModal";
import NotificationButton from "@/components/NotificationButton";
import AssignActivityModal from "@/components/AssignActivityModal";
import RemoveStudentModal from "@/components/RemoveStudentModal";
import ActivitiesTab from "@/components/ActivitiesTab";
import { useToast } from "@/context/ToastContext";
import ClassRoomService from "@/api/services/classroom-service";

const Classroom = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Students");

  const tabs = ["Students", "Activities", "Grades"];

  const navigateToTab = (tab) => {
    setActiveTab(tab);
  };

  const navigate = (path) => {
    router.push(path);
  };

  //modals
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [removeStudentModalVisible, setRemoveStudentModalVisible] =
    useState(false);
  const [assignActivityModalVisible, setAssignActivityModalVisible] =
    useState(false);

  // helpers
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // data needed before rendering
  const [students, setStudents] = useState(null);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [enrollmentRequests, setEnrollmentRequests] = useState(null);
  const [allUsers, setAllUsers] = useState(null);

  // apis
  const fetchClassroom = async () => {
    try {
      const response = await ClassRoomService.getClassroom(id, showToast);
      const classroomDetails = response?.data.data;
      setClassroomDetails(classroomDetails);
      return classroomDetails;
    } catch (error) {
      console.error("Failed to fetch classroom:", error);
      throw error;
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await ClassRoomService.getAllStudentsInThisClass(
        id,
        showToast
      );
      const students = response?.data.data;
      const studentsProfile = students.map((item) => item.profile);
      setStudents(studentsProfile);
      return studentsProfile;
    } catch (error) {
      console.error("Failed to fetch students:", error);
      throw error;
    }
  };

  const fetchEnrollmentRequests = async (classId) => {
    try {
      const response = await ClassRoomService.getAllEnrollmentRequests(classId);
      const enrollementRequests = response?.data.data;
      const enrollementRequestsProfile = enrollementRequests.map(
        (item) => item.profile
      );
      setEnrollmentRequests(enrollementRequestsProfile);
      return enrollementRequestsProfile;
    } catch (error) {
      showToast("Failed to remove student", "error");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await ClassRoomService.getAllUsers();
      const users = response?.data.data;
      const allUserProfiles = users.map((item) => item.profile);

      setAllUsers(allUserProfiles);
      return users;
    } catch (error) {
      console.error("Failed to fetch students:", error);
      throw error;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both classroom details and students concurrently
      const [
        classroomData,
        studentsData,
        enrollmentRequestsData,
        allUsersData,
      ] = await Promise.all([
        fetchClassroom(),
        fetchStudents(),
        fetchEnrollmentRequests(id),
        fetchAllUsers(),
      ]);

      // Check if all data sets were loaded successfully
      if (
        !classroomData ||
        studentsData === undefined ||
        !enrollmentRequestsData ||
        !allUsersData
      ) {
        throw new Error("Failed to load required data");
      }
    } catch (error) {
      console.error("Error loading classroom data:", error);
      setError("Failed to load classroom data");
      showToast("Failed to load classroom data", "error");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    } else {
      setError("Invalid classroom ID");
      router.back();
    }
  }, [id]);

  //adding student
  const handleAddStudents = (newStudents) => {
    if (!students) {
      setStudents(newStudents);
      return;
    }

    const newUniqueStudents = newStudents.filter(
      (newStudent) =>
        !students.some((existing) => existing.id === newStudent.id)
    );
    setStudents([...students, ...newUniqueStudents]);
  };

  //removing student
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const showRemoveStudentModal = (studentId) => {
    setSelectedStudentId(studentId);
    setRemoveStudentModalVisible(true);
  };

  //selecting activity
  const [selectedActivity, setSelectedActivity] = useState("");

  const renderStudents = () => {
    if (isLoading) {
      return (
        <ScrollView className="w-full">
          {[...Array(5)].map((_, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between bg-gray-200 mx-4 my-2 rounded-xl shadow-sm p-4 mb-4 animate-pulse"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
                <View className="w-32 h-4 bg-gray-300 rounded" />
              </View>
              <View className="w-6 h-6 bg-gray-300 rounded" />
            </View>
          ))}
        </ScrollView>
      );
    }

    if (!students || students.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="school-outline" size={48} color="#00BFAF" />
          <Text className="mt-4 text-gray-800 font-poppins-medium text-center text-lg">
            You don't have any students yet
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            Add students to get started
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="w-full">
        {students.map((student) => (
          <View
            key={student.id}
            className="flex-row items-center justify-between bg-gray-100 mx-4 my-2 rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
                <Ionicons name="person" size={24} color="#999" />
              </View>
              <View>
                <Text className="text-base font-poppins-medium text-gray-800">
                  {student.firstName + " " + student.lastName}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => showRemoveStudentModal(student.id)}
            >
              <Ionicons name="person-remove" size={20} color="#F2A800" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderGrades = () => {
    return (
      <View className="flex-1 p-4">
        <TouchableOpacity className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="bar-chart" size={20} color="#0080FF" />
            </View>
            <Text className="text-lg font-poppins-medium text-gray-800">
              Progress Report
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#00BFAF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Students":
        return renderStudents();
      case "Activities":
        return <ActivitiesTab />;
      case "Grades":
        return renderGrades();
      default:
        return renderStudents();
    }
  };

  // // Loading state
  // if (isLoading) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-gray-50">
  //       <ActivityIndicator size="large" color="#FBBC05" />
  //       <Text className="mt-4 text-secondary font-poppins-medium">
  //         Loading classroom data...
  //       </Text>
  //     </View>
  //   );
  // }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
        <Text className="mt-4 text-gray-800 font-poppins-medium text-center">
          {error}
        </Text>
        <Text className="mt-2 text-gray-600 text-center">
          Returning to previous screen...
        </Text>
        <TouchableOpacity
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-poppins-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <SafeAreaView className="pt-10 bg-primary">
        <View className="px-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="bg-white rounded-2xl py-3 flex-1 justify-center">
            {isLoading ? (
              <View className="h-6 w-32 bg-gray-300 self-center rounded-md animate-pulse" />
            ) : (
              <Text className="text-xl font-poppins-bold text-center text-secondary">
                {classroomDetails?.className}
              </Text>
            )}
          </View>

          <View className="flex-row items-center ml-4">
            {isLoading ? (
              <View className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
            ) : (
              <NotificationButton
                handleAcceptRequest={handleAddStudents}
                enrollmentRequestsProfile={enrollmentRequests}
                classId={id}
                loadData={loadData}
              />
            )}

            <TouchableOpacity
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Navigation Tabs */}
      <View className="flex-row bg-white border-b border-gray-200 shadow-sm mb-4">
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

      <View className="flex-1">
        {/* Add Student Button - Only show on Students tab */}
        {activeTab === "Students" && (
          <View
            className="absolute bottom-4 right-4 p-4"
            style={{ zIndex: 10 }}
          >
            <TouchableOpacity
              className="bg-primary flex-row items-center rounded-full px-4 py-2 shadow-md"
              accessibilityLabel="Add student"
              accessibilityRole="button"
              onPress={() => {
                setAddStudentModalVisible(true);
              }}
            >
              <Text className="text-white mr-2 font-poppins-medium">
                Add student
              </Text>
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Add Activity Button - Only show on Activities tab */}
        {activeTab === "Activities" && (
          <View
            className="absolute bottom-4 right-1 p-4"
            style={{ zIndex: 100 }}
          >
            <TouchableOpacity
              className="bg-primary flex-row items-center rounded-full px-4 py-2 shadow-md"
              accessibilityLabel="Assign Activity"
              accessibilityRole="button"
              onPress={() => {
                setAssignActivityModalVisible(true);
              }}
            >
              <Text className="text-white mr-2 font-poppins-medium">
                Assign Activity
              </Text>
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Content */}
        {renderContent()}
      </View>

      <AssignActivityModal
        modalVisible={assignActivityModalVisible}
        setModalVisible={setAssignActivityModalVisible}
      />

      {!isLoading && (
        <AddStudentModal
          modalVisible={addStudentModalVisible}
          setModalVisible={setAddStudentModalVisible}
          onAddStudents={handleAddStudents}
          allUsers={allUsers}
          studentsAlreadyAdded={students}
          loadData={loadData}
          classId={id}
        />
      )}

      <RemoveStudentModal
        modalVisible={removeStudentModalVisible}
        setModalVisible={setRemoveStudentModalVisible}
        studentId={selectedStudentId}
        students={students || []}
        loadData={loadData}
        classId={id}
      />
    </View>
  );
};

export default Classroom;
