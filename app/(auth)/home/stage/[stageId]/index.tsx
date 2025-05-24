import ProgressBar from "@/components/Progressbar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getStageById } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";
import { useEffect, useState } from "react";
import React from "react";

export default function Stage() {
  const { stageId } = useLocalSearchParams();
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    isLoadingLevel,
  } = useLevel();
  const selectedStage = getStageById(Number(stageId));

  // For skeleton shimmer effect
  const [shimmerOffset, setShimmerOffset] = useState(0);

  const router = useRouter();

  // Shimmer animation effect
  useEffect(() => {
    if (isLoadingLevel) {
      const interval = setInterval(() => {
        setShimmerOffset((prev) => (prev + 10) % 200);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLoadingLevel]);

  const navigateToLevel = (levelId: number) => {
    router.push(`/home/stage/${stageId}/level/${levelId}`);
  };

  const goBack = () => {
    router.back();
  };

  const isLevelLocked = (levelNumber) => {
    if (levelNumber > userSavedLevel) {
      return true;
    }
    return false;
  };

  // Skeleton Loader Component
  const SkeletonLevelCard = ({ index }) => (
    <View className="bg-gray-200 rounded-2xl my-2 p-6 h-auto flex flex-row gap-4">
      {/* Skeleton Image */}
      <View className="max-h-[60px] flex items-center justify-center">
        <View
          className="w-[70px] h-[70px] bg-gray-300 rounded-full"
          style={{
            transform: [{ scale: 1.5 }],
          }}
        />
      </View>

      {/* Skeleton Content */}
      <View className="flex-1 flex-col justify-between">
        {/* Skeleton Title */}
        <View className="mb-4">
          <View
            className="h-6 bg-gray-300 rounded-md"
            style={{
              width: `${60 + Math.random() * 30}%`,
            }}
          />
        </View>

        {/* Skeleton Progress Bar */}
        <View className="h-4 bg-gray-300 rounded-full" />
      </View>
    </View>
  );

  // Enhanced Skeleton with shimmer effect
  const ShimmerSkeletonCard = ({ index }) => (
    <View className="bg-gray-200 rounded-2xl my-2 p-6 h-auto flex flex-row gap-4 overflow-hidden relative">
      {/* Shimmer overlay */}
      <View
        className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        style={{
          left: shimmerOffset - 40,
          transform: [{ skewX: "-20deg" }],
        }}
      />

      {/* Skeleton Image */}
      <View className="max-h-[60px] flex items-center justify-center">
        <View
          className="w-[70px] h-[70px] bg-gray-300 rounded-full"
          style={{
            transform: [{ scale: 1.5 }],
          }}
        />
      </View>

      {/* Skeleton Content */}
      <View className="flex-1 flex-col justify-between">
        {/* Skeleton Title */}
        <View className="mb-4">
          <View
            className="h-6 bg-gray-300 rounded-md mb-2"
            style={{ width: "70%" }}
          />
          <View
            className="h-4 bg-gray-300 rounded-md"
            style={{ width: "40%" }}
          />
        </View>

        {/* Skeleton Progress Bar */}
        <View className="h-4 bg-gray-300 rounded-full" />
      </View>
    </View>
  );

  return (
    <View className="bg-white h-[100vh] items-center">
      <SafeAreaView className="bg-primary rounded-b-3xl w-full">
        <TouchableOpacity
          className="px-8"
          onPress={() => {
            goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={"white"} />
        </TouchableOpacity>

        <View className="rounded-2xl w-[100%] p-4 items-center">
          {isLoadingLevel ? (
            <View className="h-9 bg-gray-300 rounded-md w-64" />
          ) : (
            <Text className="font-poppins-bold text-white text-3xl">
              Stage {selectedStage.id + ":   " + selectedStage.title}
            </Text>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        className="w-[90%] max-h-full pt-8 mb-28"
        showsVerticalScrollIndicator={false}
      >
        {isLoadingLevel
          ? // Show skeleton loaders
            Array.from({ length: 5 }).map((_, index) => (
              <ShimmerSkeletonCard key={`skeleton-${index}`} index={index} />
            ))
          : // Show actual content
            selectedStage.levels.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-200 rounded-2xl my-2 p-6 h-auto flex flex-row gap-4"
                activeOpacity={0.8}
                onPress={() => navigateToLevel(item.levelid)}
                disabled={isLevelLocked(item.levelid)}
              >
                <View
                  key={item.levelid}
                  className="max-h-[60px] flex items-center justify-center"
                >
                  <Image
                    source={
                      selectedStage.id > userSavedStage ||
                      (selectedStage.id === userSavedStage &&
                        item.levelid > userSavedLevel)
                        ? require("@/assets/images/beehive locked.png")
                        : require("@/assets/images/beehive unlocked.png")
                    }
                    className="max-w-[70px] max-h-[70px]"
                    style={{
                      transform: [{ scale: 2 }],
                    }}
                  />
                </View>
                <View className="flex-1 flex-col justify-between">
                  <Text className="text-tertiary font-poppins-bold text-xl">
                    {"Level " + (index + 1) + ": " + item.levelname}
                  </Text>
                  <View className="h-auto">
                    <ProgressBar
                      percent={
                        selectedStage.id < userSavedStage
                          ? 100
                          : selectedStage.id === userSavedStage
                          ? item.levelid < userSavedLevel
                            ? 100
                            : item.levelid === userSavedLevel
                            ? userSavedLesson === 0
                              ? 0
                              : (userSavedLesson / userSavedTotalLesson) * 100
                            : 0
                          : 0
                      }
                      backgroundColor={
                        selectedStage.id > userSavedStage ||
                        (selectedStage.id === userSavedStage &&
                          item.levelid > userSavedLevel)
                          ? "bg-tertiary"
                          : "bg-white"
                      }
                      fillColor="bg-secondary"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
      </ScrollView>
    </View>
  );
}
