import React, { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import AddStudentModal from "@/components/classroom/AddStudentModal";
import NotificationButton from "@/components/classroom/NotificationButton";
import AssignActivityModal from "@/components/classroom/AssignExerciseModal";
import RemoveStudentModal from "@/components/classroom/RemoveStudentModal";
import ExercisesTab from "@/components/classroom/ExercisesTab";
import { useToast } from "@/context/ToastContext";
import ClassRoomService from "@/api/services/classroom-service";
import { useAuth } from "@/context/AuthContext";
import ExerciseService from "@/api/services/exercise-service";
import AssignExerciseModal from "@/components/classroom/AssignExerciseModal";
import ExerciseSkeleton from "@/components/skeletons/ExerciseSkeleton";

const Classroom = () => {
  const formatExerciseType = (type) => {
    switch (type) {
      case "MultipleChoice":
        return { label: "Multiple Choice", color: "bg-blue-100 text-blue-700", icon: "list" };
      case "Execution":
        return { label: "Execution Type", color: "bg-green-100 text-green-700", icon: "play" };
      default:
        return { label: type || "Exercise", color: "bg-gray-100 text-gray-700", icon: "document-text" };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status) => {
    return status === "completed" ? "text-green-600" : "text-orange-500";
  };

  const { classId } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Exercises");
  const [isTeacher, setIsTeacher] = useState(false);
  const tabs = isTeacher ? ["Students", "Exercises", "Grades"] : ["Exercises"];

  const navigateToTab = (tab) => {
    setActiveTab(tab);
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
  const [assignedExercises, setAssignedExercises] = useState(null);
  const [notAssignedExercises, setNotAssignedExercises] = useState(null);
  const [gradesData, setGradesData] = useState(null);
  const [expandedExercises, setExpandedExercises] = useState(new Set());

  // Toggle exercise expansion
  const toggleExerciseExpansion = (exerciseId) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  // apis
  const fetchClassroom = async () => {
    const response = await ClassRoomService.getClassroom(classId);

    if (response.success) {
      console.log("Classroom data:", response.data); // Debug log
      setClassroomDetails(response.data);
      if (currentUser?.id === response.data?.teacherId) {
        setIsTeacher(true);
      } else {
        setIsTeacher(false);
      }
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const fetchStudents = async () => {
    const response = await ClassRoomService.getAllStudentsInThisClass(
      classId,
      showToast
    );

    if (response.success) {
      setStudents(response.data);
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const fetchEnrollmentRequests = async () => {
    const response = await ClassRoomService.getAllEnrollmentRequests(classId);

    if (response.success) {
      setEnrollmentRequests(response.data);
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const fetchAllUsersNotEnrolled = async () => {
    const response = await ClassRoomService.getAllUsersNotEnrolled(classId);

    if (response.success) {
      setAllUsers(response.data);
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const fetchAssignedExercises = async () => {
    try {
      const response = await ExerciseService.getAssignedExercise(classId);

      if (response.success) {
        const responseAnswers = await Promise.all(
          response.data.map(async (exercise) => {
            const studentAnswers =
              await ClassRoomService.getStudentClassExerciseAnswers(
                currentUser.id,
                exercise.classExerciseId
              );

            const teacherAnswers = await ExerciseService.getSpecificExercise(
              exercise.exerciseId
            );

            if (!studentAnswers.success) {
              throw Error(studentAnswers.message);
            }

            if (!teacherAnswers.success) {
              throw Error(teacherAnswers.message);
            }

            let status = "Complete";

            if (studentAnswers.data.length == 0) {
              status = "NotComplete";
            }

            return {
              ...exercise,
              studentAnswers: studentAnswers.data,
              teacherAnswers: teacherAnswers.data.exerciseItems,
              status: status,
            };
          })
        );

        console.log(responseAnswers);

        setAssignedExercises(responseAnswers);
        return responseAnswers;
      } else {
        throw Error(response.message);
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const fetchNotAssignedExercises = async () => {
    const response = await ExerciseService.getAllUnassignedExercise(
      classId,
      currentUser.id
    );

    if (response.success) {
      setNotAssignedExercises(response.data);
    } else {
      showToast(response.message, "error");
    }

    return response.data;
  };

  const fetchAllClassAnswers = async (studentsData, assignedExercisesData) => {
    const allAnswers = await Promise.all(
      assignedExercisesData.map(async (exercise) => {
        const studentAnswerList = await Promise.all(
          studentsData.map(async (student) => {
            const studentAnswers =
              await ClassRoomService.getStudentClassExerciseAnswers(
                student.id,
                exercise.classExerciseId
              );

            const answers = studentAnswers.success
              ? studentAnswers.data ?? []
              : [];

            // Calculate score from answers (assuming .score exists per item)
            let totalScore = 0;
            let totalItems = 0;

            // Calculate score using frontend logic (same as ExercisesTab)
            if (exercise.teacherAnswers && answers.length > 0) {
              for (let i = 0; i < exercise.teacherAnswers.length; i++) {
                if (answers[i]) {
                  // Handle different answer formats
                  const studentAnswer = answers[i].answer || answers[i];
                  const teacherAnswer = exercise.teacherAnswers[i].correctAnswer;
                  
                  console.log(`Question ${i}: Student="${studentAnswer}" vs Teacher="${teacherAnswer}"`);
                  
                  if (studentAnswer == teacherAnswer) {
                    totalScore++;
                    console.log(`✓ Correct!`);
                  } else {
                    console.log(`✗ Wrong`);
                  }
                  totalItems++;
                }
              }
            }

            // Store both correct answers and total items for display
            const finalScore = totalItems > 0 ? {
              correct: totalScore,
              total: totalItems,
              percentage: Math.round((totalScore / totalItems) * 100)
            } : null;

            console.log(`Student ${student.firstName} final calculation:`, {
              answersLength: answers.length,
              totalScore,
              totalItems,
              finalScore,
              status: answers.length > 0 ? "Completed" : "Pending"
            });

            return {
              studentId: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              score: finalScore, // e.g., 85 or null
              status: answers.length > 0 ? "Completed" : "Pending",
            };
          })
        );

        const studentsWhoAnswered = studentAnswerList.filter(
          (s) => s.status === "Completed"
        ).length;

        // Only calculate average for students who completed the exercise
        const completedStudents = studentAnswerList.filter(
          (s) => s.status === "Completed" && s.score !== null && typeof s.score === "object"
        );

        const avgScoreTotal = completedStudents.reduce((sum, s) => sum + s.score.percentage, 0);
        const scoreCount = completedStudents.length;

        const averageScore =
          scoreCount > 0 ? (avgScoreTotal / scoreCount).toFixed(2) : "0.00";

        console.log(`Exercise ${exercise.exerciseTitle} stats:`, {
          totalStudents: studentAnswerList.length,
          completedStudents: completedStudents.length,
          studentsWhoAnswered,
          avgScoreTotal,
          scoreCount,
          averageScore,
          completedScores: completedStudents.map(s => s.score)
        });

        return {
          ...exercise,
          allStudents: studentAnswerList,
          studentsWhoAnswered,
          averageScore,
        };
      })
    );

    console.log(allAnswers);
    setGradesData(allAnswers);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        classroomData,
        studentsData,
        enrollmentRequestsData,
        allUsersData,
        notAssignedExercisesData,
        assignedExercisesData,
      ] = await Promise.all([
        fetchClassroom(),
        fetchStudents(),
        fetchEnrollmentRequests(),
        fetchAllUsersNotEnrolled(),
        fetchNotAssignedExercises(),
        fetchAssignedExercises(),
      ]);

      if (
        !classroomData ||
        !studentsData ||
        !enrollmentRequestsData ||
        !allUsersData ||
        !notAssignedExercisesData ||
        !assignedExercisesData
      ) {
        throw new Error("Failed to load required data");
      }

      fetchAllClassAnswers(studentsData, assignedExercisesData);
    } catch (error) {
      showToast("Failed to load classroom data", "error");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (classroomDetails && currentUser) {
      if (!isTeacher && activeTab !== "Exercises") {
        setActiveTab("Exercises");
      }

      if (
        isTeacher &&
        !["Students", "Exercises", "Grades"].includes(activeTab)
      ) {
        setActiveTab("Students");
      }
    }
  }, [classroomDetails, currentUser]);

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
            {/* Only show remove button for teachers */}
            {isTeacher && (
              <TouchableOpacity
                onPress={() => showRemoveStudentModal(student.id)}
              >
                <Ionicons name="person-remove" size={20} color="#F2A800" />
              </TouchableOpacity>
            )}
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

          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-poppins-bold text-blue-600">
                {students?.length || 0}
              </Text>
              <Text className="text-sm text-gray-600 font-poppins">
                Students
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-poppins-bold text-green-600">
                {assignedExercises.length}
              </Text>
              <Text className="text-sm text-gray-600 font-poppins">
                Exercises
              </Text>
            </View>
          </View>
        </View>

        {/* Exercises with Grades */}
        <Text className="text-xl font-poppins-bold text-gray-800 mb-3">
          Exercises Grades
        </Text>

        {gradesData.map((exercise) => {
          const isExpanded = expandedExercises.has(exercise.exerciseId);
          
          return (
            <View
              key={exercise.exerciseId}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
            >
              {/* Clickable Activity Header */}
              <TouchableOpacity
                onPress={() => toggleExerciseExpansion(exercise.exerciseId)}
                className="flex-row items-center justify-between mb-3"
              >
                <View className="flex-1">
                  <Text className="text-lg font-poppins-medium text-gray-800">
                    {exercise.exerciseTitle}
                  </Text>
                  {/* Type badge */}
                  <View className="flex-row items-center mt-1">
                    {(() => {
                      const typeInfo = formatExerciseType(exercise.type);
                      return (
                        <View className={`flex-row items-center px-2 py-1 rounded-full ${typeInfo.color}`}>
                          <Ionicons 
                            name={typeInfo.icon} 
                            size={12} 
                            color={typeInfo.color.includes('blue') ? '#1d4ed8' : 
                                   typeInfo.color.includes('green') ? '#047857' : '#374151'} 
                            style={{ marginRight: 4 }}
                          />
                          <Text className={`text-xs font-poppins-medium ${typeInfo.color.split(' ')[1]}`}>
                            {typeInfo.label}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                </View>
                <View className="items-end mr-3">
                  <Text className="text-sm font-poppins-medium text-gray-600">
                    {exercise?.studentsWhoAnswered} / {students?.length} completed
                  </Text>
                  {exercise?.averageScore && (
                    <Text className={`text-lg font-poppins-bold}`}>
                      Avg: {exercise.averageScore}%
                    </Text>
                  )}
                </View>
                {/* Expand/Collapse Icon */}
                <View className="ml-2">
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#6B7280" 
                  />
                </View>
              </TouchableOpacity>

              {/* Collapsible Content */}
              {isExpanded && (
                <>
                  {/* Progress Bar */}
                  <View className="bg-gray-200 rounded-full h-2 mb-3">
                    <View
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (exercise.studentsWhoAnswered /
                            exercise.allStudents.length) *
                          100
                        }%`,
                      }}
                    />
                  </View>

                  {/* Student Grades */}
                  <View className="border-t border-gray-100 pt-3">
              {exercise.allStudents.map((student) => (
                <View
                  key={student.studentId}
                  className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-100"
                >
                  <View className="flex-row items-center justify-between">
                    {/* Student Info */}
                    <View className="flex-1">
                      <Text className="text-lg font-poppins-medium text-gray-800 mb-1">
                        {student.firstName + " " + student.lastName}
                      </Text>
                      <View className="flex-row items-center">
                        <View
                          className={`px-2 py-1 rounded-full ${
                            student.status === "Completed" 
                              ? "bg-green-100" 
                              : "bg-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-xs font-poppins-medium ${
                              student.status === "Completed"
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                          >
                            {student.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Score Display */}
                    <View className="items-center ml-4">
                      {student.score !== null && typeof student.score === "object" ? (
                        <>
                          <View
                            className={`px-4 py-2 rounded-lg ${
                              student.score.percentage >= 80
                                ? "bg-green-100"
                                : student.score.percentage >= 60
                                ? "bg-yellow-100"
                                : "bg-red-100"
                            }`}
                          >
                            <Text
                              className={`text-xl font-poppins-bold ${
                                student.score.percentage >= 80
                                  ? "text-green-700"
                                  : student.score.percentage >= 60
                                  ? "text-yellow-700"
                                  : "text-red-700"
                              }`}
                            >
                              {student.score.correct}/{student.score.total}
                            </Text>
                          </View>
                          <Text className="text-xs text-gray-500 mt-1 font-poppins">
                            {student.score.percentage}% correct
                          </Text>
                        </>
                      ) : (
                        <View className="px-4 py-2 rounded-lg bg-gray-200">
                          <Text className="text-xl font-poppins-bold text-gray-500">
                            --
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Progress Bar for Individual Student */}
                  {student.score !== null && typeof student.score === "object" && (
                    <View className="mt-3">
                      <View className="bg-gray-200 rounded-full h-2">
                        <View
                          className={`h-2 rounded-full ${
                            student.score.percentage >= 80
                              ? "bg-green-500"
                              : student.score.percentage >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${student.score.percentage}%` }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Students":
        return isTeacher ? (
          renderStudents()
        ) : isLoading ? (
          <ExerciseSkeleton></ExerciseSkeleton>
        ) : (
          <ExercisesTab 
            isTeacher={isTeacher} 
            exercises={assignedExercises} 
            classroomDetails={classroomDetails}
            studentCount={students?.length || 0}
            isLoading={isLoading}
          />
        );
      case "Exercises":
        return isLoading ? (
          <ExerciseSkeleton></ExerciseSkeleton>
        ) : (
          <>
            {console.log("DEBUG - Exercises tab data:", {
              classroomDetails,
              studentCount: students?.length || 0,
              studentsArray: students,
              assignedExercises: assignedExercises?.length
            })}
            <ExercisesTab 
              isTeacher={isTeacher} 
              exercises={isTeacher ? gradesData : assignedExercises} 
              classroomDetails={classroomDetails}
              studentCount={students?.length || 0}
              isLoading={isLoading}
            />
          </>
        );
      case "Grades":
        return isTeacher ? (
          renderGrades()
        ) : isLoading ? (
          <ExerciseSkeleton></ExerciseSkeleton>
        ) : (
          <ExercisesTab 
            isTeacher={isTeacher} 
            exercises={assignedExercises} 
            classroomDetails={classroomDetails}
            studentCount={students?.length || 0}
            isLoading={isLoading}
          />
        );
      default:
        return isLoading ? (
          <ExerciseSkeleton></ExerciseSkeleton>
        ) : (
          <ExercisesTab 
            isTeacher={isTeacher} 
            exercises={assignedExercises} 
            classroomDetails={classroomDetails}
            studentCount={students?.length || 0}
            isLoading={isLoading}
          />
        );
    }
  };

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
              <View className="items-center">
                <View className="h-6 w-32 bg-gray-300 rounded-md animate-pulse mb-1" />
                <View className="h-4 w-24 bg-gray-300 rounded-md animate-pulse" />
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xl font-poppins-bold text-center text-secondary">
                  {classroomDetails?.className}
                </Text>
                {/* Teacher name */}
                {classroomDetails?.teacher?.profile ? (
                  <Text className="text-sm font-poppins text-gray-600 mt-1">
                    Teacher: {classroomDetails.teacher.profile.firstName} {classroomDetails.teacher.profile.lastName}
                  </Text>
                ) : classroomDetails?.teacherId ? (
                  <Text className="text-sm font-poppins text-gray-600 mt-1">
                    Teacher ID: {classroomDetails.teacherId}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          <View className="flex-row items-center ml-4">
            {isLoading ? (
              <View className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
            ) : (
              // Only show notification button for teachers
              isTeacher && (
                <NotificationButton
                  handleAcceptRequest={handleAddStudents}
                  enrollmentRequestsProfile={enrollmentRequests}
                  classId={classId}
                  loadData={loadData}
                />
              )
            )}

            {/* Only show settings for teachers */}
            {isTeacher && (
              <TouchableOpacity
                accessibilityLabel="Settings"
                accessibilityRole="button"
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            )}
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
        {/* Add Student Button - Only show on Students tab for teachers */}
        {activeTab === "Students" && isTeacher && (
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

        {/* Add Activity Button - Only show on Exercises tab for teachers */}
        {activeTab === "Exercises" && isTeacher && (
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

      {/* Only show assign activity modal for teachers */}
      {!isLoading && isTeacher && (
        <AssignExerciseModal
          modalVisible={assignActivityModalVisible}
          setModalVisible={setAssignActivityModalVisible}
          exercises={notAssignedExercises}
          loadData={loadData}
        />
      )}

      {/* Only show add student modal for teachers */}
      {!isLoading && isTeacher && (
        <AddStudentModal
          modalVisible={addStudentModalVisible}
          setModalVisible={setAddStudentModalVisible}
          onAddStudents={handleAddStudents}
          allUsers={allUsers.filter((user) => user.id !== currentUser.id)}
          studentsAlreadyAdded={students}
          loadData={loadData}
          classId={classId}
          classroomDetails={classroomDetails}
        />
      )}

      {/* Only show remove student modal for teachers */}
      {isTeacher && (
        <RemoveStudentModal
          modalVisible={removeStudentModalVisible}
          setModalVisible={setRemoveStudentModalVisible}
          studentId={selectedStudentId}
          students={students || []}
          loadData={loadData}
          classId={classId}
        />
      )}
    </View>
  );
};

export default Classroom;
