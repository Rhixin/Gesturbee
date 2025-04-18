import React, { useState } from "react";
import {
  Modal,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import AddStudentModal from "@/components/AddStudentModal";
import NotificationButton from "@/components/NotificationButton";
import AssignActivityModal from "@/components/AssignActivityModal";
import RemoveStudentModal from "@/components/RemoveStudentModal";
import ActivitiesTab from "@/components/ActivitiesTab";

const Classroom = () => {
  const { id, classroomName } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Students");

  const tabs = ["Students", "Activities", "Grades"];

  const navigateToTab = (tab) => {
    setActiveTab(tab);
  };

  //modals
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [removeStudentModalVisible, setRemoveStudentModalVisible] =
    useState(false);
  const [assignActivityModalVisible, setAssignActivityModalVisible] =
    useState(false);

  //for student tab
  const [students, setStudents] = useState([
    { id: "1", name: "John Doe", email: "johndoe@gmail.com" },
    { id: "2", name: "Jane Doe", email: "janedoe@gmail.com" },
  ]);

  //adding student
  const handleAddStudents = (newStudents) => {
    const newUniqueStudents = newStudents.filter(
      (newStudent) =>
        !students.some((existing) => existing.id === newStudent.id)
    );
    setStudents([...students, ...newUniqueStudents]);
  };

  //removing student
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const handleRemoveStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setRemoveStudentModalVisible(true);
  };

  const handleRemoveStudentConfirmed = () => {
    const updatedStudents = students.filter(
      (student) => student.id !== selectedStudentId
    );
    setStudents(updatedStudents);
    setRemoveStudentModalVisible(false);
  };

  // const navigateToStudent = (studentId) => {
  //   router.push(`/students/${studentId}`);
  // };

  //selecting activity
  const [selectedActivity, setSelectedActivity] = useState("");

  const renderStudents = () => {
    return (
      <ScrollView className="w-full">
        {students.map((student) => (
          <View
            key={student.id}
            // className="flex-row items-center justify-between p-4 mx-4 my-2 bg-white rounded-xl shadow-sm border border-gray-100"
            className="flex-row items-center justify-between bg-gray-100 mx-4 my-2 rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
            // onPress={() => navigateToStudent(student.id)}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
                <Ionicons name="person" size={24} color="#999" />
              </View>
              <View>
                <Text className="text-base font-poppins-medium text-gray-800">
                  {student.name}
                </Text>
                <Text className="text-sm text-gray-500 font-poppins">
                  {student.email}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveStudent(student.id, student.name)}
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
            <Text className="text-xl font-poppins-bold text-center text-secondary">
              {classroomName}
            </Text>
          </View>

          <View className="flex-row items-center ml-4">
            <NotificationButton handleAcceptRequest={handleAddStudents} />

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
            {/* <View className="absolute bottom-4 right-1 p-4"> */}
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
                setAssignActivityModalVisible(true); // Open the modal for assigning activity
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

      <AddStudentModal
        modalVisible={addStudentModalVisible}
        setModalVisible={setAddStudentModalVisible}
        onAddStudents={handleAddStudents}
      />

      <RemoveStudentModal
        modalVisible={removeStudentModalVisible}
        setModalVisible={setRemoveStudentModalVisible}
        studentId={selectedStudentId}
        students={students}
        onConfirm={handleRemoveStudentConfirmed}
      />
    </View>
  );
};

export default Classroom;
