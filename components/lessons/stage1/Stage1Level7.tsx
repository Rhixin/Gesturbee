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
  const MAX_LESSONS = 12;
  const LESSON_TITLES = [
    "Starting off with the basics",
    "How well can you remember?",
    "It's your turn!",
    "What is the answer?",
    "Let's move on to the next letter",
    "Can you still remember?",
    "Now you try.",
    "Let's test your signing skills",
    "Let's proceed to the next letter",
    "Now you try.",
    "What letter is this?",
    "Can you answer this?",
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
          title={"This is 'S'"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/s.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 2 && (
        <MultipleChoiceLesson
          title={"What sign language is this?"}
          videoSource={require("@/assets/videos/s.mp4")}
          choices={["Q", "R", "S", "T"]}
          correctAnswer={"S"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
        ></MultipleChoiceLesson>
      )}

      {currentLessonIndex === 3 && (
        <ExecuteLesson
          title={"Execute S"}
          correctAnswer={"S"}
          currentLessonIndex={currentLessonIndex}
        ></ExecuteLesson>
      )}

      {currentLessonIndex === 4 && (
        <SpellingLesson
          title={"Can you fill in the missing letters?"}
          correctWord={["S", "P", "R", "O", "U", "T"]}
          questionWord={["_", "P", "_", "_", "U", "T"]}
          currentLessonIndex={currentLessonIndex}
        ></SpellingLesson>
      )}

      {currentLessonIndex === 5 && (
        <VideoLesson
          title={"This is 'T'"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/t.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 6 && (
        <MultipleChoiceLesson
          title={"What sign language is this?"}
          videoSource={require("@/assets/videos/t.mp4")}
          choices={["S", "T", "U", "V"]}
          correctAnswer={"T"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
        ></MultipleChoiceLesson>
      )}

      {currentLessonIndex === 7 && (
        <ExecuteLesson
          title={"Execute T"}
          correctAnswer={"T"}
          currentLessonIndex={currentLessonIndex}
        ></ExecuteLesson>
      )}

      {currentLessonIndex === 8 && (
        <SpellingLesson
          title={"Can you fill in the missing letters?"}
          correctWord={["T", "E", "A", "C", "H"]}
          questionWord={["_", "E", "A", "_", "H"]}
          currentLessonIndex={currentLessonIndex}
        ></SpellingLesson>
      )}

      {currentLessonIndex === 9 && (
        <VideoLesson
          title={"This is 'U'"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          videoSource={require("@/assets/videos/u.mp4")}
        ></VideoLesson>
      )}

      {currentLessonIndex === 10 && (
        <ExecuteLesson
          title={"Execute U"}
          correctAnswer={"U"}
          currentLessonIndex={currentLessonIndex}
        ></ExecuteLesson>
      )}
      {currentLessonIndex === 11 && (
        <MultipleChoiceLesson
          title={"What sign language is this?"}
          videoSource={require("@/assets/videos/u.mp4")}
          choices={["S", "T", "U", "V"]}
          correctAnswer={"U"}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
        ></MultipleChoiceLesson>
      )}

      {currentLessonIndex === 12 && (
        <SpellingLesson
          title={"Fill in the missing letters."}
          correctWord={["U", "R", "B", "A", "N"]}
          questionWord={["_", "_", "_", "A", "N"]}
          currentLessonIndex={currentLessonIndex}
        ></SpellingLesson>
      )}
    </>
  );
}
