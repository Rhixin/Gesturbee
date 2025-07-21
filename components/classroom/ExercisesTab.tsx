import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import Beehive from "@/components/animations/Beehive";
import TeacherExerciseCard from "@/components/exercise/TeacherExerciseCard";
import StudentExerciseCard from "@/components/exercise/StudentExerciseCard";

const ExercisesTab = ({ isTeacher, exercises, classroomDetails, studentCount, isLoading = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const calculateScore = (studentAnswers, teacherAnswers) => {
    console.log(studentAnswers);
    if (!studentAnswers || studentAnswers.length == 0) {
      return 0;
    }

    let score = 0;
    for (let i = 0; i < teacherAnswers.length; i++) {
      if (studentAnswers[i]) {
        // Handle different answer formats
        const studentAnswer = studentAnswers[i].answer || studentAnswers[i];
        const teacherAnswer = teacherAnswers[i].correctAnswer;
        
        if (studentAnswer == teacherAnswer) {
          score++;
        }
      }
    }

    return score;
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
  };

  // Student details modal component
  const StudentDetailsModal = () => {
    if (!selectedCategory) return null;

    const totalStudents = selectedCategory.students.length;
    const submitted = selectedCategory.students.filter(
      (s) => s.status === "Completed"
    ).length;
    const pending = selectedCategory.students.filter(
      (s) => s.status === "Not Submitted"
    ).length;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }}
          className="justify-center items-center px-4"
        >
          <View
            className="bg-white w-[90%] rounded-2xl p-6"
            style={{ maxHeight: "90%", minHeight: "85%" }}
          >
            {/* Modal Header */}
            <Text className="text-3xl font-semibold text-titlegray mb-2">
              {selectedCategory.title}
            </Text>
            <Text className="text-lg text-subtitlegray mb-4">
              View detailed student performance and submissions
            </Text>

            <View style={{ flex: 1 }}>
              {/* Summary Stats */}
              <View className="bg-gray-100 rounded-xl p-4 mb-4s">
                <Text className="text-lg font-semibold text-titlegray mb-3">
                  Class Summary
                </Text>
                <View className="flex-row justify-around">
                  <View className="items-center mx-4 ">
                    <Text className="text-2xl font-bold text-blue-600">
                      {totalStudents}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Total Students
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-600">
                      {submitted}
                    </Text>
                    <Text className="text-sm text-gray-600">Submitted</Text>
                  </View>
                  <View className="items-center mx-4 ">
                    <Text className="text-2xl font-bold text-red-600">
                      {pending}
                    </Text>
                    <Text className="text-sm text-gray-600">Pending</Text>
                  </View>
                </View>
              </View>

              {/* Student List Section */}
              <View style={{ flex: 1 }}>
                <Text className="text-lg font-semibold text-titlegray mb-3">
                  Student Performance ({selectedCategory.students.length})
                </Text>

                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                >
                  {selectedCategory.students.map((student) => (
                    <View
                      key={student.id}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-3"
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-titlegray mb-1">
                            {student.name}
                          </Text>
                          <View className="flex-row items-center mb-1">
                            <Text className="text-sm text-gray-600">
                              Status:{" "}
                            </Text>
                            <View
                              className={`px-2 py-1 rounded-full ${
                                student.status === "Completed"
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }`}
                            >
                              <Text
                                className={`text-xs font-medium ${
                                  student.status === "Completed"
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {student.status}
                              </Text>
                            </View>
                          </View>
                          {student.submissionDate && (
                            <Text className="text-sm text-gray-600">
                              Submitted: {student.submissionDate}
                            </Text>
                          )}
                        </View>

                        <View className="items-center ml-4">
                          <Text
                            className={`text-2xl font-bold ${
                              student.score >= 80
                                ? "text-green-600"
                                : student.score >= 60
                                ? "text-yellow-600"
                                : student.score > 0
                                ? "text-red-600"
                                : "text-gray-400"
                            }`}
                          >
                            {student.score}%
                          </Text>
                          <Text className="text-xs text-gray-500">Score</Text>
                        </View>
                      </View>

                      {/* Score Progress Bar */}
                      <View className="mt-2">
                        <View className="w-full bg-gray-200 rounded-full h-2">
                          <View
                            className={`h-2 rounded-full ${
                              student.score >= 80
                                ? "bg-green-500"
                                : student.score >= 60
                                ? "bg-yellow-500"
                                : student.score > 0
                                ? "bg-red-500"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${student.score}%` }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons - Same style as CreateQuizModal */}
            <View className="flex-row justify-end px-5 py-4 border-t border-gray-200 mt-4">
              <TouchableOpacity onPress={closeModal}>
                <Text className="text-primary font-semibold text-base">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {isTeacher ? (
        <>
          <ScrollView className="p-4">
            {isLoading ? (
              <View className="flex-1 justify-center items-center py-12">
                <Text className="text-gray-500 text-lg">Loading exercises...</Text>
              </View>
            ) : exercises && exercises.length > 0 ? (
              exercises.map((exercise) => (
                <TeacherExerciseCard
                  key={exercise.classExerciseId}
                  exercise={exercise}
                  classroomDetails={classroomDetails}
                  studentCount={studentCount}
                />
              ))
            ) : (
              <View className="flex-1 justify-center items-center px-6" style={{ minHeight: 400 }}>
                <Ionicons name="document-text-outline" size={48} color="#00BFAF" />
                <Text className="mt-4 text-gray-800 font-poppins-medium text-center text-lg">
                  You don't have any exercises assigned yet
                </Text>
                <Text className="mt-2 text-gray-600 text-center">
                  Assign exercises to get started
                </Text>
              </View>
            )}
          </ScrollView>
          <StudentDetailsModal />
        </>
      ) : (
        // Student View
        <ScrollView className="p-4">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-lg">Loading exercises...</Text>
            </View>
          ) : exercises && exercises.length > 0 ? (
            exercises.map((exercise, index) => (
              <StudentExerciseCard
                key={exercise.classExerciseId}
                exercise={{
                  ...exercise,
                  status: exercise.status,
                  score: calculateScore(
                    exercise.studentAnswers,
                    exercise.teacherAnswers
                  ),
                  correctAnswers: 20,
                  totalQuestions: exercise.teacherAnswers.length,
                  studentAnswers: exercise.studentAnswers,
                }}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center px-6" style={{ minHeight: 400 }}>
              <Ionicons name="document-text-outline" size={48} color="#00BFAF" />
              <Text className="mt-4 text-gray-800 font-poppins-medium text-center text-lg">
                No exercises assigned yet
              </Text>
              <Text className="mt-2 text-gray-600 text-center">
                Your teacher will assign exercises soon
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ExercisesTab;
