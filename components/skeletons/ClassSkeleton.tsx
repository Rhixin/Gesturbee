import React from "react";
import { View } from "react-native";

const ClassSkeleton = () => {
  return (
    <>
      <View className="bg-gray-200 rounded-xl p-6 mb-4 animate-pulse">
        <View className="w-2/3 h-6 bg-gray-300 rounded mb-3" />
        <View className="flex-row items-center mb-4">
          <View className="w-4 h-4 bg-gray-300 rounded-full" />
          <View className="ml-2 w-1/3 h-4 bg-gray-300 rounded" />
        </View>
        <View className="w-24 h-8 bg-gray-300 rounded self-end" />
      </View>
    </>
  );
};

export default ClassSkeleton;
