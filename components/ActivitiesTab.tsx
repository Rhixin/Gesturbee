import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React from "react";
import Beehive from "./Beehive";

const ActivitiesTab = () => {
  const categories = [
    {
      id: 1,
      title: "Greetings",
      activitiesCreated: 1,
      submissions: 25,
      avgScore: 30,
    },
    {
      id: 2,
      title: "Alphabets",
      activitiesCreated: 1,
      submissions: 81,
      avgScore: 20,
    },
    {
      id: 3,
      title: "Numbers",
      activitiesCreated: 1,
      submissions: 90,
      avgScore: 100,
    },
    {
      id: 4,
      title: "Numbers",
      activitiesCreated: 1,
      submissions: 80,
      avgScore: 100,
    },
  ];

  // Category card component
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

          <TouchableOpacity className="bg-yellow-400 px-4 py-2 rounded-full">
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} item={category} />
      ))}
    </ScrollView>
  );
};

export default ActivitiesTab;
