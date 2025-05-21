import { useLevel } from "@/context/LevelContext";
import { useEffect, useState } from "react";
import { View } from "react-native";
import VideoLesson from "../VideoLesson";
import ExecuteLesson from "../ExecuteLesson";
import MultipleChoiceLesson from "../MultipleChoiceLesson";
import { useLocalSearchParams } from "expo-router";
import SpellingLesson from "../SpellingLesson";

export default function Stage1Level1({
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
    "Starting off with the basics",
    "How well can you remember?",
    "It's your turn!",
    "Can you perform D?",
    "Can you perform E?",
    "Can you perform F?",
    "Can you perform G?",
    "Can you perform H?",
    "Can you perform I?",
    "Can you perform J?",
  ];
  const { stageId, levelId } = useLocalSearchParams();
  const { userSavedStage, userSavedLevel, userSavedLesson } = useLevel();

  // Initializing values based on current data
  useEffect(() => {
    if (Number(stageId) == 1 && Number(levelId) == 1) {
      setCurrentLessonIndex(userSavedLesson);
      setTotalLessons(MAX_LESSONS);
      setCurrentLessonTitle(LESSON_TITLES[currentLessonIndex - 1]);
    } else {
      setCurrentLessonIndex(1);
    }
  }, []);

  // Updating titles when navigating
  useEffect(() => {
    setCurrentLessonTitle(LESSON_TITLES[currentLessonIndex - 1]);
  }, [currentLessonIndex]);

  return (
    <>
      {currentLessonIndex === 1 && (
        <VideoLesson
          title={"This is 'A'"}
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
        <SpellingLesson
          title={"Can you fill in the missing letters?"}
          correctWord={["A", "W", "A", "R", "D"]}
          questionWord={["_", "W", "_", "R", "D"]}
          currentLessonIndex={currentLessonIndex}
        ></SpellingLesson>
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
