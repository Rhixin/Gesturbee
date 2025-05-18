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

export default function Level() {
  const { stageId, levelId } = useLocalSearchParams();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [status, setStatus] = React.useState({});

  const [webViewError, setWebViewError] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const videoRef = useRef(null);
  const webViewRef = useRef(null);

  const router = useRouter();
  const goBack = () => router.back();

  const [highestLessonIndex, setHighestLessonIndex] = useState(0);
  const [currentLessonTitle, setCurrentLessonTitle] = useState("");
  const [totalLessons, setTotalLessons] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "prediction") {
        console.log("📩 Received prediction from iframe:", event.data.data);

        setPrediction(event.data.data.prediction);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const goToPreviousLesson = () => {
    if (currentLessonIndex != 1) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    lessonComplete();
    if (currentLessonIndex < highestLessonIndex) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const lessonComplete = () => {
    setCurrentLessonIndex(currentLessonIndex + 1);
    setHighestLessonIndex(highestLessonIndex + 1);
  };

  const levelComplete = () => {
    console.log("Humana");
  };

  return (
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

      <Stage1Level1
        videoRef={videoRef}
        setStatus={setStatus}
        currentLessonIndex={currentLessonIndex}
        setCurrentLessonIndex={setCurrentLessonIndex}
        highestLessonIndex={highestLessonIndex}
        setHighestLessonIndex={setHighestLessonIndex}
        totalLessons={totalLessons}
        setTotalLessons={setTotalLessons}
      ></Stage1Level1>

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
          <TouchableOpacity
            className="bg-secondary px-6 py-3 rounded-full"
            onPress={levelComplete}
          >
            <Text className="text-white font-poppins-medium text-lg">
              Completed
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-secondary px-6 py-3 rounded-full"
            onPress={goToNextLesson}
          >
            <Text className="text-white font-poppins-medium text-lg">Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
