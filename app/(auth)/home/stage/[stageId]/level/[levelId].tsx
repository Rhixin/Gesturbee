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
import Stage2Level1 from "@/components/lessons/stage2/Stage2Level1";
import Stage3Level1 from "@/components/lessons/stage3/Stage3Level1";
import Stage4Level1 from "@/components/lessons/stage4/Stage4Level1";
import Stage5Level1 from "@/components/lessons/stage5/Stage5Level1";
import Stage6Level1 from "@/components/lessons/stage6/Stage6Level1";
import Stage7Level1 from "@/components/lessons/stage7/Stage7Level1";
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
  const [currentLessonIndex, setCurrentLessonIndex] = useState(1);

  // Vary every lesson
  const [totalLessons, setTotalLessons] = useState(0);

  const goToPreviousLesson = () => {
    if (currentLessonIndex !== 1) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    if (!isLock() && currentLessonIndex < totalLessons) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  // Define theme colors for navigation buttons
  const getThemeColors = () => {
    const stage = Number(stageId);
    switch (stage) {
      case 1: // Vigan
        return {
          buttonBackground: '#FFE9C3',
          buttonText: '#875C35'
        };
      case 2: // Manila
        return {
          buttonBackground: '#E8F2D9',
          buttonText: '#87A248'
        };
      case 3: // Boracay
        return {
          buttonBackground: '#E3F2FD',
          buttonText: '#488DA2'
        };
      case 4: // Siargao
        return {
          buttonBackground: '#F0E7C9',
          buttonText: '#B8A869'
        };
      case 5: // Palawan
        return {
          buttonBackground: '#D4C8B8',
          buttonText: '#6A645C'
        };
      case 6: // Cebu
        return {
          buttonBackground: '#F4D9C6',
          buttonText: '#B65828'
        };
      case 7: // Bohol
        return {
          buttonBackground: '#D4E5C7',
          buttonText: '#6D825A'
        };
      default: // Fallback to Vigan
        return {
          buttonBackground: '#FFE9C3',
          buttonText: '#875C35'
        };
    }
  };

  const themeColors = getThemeColors();

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
                  fillColor="bg-yellow-400"
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
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
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#C49472' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? '#FFFFFF' : themeColors.buttonText }}
                >
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : Number(stageId) === 2 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/manila.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#87A248' }}
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
                  fillColor="bg-yellow-400"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage2Level1
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
            isManilaTheme={Number(stageId) === 2}
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#8B7355' }}
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
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#8B7355' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? '#FFFFFF' : themeColors.buttonText }}
                >
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : Number(stageId) === 3 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/boracay.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#488DA2' }}
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
                  fillColor="bg-yellow-400"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage3Level1
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
            isBoracayTheme={Number(stageId) === 3}
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#9E9E9E' }}
                  onPress={() => {}}
                  disabled={true}
                >
                  <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-poppins-medium text-lg text-white">
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={goToNextLesson}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Complete
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full"
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToNextLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : Number(stageId) === 4 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/siargao.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#B8A869' }}
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
                  fillColor="bg-yellow-400"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage4Level1
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
            isSiargaoTheme={Number(stageId) === 4}
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#9E9E9E' }}
                  onPress={() => {}}
                  disabled={true}
                >
                  <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-poppins-medium text-lg text-white">
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#9E9E9E' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? '#FFFFFF' : themeColors.buttonText }}
                >
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : Number(stageId) === 5 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/palawan.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#6A645C' }}
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
                  fillColor="bg-yellow-400"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage5Level1
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
            isPalawanTheme={Number(stageId) === 5}
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#9E9E9E' }}
                  onPress={() => {}}
                  disabled={true}
                >
                  <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-poppins-medium text-lg text-white">
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#9E9E9E' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? '#FFFFFF' : themeColors.buttonText }}
                >
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : Number(stageId) === 6 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/cebu.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#B65828' }}
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
                  fillColor="bg-yellow-400"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage6Level1
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
            isCebuTheme={Number(stageId) === 6}
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#9E9E9E' }}
                  onPress={() => {}}
                  disabled={true}
                >
                  <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-poppins-medium text-lg text-white">
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#9E9E9E' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? '#FFFFFF' : themeColors.buttonText }}
                >
                  {isLock() ? "Locked" : "Next"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      ) : Number(stageId) === 7 ? (
        <ImageBackground
          source={require("@/assets/images/background_places/bohol.png")}
          className="h-[100vh] items-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black opacity-20" />
          <StatusBar style="light" />

          <SafeAreaView
            className="rounded-b-3xl w-full"
            style={{ backgroundColor: '#6D825A' }}
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
                  fillColor="bg-yellow-400"
                />
              </View>
            </View>
          </SafeAreaView>

          <Stage7Level1
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
            isBoholTheme={Number(stageId) === 7}
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
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex === totalLessons ? (
              isLock() ? (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#9E9E9E' }}
                  onPress={() => {}}
                  disabled={true}
                >
                  <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-poppins-medium text-lg text-white">
                    Locked
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center"
                style={{
                  backgroundColor: isLock() ? '#9E9E9E' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? '#FFFFFF' : themeColors.buttonText }}
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
                  fillColor="bg-yellow-400"
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
                className="px-6 py-3 rounded-full"
                style={{ backgroundColor: themeColors.buttonBackground }}
                onPress={goToPreviousLesson}
              >
                <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
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
                  style={{ backgroundColor: themeColors.buttonBackground }}
                  onPress={levelComplete}
                >
                  <Text className="font-poppins-medium text-lg" style={{ color: themeColors.buttonText }}>
                    Completed
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                className="px-6 py-3 rounded-full flex-row items-center justify-center space-x-2"
                style={{
                  backgroundColor: isLock() ? '#9CA3AF' : themeColors.buttonBackground
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
                  style={{ color: isLock() ? "white" : themeColors.buttonText }}
                >
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
