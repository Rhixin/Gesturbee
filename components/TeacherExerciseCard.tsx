import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Beehive from "./Beehive";

const TeacherExerciseCard = ({ exercise }) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      <Text className="text-xl font-semibold text-gray-700 mb-4">
        {exercise.exerciseTitle}
      </Text>

      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-col items-center">
          <Beehive percentage={12} isGeneral={true} />
          <Text className="text-xs text-gray-600 mt-1">Exercises</Text>
          <Text className="text-sm font-bold text-gray-800">{12}</Text>
        </View>

        <View className="flex flex-col items-center">
          <Beehive percentage={43} isGeneral={false} />
          <Text className="text-xs text-gray-600 mt-1">Submissions</Text>
          <Text
            style={{ color: 80 < 50 ? "#e70606" : "#149304" }}
            className="text-sm font-bold"
          >
            {80}%
          </Text>
        </View>

        <View className="flex flex-col items-center">
          <Beehive percentage={60} isGeneral={false} />
          <Text className="text-xs text-gray-600 mt-1">Avg. Score</Text>
          <Text
            style={{ color: 60 < 50 ? "#e70606" : "#149304" }}
            className="text-sm font-bold"
          >
            {" "}
            {60}%{" "}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-yellow-400 px-4 py-2 rounded-full"
          onPress={() => handleViewDetails(exercise.id)}
        >
          <Text className="text-white font-medium">View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TeacherExerciseCard;
