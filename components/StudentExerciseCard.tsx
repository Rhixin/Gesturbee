import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import Beehive from "./Beehive";

const StudentExerciseCard = ({ exercise }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return {
          backgroundColor: "#dcfce7",
          color: "#22c55e",
        };
      case "In Progress":
        return {
          backgroundColor: "#fef9c3", // Tailwind's yellow-100
          color: "#a16207", // Tailwind's yellow-700
        };
      case "Not Started":
      default:
        return {
          backgroundColor: "#f3f4f6", // Tailwind's gray-100
          color: "#374151", // Tailwind's gray-700
        };
    }
  };

  const getScoreStyle = (score) => {
    if (score >= 80) return { backgroundColor: "#dcfce7", color: "#16a34a" }; // green
    if (score >= 60) return { backgroundColor: "#fef9c3", color: "#ca8a04" }; // yellow
    if (score > 0) return { backgroundColor: "#fee2e2", color: "#dc2626" }; // red
    return { backgroundColor: "#f3f4f6", color: "#9ca3af" }; // gray
  };

  // Helper function to get the percentage for Beehive component
  const getActivityPercentage = (exercise) => {
    if (exercise.status === "Completed" && exercise.score !== null) {
      return exercise.score;
    } else if (exercise.status === "In Progress") {
      return 10; //default ni for the inprogress
    } else {
      return 0; // Not started
    }
  };

  const getActionButton = () => {
    switch (exercise.status) {
      case "Completed":
        return (
          <TouchableOpacity
            style={{
              backgroundColor: "#16a34a",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "500" }}>
              View Results
            </Text>
          </TouchableOpacity>
        );
      case "In Progress":
        return (
          <TouchableOpacity
            style={{
              backgroundColor: "#FBBC05",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "500",
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        );
      case "Not Started":
        return (
          <TouchableOpacity
            style={{
              backgroundColor: "#2563eb",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
            }}
          >
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
            {exercise.exerciseTitle}
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            {exercise.exerciseDescription}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            Due: {exercise.dueDate}
          </Text>

          {/* Status Badge */}
          <View
            className={`px-3 py-1 rounded-full self-start}`}
            style={getStatusColor(exercise.status)}
          >
            <Text className="text-xs font-medium">{exercise.status}</Text>
          </View>
        </View>

        {/* Beehive Progress Indicator */}
        <View className="items-center ml-4">
          <Beehive
            percentage={getActivityPercentage(exercise)}
            isGeneral={false}
          />
          <Text className="text-xs text-gray-600 mt-1">Score</Text>
          <Text
            style={{
              color:
                getActivityPercentage(exercise) < 50 ? "#e70606" : "#149304",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {getActivityPercentage(exercise)}%
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        {/* Performance Stats */}
        <View className="flex-row space-x-6">
          {/* {activity.score !== null && (
              <View className="items-center"  style={{ marginRight: 20}}>
                <Text style={[{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 }, getScoreStyle(activity.score)]}>
  {activity.score}%
</Text>

                <Text className="text-xs text-gray-600">Score</Text>
              </View>
            )} */}

          {exercise.correctAnswers !== null && (
            <View className="items-center" style={{ marginRight: 20 }}>
              <Text className="text-lg font-semibold text-gray-700">
                {exercise.correctAnswers}/{exercise.totalQuestions}
              </Text>
              <Text className="text-xs text-gray-600">Correct</Text>
            </View>
          )}

          <View className="items-center">
            <Text className="text-lg font-semibold text-gray-700">
              {exercise.totalQuestions}
            </Text>
            <Text className="text-xs text-gray-600">Questions</Text>
          </View>
        </View>

        {/* Action Button */}
        {getActionButton()}
      </View>

      {/* Progress Bar for completed activities */}
      {exercise.score !== null && (
        <View style={{ marginTop: 12 }}>
          <View
            style={{
              width: "100%",
              backgroundColor: "#e5e7eb",
              borderRadius: 999,
              height: 8,
            }}
          >
            <View
              style={{
                height: 8,
                borderRadius: 999,
                width: `${exercise.score}%`,
                backgroundColor:
                  exercise.score >= 80
                    ? "#22c54a" // green-500
                    : exercise.score >= 60
                    ? "#eab308" // yellow-500
                    : "#ef4444", // red-500
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default StudentExerciseCard;
