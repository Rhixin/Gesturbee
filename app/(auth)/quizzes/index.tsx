import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Image, ScrollView } from "react-native";

export default function Quizzes() {
  const progress = 70; // Percentage of progress

  // Determine the beehive image based on progress
  const beehiveImage = () => {
    if (progress >= 100) return require("@/assets/images/progress70.png");
    if (progress >= 50) return require("@/assets/images/progress70.png");
    return require("@/assets/images/progress70.png");
  };

  const dummyData = [
    {id: 1, title: "Quiz 1: A-E", class: "ASL01", progress: "70%"},
    {id: 2, title: "Quiz 2: F-K", class: "ASL02", progress: "70%"},
    {id: 3, title: "Quiz 3: L-Q", class: "ASL03", progress: "70%"},
    {id: 4, title: "Quiz 4: R-Z", class: "ASL04", progress: "70%"},
  ]

  return (
    <SafeAreaView className="pt-6 px-4 m-5">

      <Text className="text-3xl font-bold mb-5">Quizzes</Text>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
          {dummyData.map((item, index) => (
      <TouchableOpacity
        key={item.id}
        className="bg-white rounded-xl border border-[#00b8a9] p-4 mb-5 shadow-md shadow-black/10 w-[330px] h-auto mx-auto flex-row"
        activeOpacity={0.9}
      >
        <View className="flex-col items-center justify-center text-center">
          <Image
            source={beehiveImage()}
            className="w-[90px] h-[90px]"
          />

          <View className="flex-col items-center">
            <Text className="text-[10px] text-gray-500">Progress</Text>
            <Text className="text-[25px] text-green-500 font-bold">{progress}%</Text>
          </View>
        </View>

        <View className="mb-2 flex-1">
          <View className="flex-1 justify-center ml-4">
            <Text className="text-2xl font-poppins-bold mb-1">{item.title}</Text>
            <Text className="text-[16px] text-gray-700 mb-4 font-poppins-medium">Class: {item.class}</Text>
          </View>

          <View className="flex items-center justify-center px-2">
            <TouchableOpacity className="bg-[#FFD54F] py-1 px-6 rounded-full">
              <Text className="font-poppins-bold text-black text-center text-md py-2">Continue Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    ))}
      </ScrollView>
    </SafeAreaView>
  );
}
