import React from "react";
import { View } from "react-native";

const QuizSkeleton = () => (
  <View className="bg-white rounded-lg p-4 mx-4 mt-4 flex-row shadow-sm border border-gray-200">
    <View className="items-center justify-center">
      {/* Beehive skeleton */}
      <View className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
    </View>

    <View className="flex-1 ml-4 justify-between">
      <View>
        {/* Title skeleton */}
        <View className="h-5 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
        {/* Type skeleton */}
        <View className="h-4 bg-gray-200 rounded mb-2 w-1/2 animate-pulse" />
        {/* Question count skeleton */}
        <View className="h-3 bg-gray-200 rounded mb-2 w-1/3 animate-pulse" />
        {/* Description skeleton */}
        <View className="h-3 bg-gray-200 rounded mb-1 w-full animate-pulse" />
        <View className="h-3 bg-gray-200 rounded mb-2 w-4/5 animate-pulse" />
      </View>

      {/* Button skeleton */}
      <View className="h-8 bg-gray-200 rounded-full w-full animate-pulse" />
    </View>
  </View>
);

export default QuizSkeleton;
