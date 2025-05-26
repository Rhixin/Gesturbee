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
import Beehive from "./Beehive";

const ActivitiesTab = ({ isTeacher }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      id: 1,
      title: "Greetings",
      activitiesCreated: 1,
      submissions: 25,
      avgScore: 30,
      students: [
        {
          id: 1,
          name: "Alice Johnson",
          score: 85,
          submissionDate: "2024-01-15",
          status: "Completed",
        },
        {
          id: 2,
          name: "Bob Smith",
          score: 72,
          submissionDate: "2024-01-14",
          status: "Completed",
        },
        {
          id: 3,
          name: "Charlie Brown",
          score: 0,
          submissionDate: null,
          status: "Not Submitted",
        },
        {
          id: 4,
          name: "Diana Prince",
          score: 95,
          submissionDate: "2024-01-16",
          status: "Completed",
        },
        {
          id: 5,
          name: "Edward Wilson",
          score: 68,
          submissionDate: "2024-01-13",
          status: "Completed",
        },
      ],
    },
    {
      id: 2,
      title: "Alphabets",
      activitiesCreated: 1,
      submissions: 81,
      avgScore: 20,
      students: [
        {
          id: 1,
          name: "Alice Johnson",
          score: 45,
          submissionDate: "2024-01-18",
          status: "Completed",
        },
        {
          id: 2,
          name: "Bob Smith",
          score: 30,
          submissionDate: "2024-01-17",
          status: "Completed",
        },
        {
          id: 3,
          name: "Charlie Brown",
          score: 55,
          submissionDate: "2024-01-19",
          status: "Completed",
        },
        {
          id: 4,
          name: "Diana Prince",
          score: 78,
          submissionDate: "2024-01-20",
          status: "Completed",
        },
        {
          id: 5,
          name: "Edward Wilson",
          score: 0,
          submissionDate: null,
          status: "Not Submitted",
        },
      ],
    },
    {
      id: 3,
      title: "Numbers",
      activitiesCreated: 1,
      submissions: 90,
      avgScore: 100,
      students: [
        {
          id: 1,
          name: "Alice Johnson",
          score: 100,
          submissionDate: "2024-01-22",
          status: "Completed",
        },
        {
          id: 2,
          name: "Bob Smith",
          score: 95,
          submissionDate: "2024-01-21",
          status: "Completed",
        },
        {
          id: 3,
          name: "Charlie Brown",
          score: 88,
          submissionDate: "2024-01-23",
          status: "Completed",
        },
        {
          id: 4,
          name: "Diana Prince",
          score: 92,
          submissionDate: "2024-01-24",
          status: "Completed",
        },
        {
          id: 5,
          name: "Edward Wilson",
          score: 85,
          submissionDate: "2024-01-20",
          status: "Completed",
        },
      ],
    },
    {
      id: 4,
      title: "Numbers",
      activitiesCreated: 1,
      submissions: 80,
      avgScore: 100,
      students: [
        {
          id: 1,
          name: "Alice Johnson",
          score: 90,
          submissionDate: "2024-01-25",
          status: "Completed",
        },
        {
          id: 2,
          name: "Bob Smith",
          score: 85,
          submissionDate: "2024-01-24",
          status: "Completed",
        },
        {
          id: 3,
          name: "Charlie Brown",
          score: 0,
          submissionDate: null,
          status: "Not Submitted",
        },
        {
          id: 4,
          name: "Diana Prince",
          score: 95,
          submissionDate: "2024-01-26",
          status: "Completed",
        },
        {
          id: 5,
          name: "Edward Wilson",
          score: 88,
          submissionDate: "2024-01-23",
          status: "Completed",
        },
      ],
    },
  ];

  // Student activities data - activities they're enrolled in
  const studentActivities = [
    {
      id: 1,
      title: "Greetings",
      description: "Learn basic greetings and introductions",
      dueDate: "2024-02-15",
      status: "Completed",
      score: 85,
      submissionDate: "2024-01-15",
      totalQuestions: 10,
      correctAnswers: 8,
    },
    {
      id: 2,
      title: "Alphabets",
      description: "Master the English alphabet and pronunciation",
      dueDate: "2024-02-18",
      status: "Completed",
      score: 45,
      submissionDate: "2024-01-18",
      totalQuestions: 26,
      correctAnswers: 12,
    },
    {
      id: 3,
      title: "Numbers",
      description: "Learn numbers from 1 to 100",
      dueDate: "2024-02-22",
      status: "Completed",
      score: 100,
      submissionDate: "2024-01-22",
      totalQuestions: 20,
      correctAnswers: 20,
    },
    {
      id: 4,
      title: "Colors and Shapes",
      description: "Identify and name different colors and shapes",
      dueDate: "2024-02-25",
      status: "In Progress",
      score: null,
      submissionDate: null,
      totalQuestions: 15,
      correctAnswers: null,
    },
    {
      id: 5,
      title: "Basic Conversations",
      description: "Practice simple daily conversations",
      dueDate: "2024-02-28",
      status: "Not Started",
      score: null,
      submissionDate: null,
      totalQuestions: 12,
      correctAnswers: null,
    },
  ];

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
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

  // Category card component for teacher view
  const CategoryCard = ({ item }) => {
    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <Text className="text-xl font-semibold text-gray-700 mb-4">
          {item.title}
        </Text>

        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-col items-center">
            <Beehive percentage={item.activitiesCreated} isGeneral={true} />
            <Text className="text-xs text-gray-600 mt-1">Activities</Text>
            <Text className="text-sm font-bold text-gray-800">
              {item.activitiesCreated}
            </Text>
          </View>

          <View className="flex flex-col items-center">
            <Beehive percentage={item.submissions} isGeneral={false} />
            <Text className="text-xs text-gray-600 mt-1">Submissions</Text>
            <Text
              style={{ color: item.submissions < 50 ? "#e70606" : "#149304" }}
              className="text-sm font-bold"
            >
              {item.submissions}%
            </Text>
          </View>

          <View className="flex flex-col items-center">
            <Beehive percentage={item.avgScore} isGeneral={false} />
            <Text className="text-xs text-gray-600 mt-1">Avg. Score</Text>
            <Text
              style={{ color: item.avgScore < 50 ? "#e70606" : "#149304" }}
              className="text-sm font-bold"
            >
              {" "}
              {item.avgScore}%{" "}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-yellow-400 px-4 py-2 rounded-full"
            onPress={() => handleViewDetails(item)}
          >
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Student activity card component
  const StudentActivityCard = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "Completed":
          return "bg-green-100 text-green-500";
        case "In Progress":
          return "bg-yellow-100 text-yellow-700";
        case "Not Started":
          return "bg-gray-100 text-gray-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    const getScoreColor = (score) => {
      if (score >= 80) return "text-green-600";
      if (score >= 60) return "text-yellow-600";
      if (score > 0) return "text-red-600";
      return "text-gray-400";
    };

    const getActionButton = () => {
      switch (activity.status) {
        case "Completed":
          return (
            <TouchableOpacity className="bg-secondary px-4 py-2 rounded-full">
              <Text className="text-white font-medium">View Results</Text>
            </TouchableOpacity>
          );
        case "In Progress":
          return (
            <TouchableOpacity className="bg-orange-500 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">Continue</Text>
            </TouchableOpacity>
          );
        case "Not Started":
          return (
            <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">Start Activity</Text>
            </TouchableOpacity>
          );
        default:
          return null;
      }
    };

    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-700 mb-2">
              {activity.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {activity.description}
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Due: {activity.dueDate}
            </Text>
            
            {/* Status Badge */}
            <View
              className={`px-3 py-1 rounded-full self-start ${getStatusColor(
                activity.status
              )}`}
            >
              <Text className="text-xs font-medium">{activity.status}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-4">
          {/* Performance Stats */}
          <View className="flex-row space-x-6">
            {activity.score !== null && (
              <View className="items-center"  style={{ marginRight: 20}}>
                <Text className={`text-lg  font-bold ${getScoreColor(activity.score)}`}  style={{ marginLeft: 2}}>
                  {activity.score}%
                </Text>
                <Text className="text-xs text-gray-600">Score</Text>
              </View>
            )}
            
            {activity.correctAnswers !== null && (
              <View className="items-center"  style={{ marginRight: 20}}>
                <Text className="text-lg font-semibold text-gray-700">
                  {activity.correctAnswers}/{activity.totalQuestions}
                </Text>
                <Text className="text-xs text-gray-600">Correct</Text>
              </View>
            )}
            
            <View className="items-center">
              <Text className="text-lg font-semibold text-gray-700">
                {activity.totalQuestions}
              </Text>
              <Text className="text-xs text-gray-600">Questions</Text>
            </View>
          </View>

          {/* Action Button */}
          {getActionButton()}
        </View>

        {/* Progress Bar for completed activities */}
        {activity.score !== null && (
          <View className="mt-3">
            <View className="w-full bg-gray-200 rounded-full h-2">
              <View
                className={`h-2 rounded-full ${
                  activity.score >= 80
                    ? "bg-green-500"
                    : activity.score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${activity.score}%` }}
              />
            </View>
          </View>
        )}

        {/* Submission Date for completed activities */}
        {activity.submissionDate && (
          <Text className="text-xs text-gray-500 mt-2">
            Submitted on: {activity.submissionDate}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {isTeacher ? (
        <>
          <ScrollView className="p-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} item={category} />
            ))}
          </ScrollView>
          <StudentDetailsModal />
        </>
      ) : (
        // Student View
        <ScrollView className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            My Activities
          </Text>
          {studentActivities.map((activity) => (
            <StudentActivityCard key={activity.id} activity={activity} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ActivitiesTab;