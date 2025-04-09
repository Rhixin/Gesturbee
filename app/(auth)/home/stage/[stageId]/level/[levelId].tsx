import ProgressBar from "@/components/Progressbar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";

export default function Level() {
  const { levelId } = useLocalSearchParams();
  const router = useRouter();
  const goBack = () => router.back();

  const levelDummy = {
    levelId: 2,
    levelname: "A-C",
    lessons: [
      {
        lessonid: 1,
        lessonname: "A",
        lessonnumer: 1,
        contents: {
          video: {
            videoid: 1,
            videourl: "sample.mp4",
            videotitle: "Video of A",
          },
          execute: {
            exeecuteid: 1,
            executevideo: "video.mp4",
            executetitle: "Execute the Sign Language for A",
            answer: "A",
          },
          review: {
            reviewid: 1,
            reviewtitle: "What sign is this?",
            answer: "A",
            choices: ["A", "B", "C", "D"],
          },
        },
      },
      {
        lessonid: 2,
        lessonname: "B",
        lessonnumer: 2,
        contents: {
          video: {
            videoid: 2,
            videourl: "sample.mp4",
            videotitle: "Video of B",
          },
          execute: {
            exeecuteid: 2,
            executevideo: "video.mp4",
            executetitle: "Execute the Sign Language for B",
            answer: "B",
          },
          review: {
            reviewid: 2,
            reviewtitle: "What sign is this?",
            answer: "B",
            choices: ["A", "B", "C", "D"],
          },
        },
      },
      {
        lessonid: 3,
        lessonname: "C",
        lessonnumer: 3,
        contents: {
          video: {
            videoid: 3,
            videourl: "sample.mp4",
            videotitle: "Video of C",
          },
          execute: {
            exeecuteid: 3,
            executevideo: "video.mp4",
            executetitle: "Execute the Sign Language for C",
            answer: "C",
          },
          review: {
            reviewid: 3,
            reviewtitle: "What sign is this?",
            answer: "C",
            choices: ["A", "B", "C", "D"],
          },
        },
      },
    ],
  };

  const totalLessons = levelDummy.lessons.length;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentContentIndex, setCurrentIndex] = useState(0);
  const progressPercent =
    ((currentLessonIndex * 3 + currentContentIndex + 1) / (totalLessons * 3)) *
    100;

  const goToNextContent = () => {
    if (currentContentIndex == 2 && currentLessonIndex < totalLessons) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }

    setCurrentIndex((currentContentIndex + 1) % 3);
  };

  return (
    <View className="bg-white h-[100vh] items-center">
      <SafeAreaView className="bg-secondary rounded-b-3xl w-full">
        <TouchableOpacity className="px-8" onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={"white"} />
        </TouchableOpacity>

        <View className="rounded-2xl w-full px-4 items-center">
          <View className="bg-white px-6 rounded-2xl">
            <Text className="font-poppins-medium text-black text-xl">
              Lesson {currentLessonIndex + 1}
            </Text>
          </View>
          <View className="my-4">
            <Text className="text-white text-2xl font-poppins-medium">
              {levelDummy.lessons[currentLessonIndex].lessonname}
            </Text>
          </View>
        </View>

        <View className="w-full flex items-center mb-4">
          <View className="items-center flex justify-center w-[70%]">
            <ProgressBar
              percent={progressPercent}
              backgroundColor="bg-white"
              fillColor="bg-darkhoney"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* 
      DYNAMIC CONTENT OF THE LESSON
      1.VID
      2.EXECUTE
      3.REVIEW
      */}

      {currentContentIndex === 0 && (
        <Text>
          {levelDummy.lessons[currentLessonIndex].contents.video.videotitle}
        </Text>
      )}

      {currentContentIndex === 1 && (
        <Text>
          {levelDummy.lessons[currentLessonIndex].contents.execute.executetitle}
        </Text>
      )}

      {currentContentIndex === 2 && (
        <Text>
          {levelDummy.lessons[currentLessonIndex].contents.review.reviewtitle}
        </Text>
      )}

      <View className="w-full items-center mb-8">
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full"
          onPress={goToNextContent}
          disabled={
            currentLessonIndex === totalLessons - 1 && currentContentIndex === 2
          }
        >
          <Text className="text-white font-poppins-medium text-lg">
            {currentLessonIndex === totalLessons - 1 &&
            currentContentIndex === 2
              ? "Completed"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
