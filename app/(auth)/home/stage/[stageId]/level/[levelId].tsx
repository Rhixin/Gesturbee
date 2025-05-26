import ProgressBar from "@/components/Progressbar";
import SuccessModal from "@/components/SuccessModal";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { getLevelByStageIdByLevelId } from "@/utils/stageData";
import ExecuteLesson from "@/components/lessons/ExecuteLesson";
import VideoLesson from "@/components/lessons/VideoLesson";
import MultipleChoiceLesson from "@/components/lessons/MultipleChoiceLesson";
import Stage1Level1 from "@/components/lessons/stage1/Stage1Level1";
import { useLevel } from "@/context/LevelContext";
import Stage1Level2 from "@/components/lessons/stage1/Stage1Level2";
import LevelCompleteModal from "@/components/LevelCompleteModal";
import Stage1Level9 from "@/components/lessons/stage1/Stage1Level9";
import Stage1Level8 from "@/components/lessons/stage1/Stage1Level8";
import Stage1Level7 from "@/components/lessons/stage1/Stage1Level7";
import Stage1Level6 from "@/components/lessons/stage1/Stage1Level6";
import Stage1Level5 from "@/components/lessons/stage1/Stage1Level5";
import Stage1Level4 from "@/components/lessons/stage1/Stage1Level4";
import Stage1Level3 from "@/components/lessons/stage1/Stage1Level3";

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
    if (currentLessonIndex != 1) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    if (!isLock()) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const isLock = () => {
    const stage = Number(stageId);
    const level = Number(levelId);

    if (stage < userSavedStage) return false;
    if (stage === userSavedStage && level < userSavedLevel) return false;
    if (
      stage === userSavedStage &&
      level === userSavedLevel &&
      currentLessonIndex < userSavedLesson
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

      <View className="bg-white h-[100vh] items-center">
        <StatusBar style="light" />
        <SafeAreaView className="bg-secondary rounded-b-3xl w-full">
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

        {/* 
      DYNAMIC CONTENT OF THE LESSON
      */}

        {Number(levelId) === 1 && (
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
          />
        )}

        {Number(levelId) === 2 && (
          <Stage1Level2
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 3 && (
          <Stage1Level3
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 4 && (
          <Stage1Level4
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 5 && (
          <Stage1Level5
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 6 && (
          <Stage1Level6
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 7 && (
          <Stage1Level7
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 8 && (
          <Stage1Level8
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {Number(levelId) === 9 && (
          <Stage1Level9
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            setCurrentLessonIndex={setCurrentLessonIndex}
            totalLessons={totalLessons}
            setTotalLessons={setTotalLessons}
            currentLessonTitle={currentLessonTitle}
            setCurrentLessonTitle={setCurrentLessonTitle}
            goToNextLesson={goToNextLesson}
          />
        )}

        {/* 
      NAVIGATION HANDLER (NEXT OR PREVIOUS OR COMPLETED)
      */}

        <View className="w-full flex-row items-center justify-center mb-8 px-6 space-x-4">
          {currentLessonIndex != 1 && (
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
                className={`px-6 py-3 rounded-full flex-row items-center justify-center space-x-2 ${
                  isLock() ? "bg-gray-400" : "bg-secondary"
                }`}
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
                className="bg-secondary px-6 py-3 rounded-full"
                onPress={levelComplete}
              >
                <Text className="text-white font-poppins-medium text-lg">
                  Completed
                </Text>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              className={`px-6 py-3 rounded-full flex-row items-center justify-center space-x-2 ${
                isLock() ? "bg-gray-400" : "bg-secondary"
              }`}
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
    </>
  );
}
