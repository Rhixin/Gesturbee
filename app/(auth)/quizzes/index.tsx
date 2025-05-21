import Beehive from "@/components/Beehive";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Quizzes() {
  const progress = 70;

  const beehiveImage = () => {
    return require("@/assets/images/progress70.png");
  };

  const dummyData = [
    { id: 1, title: "Quiz 1: A-E", class: "ASL01", progress: 20 },
    { id: 2, title: "Quiz 2: F-K", class: "ASL02", progress: 30 },
    { id: 3, title: "Quiz 3: L-Q", class: "ASL03", progress: 80 },
    { id: 4, title: "Quiz 4: R-Z", class: "ASL04", progress: 60 },
  ];

  const router = useRouter();
  
  const navigateToQuiz = (id: number) => {
    router.push(`/quizzes/${id}`);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="px-6 pt-10 flex-row justify-between items-center z-50 bg-white  shadow-sm">
        <Text className="text-3xl font-poppins-bold  text-titlegray">
          Quizzes
        </Text>
      </SafeAreaView>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        {dummyData.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-lg p-4 mx-4 mt-4 flex-row shadow-sm border border-gray-200"
            activeOpacity={0.9}
            
          >
            <View className="items-center justify-center">
              <Beehive percentage={progress} isGeneral={false}></Beehive>
              <View className="items-center mt-2">
                <Text className="text-[10px] text-gray-500">Progress</Text>
                <Text className="text-[20px] text-green-500 font-bold">
                  {progress}%
                </Text>
              </View>
            </View>

            <View className="flex-1 ml-4 justify-between">
              <View>
                <Text className="text-lg font-poppins-medium mb-1">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-700 font-poppins-medium mb-2">
                  Class: {item.class}
                </Text>
              </View>

              <TouchableOpacity className="bg-yellow-400 py-2 px-6 rounded-full self-start mb-2 w-full" onPress={() => navigateToQuiz(item.id)}>
                <Text className="font-poppins-medium text-white text-center text-sm">
                  Continue Progress
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}