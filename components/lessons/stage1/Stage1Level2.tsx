import { useLevel } from "@/context/LevelContext";
import { useEffect, useState } from "react";
import { View } from "react-native";
import VideoLesson from "../VideoLesson";
import ExecuteLesson from "../ExecuteLesson";
import MultipleChoiceLesson from "../MultipleChoiceLesson";
import { useLocalSearchParams } from "expo-router";

export default function Stage1Level2({
  videoRef,
  setStatus,
  currentLessonIndex,
  setCurrentLessonIndex,
  totalLessons,
  setTotalLessons,
  currentLessonTitle,
  setCurrentLessonTitle,
  goToNextLesson,
}: {
  videoRef: React.RefObject<any>;
  setStatus: (status: any) => void;
  currentLessonIndex: number;
  setCurrentLessonIndex: React.Dispatch<React.SetStateAction<number>>;
  totalLessons: number;
  setTotalLessons: React.Dispatch<React.SetStateAction<number>>;
  currentLessonTitle: string;
  setCurrentLessonTitle: React.Dispatch<React.SetStateAction<string>>;
  goToNextLesson: () => void;
}) {
  const MAX_LESSONS = 10;
  const LESSON_TITLES = [
    "2Starting off with the basics",
    "2How well can you remember?",
    "2It's your turn!",
    "2Can you perform D?",
    "2Can you perform E?",
    "2Can you perform F?",
    "2Can you perform G?",
    "2Can you perform H?",
    "2Can you perform I?",
    "2Can you perform J?",
  ];
  const { stageId, levelId } = useLocalSearchParams();
  const { userSavedStage, userSavedLevel, userSavedLesson } = useLevel();

  // Initializing values based on current data
  useEffect(() => {
    if (Number(stageId) == 1 && Number(levelId) == 2) {
      setCurrentLessonIndex(userSavedLesson);
      setTotalLessons(MAX_LESSONS);
      setCurrentLessonTitle(LESSON_TITLES[currentLessonIndex - 1]);
    } else {
      setCurrentLessonIndex(1);
    }

    console.log(userSavedStage + " " + userSavedLevel + " " + userSavedLesson);
  }, []);

  // Updating titles when navigating
  useEffect(() => {
    setCurrentLessonTitle(LESSON_TITLES[currentLessonIndex - 1]);
  }, [currentLessonIndex]);

  return (
    <>
      {currentLessonIndex === 1 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 2 && (
        <MultipleChoiceLesson
          title={"What sign language is this?"}
          videoSource={require("@/assets/videos/a.mp4")}
          choices={["A", "B", "C", "D"]}
          correctAnswer={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
        ></MultipleChoiceLesson>
      )}

      {currentLessonIndex === 3 && (
        <ExecuteLesson
          title={"Execute A"}
          correctAnswer={"A"}
          currentLessonIndex={currentLessonIndex}
        ></ExecuteLesson>
      )}

      {currentLessonIndex === 4 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 5 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 6 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 7 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 8 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 9 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 10 && (
        <VideoLesson
          title={"A"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/a.mp4")}
        ></VideoLesson>
      )}
    </>
  );
}
