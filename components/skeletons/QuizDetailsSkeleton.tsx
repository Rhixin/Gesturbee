import React from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";

const SkeletonBox = ({
  width,
  height,
  className = "",
}: {
  width: string | number;
  height: string | number;
  className?: string;
}) => (
  <View
    className={`bg-gray-200 rounded ${className}`}
    style={{ width, height }}
  />
);

const HeaderSkeleton = () => (
  <View className="flex-row justify-between items-start p-6 border-b border-gray-200">
    <View className="flex-1 mr-4">
      <SkeletonBox width="80%" height={32} className="mb-2" />
      <View className="flex-row items-center mb-2">
        <SkeletonBox width={100} height={24} className="rounded-full mr-3" />
        <SkeletonBox width={80} height={24} className="rounded-full" />
      </View>
      <SkeletonBox width="60%" height={16} />
    </View>
    <TouchableOpacity
      onPress={() => {}}
      className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center"
    >
      <Text className="text-gray-600 text-xl font-bold">×</Text>
    </TouchableOpacity>
  </View>
);

const QuestionSkeleton = ({ index }: { index: number }) => (
  <View className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
    {/* Question Header */}
    <View className="flex-row items-center mb-3">
      <SkeletonBox width="85%" height={20} />
    </View>

    {/* Answer Choices Skeleton */}
    <View className="space-y-2">
      {[0, 1, 2, 3].map((choice) => (
        <View
          key={choice}
          className="p-4 rounded-md mb-2 bg-white border border-gray-200"
        >
          <SkeletonBox width="70%" height={16} />
        </View>
      ))}
    </View>

    {/* Correct Answer Skeleton */}
    <View className="mt-3 bg-gray-100 p-2 rounded-lg">
      <SkeletonBox width="60%" height={16} className="mx-auto" />
    </View>
  </View>
);

const ContentSkeleton = () => (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: 24 }}
    showsVerticalScrollIndicator={false}
  >
    {/* Description Skeleton */}
    <View className="mb-6">
      <SkeletonBox width="30%" height={20} className="mb-2" />
      <View className="bg-gray-50 p-4 rounded-lg">
        <SkeletonBox width="100%" height={16} className="mb-2" />
        <SkeletonBox width="80%" height={16} />
      </View>
    </View>

    {/* Questions Section Skeleton */}
    <View className="mb-4">
      <SkeletonBox width="25%" height={20} className="mb-4" />
      {[0, 1, 2].map((index) => (
        <QuestionSkeleton key={index} index={index} />
      ))}
    </View>
  </ScrollView>
);

const FooterSkeleton = () => (
  <View className="flex-row justify-between items-center p-6 border-t border-gray-200">
    <View className="flex-row space-x-4">
      <SkeletonBox width={100} height={32} className="rounded-lg" />
      <SkeletonBox width={120} height={32} className="rounded-lg" />
    </View>
    <SkeletonBox width={80} height={40} className="rounded-lg" />
  </View>
);

const QuizDetailsSkeleton = () => {
  return (
    <>
      <HeaderSkeleton />
      <ContentSkeleton />
      <FooterSkeleton />
    </>
  );
};

export default QuizDetailsSkeleton;
