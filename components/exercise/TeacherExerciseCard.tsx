import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Beehive from "@/components/animations/Beehive";
import ExerciseDetails from "@/components/exercise/ExerciseDetails";

const TeacherExerciseCard = ({ exercise, classroomDetails, studentCount }) => {
  const [visible, setVisible] = useState(false);
  
  // Format exercise type
  const formatExerciseType = (type) => {
    switch (type) {
      case "MultipleChoice":
        return { label: "Multiple Choice", color: "bg-blue-100 text-blue-700", icon: "list" };
      case "Execution":
        return { label: "Execution Type", color: "bg-green-100 text-green-700", icon: "play" };
      default:
        return { label: "Exercise", color: "bg-gray-100 text-gray-700", icon: "document-text" };
    }
  };
  
  // Calculate submission percentage (how many students answered)
  const studentsWhoAnswered = exercise.studentsWhoAnswered || 0;
  const submissionPercentage = studentCount > 0 
    ? Math.round((studentsWhoAnswered / studentCount) * 100)
    : 0;
  
  // Get average score as a number
  const avgScore = Math.round(parseFloat(exercise.averageScore) || 0);
  
  // Debug logging
  console.log("TeacherExerciseCard data:", {
    exercise: exercise?.exerciseTitle,
    studentsWhoAnswered: exercise.studentsWhoAnswered,
    studentCount,
    submissionPercentage,
    avgScore
  });
  
  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      <View className="mb-4">
        <Text className="text-xl font-semibold text-gray-700 mb-2">
          {exercise.exerciseTitle}
        </Text>
        
        {/* Type badge */}
        <View className="flex-row items-center mb-3">
          {(() => {
            const typeInfo = formatExerciseType(exercise.type);
            return (
              <View className={`flex-row items-center px-3 py-1 rounded-full ${typeInfo.color}`}>
                <Ionicons 
                  name={typeInfo.icon} 
                  size={14} 
                  color={typeInfo.color.includes('blue') ? '#1d4ed8' : 
                         typeInfo.color.includes('green') ? '#047857' : '#374151'} 
                  style={{ marginRight: 4 }}
                />
                <Text className={`text-xs font-medium ${typeInfo.color.split(' ')[1]}`}>
                  {typeInfo.label}
                </Text>
              </View>
            );
          })()}
        </View>
        
        {/* Classroom Information */}
        {classroomDetails && (
          <View className="bg-gray-50 p-3 rounded-lg mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-medium text-gray-800">
                {classroomDetails.className}
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-700 text-xs font-medium">
                  {studentCount} Student{studentCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            
            {classroomDetails.classDescription && (
              <Text className="text-gray-600 text-sm mb-2">
                {classroomDetails.classDescription}
              </Text>
            )}
            
            {classroomDetails.teacher?.profile && (
              <Text className="text-gray-500 text-sm">
                Teacher: {classroomDetails.teacher.profile.firstName} {classroomDetails.teacher.profile.lastName}
              </Text>
            )}
          </View>
        )}
      </View>

      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-col items-center">
          <Beehive percentage={submissionPercentage} isGeneral={false} />
          <Text className="text-xs text-gray-600 mt-1">Submissions</Text>
          <Text
            style={{ color: submissionPercentage < 50 ? "#e70606" : "#149304" }}
            className="text-sm font-bold"
          >
            {studentsWhoAnswered}/{studentCount}
          </Text>
          <Text className="text-xs text-gray-500">
            ({submissionPercentage}%)
          </Text>
        </View>

        <View className="flex flex-col items-center">
          <Beehive percentage={avgScore} isGeneral={false} />
          <Text className="text-xs text-gray-600 mt-1">Avg. Score</Text>
          <Text
            style={{ color: avgScore < 50 ? "#e70606" : "#149304" }}
            className="text-sm font-bold"
          >
            {avgScore}%
          </Text>
        </View>

        <TouchableOpacity
          className="bg-yellow-400 px-4 py-2 rounded-full"
          onPress={() => setVisible(!visible)}
        >
          <Text className="text-white font-medium">View Details</Text>
        </TouchableOpacity>
      </View>

      <ExerciseDetails
        visible={visible}
        exerciseId={exercise.exerciseId}
        onClose={() => setVisible(!visible)}
      />
    </View>
  );
};

export default TeacherExerciseCard;
