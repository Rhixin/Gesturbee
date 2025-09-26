import ProgressBar from "@/components/common/Progressbar";
import SuccessModal from "@/components/modals/SuccessModal";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image, ImageBackground } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { getLevelByStageIdByLevelId } from "@/utils/stageData";
import ExecuteLesson from "@/components/lessons/ExecuteLesson";
import VideoLesson from "@/components/lessons/VideoLesson";
import MultipleChoiceLesson from "@/components/lessons/MultipleChoiceLesson";
import Stage1Level1 from "@/components/lessons/stage1/Stage1Level1";
import { useLevel } from "@/context/LevelContext";
import LevelCompleteModal from "@/components/modals/LevelCompleteModal";

export default function Level() {
  const { stageId, levelId } = useLocalSearchParams();
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    showLevelCompleteModal,
    setShowLevelCompleteModal,
  } = useLevel();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [status, setStatus] = React.useState({});

  const [webViewError, setWebViewError] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const videoRef = useRef(null);
  const webViewRef = useRef(null);

  const router = useRouter();
  const goBack = () => router.back();

  // LOCAL, CHANGES upon navigating the lessom
  const [currentLessonTitle, setCurrentLessonTitle] = useState("");
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Vary every lesson
  const [totalLessons, setTotalLessons] = useState(0);

  const goToPreviousLesson = () => {
    if (currentLessonIndex !== 1) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    if (!isLock()) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  // Helper function to get current lesson type
  const getCurrentLessonType = () => {
    // This should match the logic in Stage1Level1 component
    const lessons = require('@/utils/contentGenerator').ContentGenerator.generateDynamicAlphabetLessons(Number(levelId));
    const currentLesson = lessons[currentLessonIndex - 1];
    return currentLesson?.config?.type;
  };

  const isLock = () => {
    const stage = Number(stageId);
    const level = Number(levelId);
    const lessonType = getCurrentLessonType();

    // Always allow level introduction and video lessons
    if (currentLessonIndex === 1 || lessonType === 'video_learning' || lessonType === 'level_introduction') return false;

    if (stage < userSavedStage) return false;
    if (stage === userSavedStage && level < userSavedLevel) return false;
    if (
      stage === userSavedStage &&
      level === userSavedLevel &&
      currentLessonIndex <= userSavedLesson
    )
      return false;

    return true;
  };

  // TODO: Proceed to next level
  const levelComplete = () => {
    goBack();
  };

  return (
    <>
      <LevelCompleteModal
        isVisible={showLevelCompleteModal}
        onContinue={() => {
          setShowLevelCompleteModal(false);
        }}
        message={"Congratulations for Completing Level " + levelId}
      />

      {Number(stageId) === 1 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/vigan.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#875C35' }}
          >
            <TouchableOpacity className="px-8" onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color={"white"} />
            </TouchableOpacity>

            <View className="rounded-2xl w-full px-4 items-center">
              <View className="bg-white px-6 rounded-2xl">
                <Text className="font-poppins-medium text-black text-xl">
                  Lesson {currentLessonIndex}
                </Text>
              </View>
              <View className="my-4">
                <Text className="text-white text-2xl font-poppins-medium">
                  {currentLessonTitle}
                </Text>
              </View>
            </View>

            <View className="w-full flex items-center mb-4">
              <View className="items-center flex justify-center w-[70%]">
                <ProgressBar
                  percent={(currentLessonIndex / totalLessons) * 100}
                  backgroundColor="bg-white"
                  fillColor="bg-amber-700"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage1Level1
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
            goToPreviousLesson={goToPreviousLesson}
            isViganTheme={Number(stageId) === 1}
          />

          <View
            className="w-full flex-row items-center justify-center px-6"
            style={{
              gap: 12,
              position: 'absolute',
              bottom: 100,
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
              zIndex: 9999
            }}
          >
            {currentLessonIndex !== 1 && (
              <TouchableOpacity
                className="px-6 py-3 rounded-full"
                style={{ backgroundColor: '#FFE9C3' }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: '#875C35' }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#C49472' }}
                  onPress={() => {}}
                  disabled={true}
                  activeOpacity={1}
                >
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="font-poppins-medium text-lg" style={{ color: '#FFFFFF' }}>
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: '#FFE9C3' }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: '#875C35' }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#C49472' : '#FFE9C3'
                }}
                onPress={isLock() ? () => {} : goToNextLesson}
                disabled={isLock()}
                activeOpacity={isLock() ? 1 : 0.7}
              >
                {isLock() && (
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  className="font-poppins-medium text-lg"
                  style={{ color: isLock() ? '#FFFFFF' : '#875C35' }}
                >
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : (
        <View className="h-[100vh] items-center bg-white">
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#01D3C1' }}
          >
            <TouchableOpacity className="px-8" onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color={"white"} />
            </TouchableOpacity>

            <View className="rounded-2xl w-full px-4 items-center">
              <View className="bg-white px-6 rounded-2xl">
                <Text className="font-poppins-medium text-black text-xl">
                  Lesson {currentLessonIndex}
                </Text>
              </View>
              <View className="my-4">
                <Text className="text-white text-2xl font-poppins-medium">
                  {currentLessonTitle}
                </Text>
              </View>
            </View>

            <View className="w-full flex items-center mb-4">
              <View className="items-center flex justify-center w-[70%]">
                <ProgressBar
                  percent={(currentLessonIndex / totalLessons) * 100}
                  backgroundColor="bg-white"
                  fillColor="bg-darkhoney"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage1Level1
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
            goToPreviousLesson={goToPreviousLesson}
            isViganTheme={Number(stageId) === 1}
          />

          <View
            className="w-full flex-row items-center justify-center px-6 space-x-4"
            style={{
              position: 'absolute',
              bottom: 100,
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
              zIndex: 9999
            }}
          >
            {currentLessonIndex !== 1 && (
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-full"
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg text-gray-500">
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center space-x-2 bg-gray-400"
                  onPress={() => {}}
                  disabled={true}
                  activeOpacity={1}
                >
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-white font-poppins-medium text-lg">
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: '#01D3C1' }}
                  onPress={levelComplete}
                >
                  <Text className="text-white font-poppins-medium text-lg">
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center space-x-2"
                style={{
                  backgroundColor: isLock() ? '#9CA3AF' : '#01D3C1'
                }}
                onPress={isLock() ? () => {} : goToNextLesson}
                disabled={isLock()}
                activeOpacity={isLock() ? 1 : 0.7}
              >
                {isLock() && (
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text className="text-white font-poppins-medium text-lg">
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </>
  );
}
