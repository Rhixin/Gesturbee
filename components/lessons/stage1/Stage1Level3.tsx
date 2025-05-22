import { useLevel } from "@/context/LevelContext";
import { useEffect, useState } from "react";
import { View } from "react-native";
import VideoLesson from "../VideoLesson";
import ExecuteLesson from "../ExecuteLesson";
import MultipleChoiceLesson from "../MultipleChoiceLesson";
import { useLocalSearchParams } from "expo-router";
import SpellingLesson from "../SpellingLesson";

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
           title={"This is 'G'"}
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
           choices={["E", "F", "G", "H"]}
           correctAnswer={"G"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
         ></MultipleChoiceLesson>
       )}
 
       {currentLessonIndex === 3 && (
         <ExecuteLesson
           title={"Execute G"}
           correctAnswer={"G"}
           currentLessonIndex={currentLessonIndex}
         ></ExecuteLesson>
       )}
 
       {currentLessonIndex === 4 && (
         <SpellingLesson
           title={"Can you fill in the missing letters?"}
           correctWord={["G", "E", "S", "T", "U", "R", "E"]}
           questionWord={["_", "_", "S", "T", "U", "R", "_"]}
           currentLessonIndex={currentLessonIndex}
         ></SpellingLesson>
       )}
 
       {currentLessonIndex === 5 && (
         <VideoLesson
           title={"This is 'H'"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
           videoSource={require("@/assets/videos/a.mp4")}
         ></VideoLesson>
       )}
 
       {currentLessonIndex === 6 && (
         <MultipleChoiceLesson
           title={"What sign language is this?"}
           videoSource={require("@/assets/videos/a.mp4")}
           choices={["G", "H", "I", "J"]}
           correctAnswer={"H"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
         ></MultipleChoiceLesson>
       )}
 
       {currentLessonIndex === 7 && (
         <ExecuteLesson
           title={"Execute H"}
           correctAnswer={"H"}
           currentLessonIndex={currentLessonIndex}
         ></ExecuteLesson>
       )}
 
       {currentLessonIndex === 8 && (
         <SpellingLesson
           title={"Can you fill in the missing letters?"}
           correctWord={["H", "O", "U", "S", "E"]}
           questionWord={["_", "O", "U", "S", "_"]}
           currentLessonIndex={currentLessonIndex}
         ></SpellingLesson>
       )}
 
       {currentLessonIndex === 9 && (
         <VideoLesson
           title={"This is 'I'"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
           videoSource={require("@/assets/videos/a.mp4")}
         ></VideoLesson>
       )}
 
       {currentLessonIndex === 10 && (
         <ExecuteLesson
           title={"Execute I"}
           correctAnswer={"I"}
           currentLessonIndex={currentLessonIndex}
         ></ExecuteLesson>
       )}
        {currentLessonIndex === 11 && (
          <MultipleChoiceLesson
           title={"What sign language is this?"}
           videoSource={require("@/assets/videos/a.mp4")}
           choices={["I", "J", "K", "L"]}
           correctAnswer={"F"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
         ></MultipleChoiceLesson>
       )}
 
       {currentLessonIndex === 12 && (
         <SpellingLesson
           title={"Fill in the missing letters."}
           correctWord={["I", "S", "L", "A", "N", "D"]}
           questionWord={["_", "S", "L", "_", "N", "_"]}
           currentLessonIndex={currentLessonIndex}
         ></SpellingLesson>
       )}
     </>
   );
}
