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
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status) => {
    return status === "completed" ? "text-green-600" : "text-orange-500";
  };

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
    const response = await ClassRoomService.getClassroom(id);

    if (response.success) {
      setClassroomDetails(response.data);
    } else {
      showToast(response.error, "error");
    }

    return response.data;
  };

  const fetchStudents = async () => {
    const response = await ClassRoomService.getAllStudentsInThisClass(
      id,
      showToast
    );

    if (response.success) {
      setStudents(response.data);
    } else {
      showToast(response.error, "error");
    }

    return response.data;
  };

  const fetchEnrollmentRequests = async (classId) => {
    const response = await ClassRoomService.getAllEnrollmentRequests(classId);

    if (response.success) {
      setEnrollmentRequests(response.data);
    } else {
      showToast(response.error, "error");
    }

    return response.data;
  };

  const fetchAllUsersNotEnrolled = async () => {
    const response = await ClassRoomService.getAllUsersNotEnrolled(id);

    if (response.success) {
      setAllUsers(response.data);
    } else {
      showToast(response.error, "error");
    }

    return response.data;
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
        fetchAllUsersNotEnrolled(),
      ]);

      // Check if all data sets were loaded successfully
      if (
        !classroomData ||
        !studentsData ||
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

  //for grades data
  const activitiesWithGrades = [
    {
      id: "1",
      name: "Math Quiz 1",
      type: "Quiz",
      totalStudents: students?.length ?? 5,
      completed: 2,
      averageScore: 85,
      dueDate: "2024-01-15",
      grades: [
        {
          studentId: "1",
          studentName: "John Doe",
          score: 90,
          status: "completed",
        },
        {
          studentId: "2",
          studentName: "Jane Doe",
          score: 80,
          status: "completed",
        },
      ],
    },
    {
      id: "2",
      name: "Reading Assignment",
      type: "Assignment",
      totalStudents: students?.length ?? 5,
      completed: 1,
      averageScore: 92,
      dueDate: "2024-01-20",
      grades: [
        {
          studentId: "1",
          studentName: "John Doe",
          score: 92,
          status: "completed",
        },
        {
          studentId: "2",
          studentName: "Jane Doe",
          score: null,
          status: "not submitted",
        },
      ],
    },
    {
      id: "3",
      name: "Science Project",
      type: "Project",
      totalStudents: students?.length ?? 5,
      completed: 0,
      averageScore: null,
      dueDate: "2024-01-25",
      grades: [
        {
          studentId: "1",
          studentName: "John Doe",
          score: null,
          status: "not submitted",
        },
        {
          studentId: "2",
          studentName: "Jane Doe",
          score: null,
          status: "not submitted",
        },
      ],
    },
  ];

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
      <ScrollView className="flex-1 p-4">
        {/* Overall Class Summary */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="analytics" size={20} color="#0080FF" />
            </View>
            <Text className="text-lg font-poppins-bold text-gray-800">
              Class Overview
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-poppins-bold text-blue-600">
                {students.length}
              </Text>
              <Text className="text-sm text-gray-600 font-poppins">
                Students
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-poppins-bold text-green-600">
                {activitiesWithGrades.length}
              </Text>
              <Text className="text-sm text-gray-600 font-poppins">
                Activities
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-poppins-bold text-orange-600">
                {activitiesWithGrades.reduce(
                  (acc, activity) =>
                    acc + (activity.totalStudents - activity.completed),
                  0
                )}
              </Text>
              <Text className="text-sm text-gray-600 font-poppins">
                Pending
              </Text>
            </View>
          </View>
        </View>

        {/* Activities with Grades */}
        <Text className="text-xl font-poppins-bold text-gray-800 mb-3">
          Activity Grades
        </Text>

        {activitiesWithGrades.map((activity) => (
          <View
            key={activity.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
          >
            {/* Activity Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-poppins-medium text-gray-800">
                  {activity.name}
                </Text>
                <Text className="text-sm text-gray-500 font-poppins">
                  {activity.type} • Due:{" "}
                  {new Date(activity.dueDate).toLocaleDateString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-poppins-medium text-gray-600">
                  {activity.completed}/{activity.totalStudents} completed
                </Text>
                {activity.averageScore && (
                  <Text
                    className={`text-lg font-poppins-bold ${getScoreColor(
                      activity.averageScore
                    )}`}
                  >
                    Avg: {activity.averageScore}%
                  </Text>
                )}
              </View>
            </View>

            {/* Progress Bar */}
            <View className="bg-gray-200 rounded-full h-2 mb-3">
              <View
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${
                    (activity.completed / activity.totalStudents) * 100
                  }%`,
                }}
              />
            </View>

            {/* Student Grades */}
            <View className="border-t border-gray-100 pt-3">
              {activity.grades.map((grade) => (
                <View
                  key={grade.studentId}
                  className="flex-row items-center justify-between py-2"
                >
                  <Text className="text-base font-poppins text-gray-700">
                    {grade.studentName}
                  </Text>
                  <View className="flex-row items-center">
                    {grade.score !== null ? (
                      <Text
                        className={`text-base font-poppins-medium mr-2 ${getScoreColor(
                          grade.score
                        )}`}
                      >
                        {grade.score}%
                      </Text>
                    ) : (
                      <Text className="text-base font-poppins mr-2 text-gray-400">
                        --
                      </Text>
                    )}
                    <Text
                      className={`text-sm font-poppins ${getStatusColor(
                        grade.status
                      )}`}
                    >
                      {grade.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
