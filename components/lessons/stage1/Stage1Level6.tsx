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
           title={"This is 'P'"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
           videoSource={require("@/assets/videos/p.mp4")}
         ></VideoLesson>
       )}
 
       {currentLessonIndex === 2 && (
         <MultipleChoiceLesson
           title={"What sign language is this?"}
           videoSource={require("@/assets/videos/p.mp4")}
           choices={["O", "P", "Q", "R"]}
           correctAnswer={"P"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
         ></MultipleChoiceLesson>
       )}
 
       {currentLessonIndex === 3 && (
         <ExecuteLesson
           title={"Execute P"}
           correctAnswer={"P"}
           currentLessonIndex={currentLessonIndex}
         ></ExecuteLesson>
       )}
 
       {currentLessonIndex === 4 && (
         <SpellingLesson
           title={"Can you fill in the missing letters?"}
           correctWord={["P", "U", "D", "D", "L", "E"]}
           questionWord={["_", "U", "D", "_", "L", "_"]}
           currentLessonIndex={currentLessonIndex}
         ></SpellingLesson>
       )}
 
       {currentLessonIndex === 5 && (
         <VideoLesson
           title={"This is 'Q'"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
           videoSource={require("@/assets/videos/q.mp4")}
         ></VideoLesson>
       )}
 
       {currentLessonIndex === 6 && (
         <MultipleChoiceLesson
           title={"What sign language is this?"}
           videoSource={require("@/assets/videos/q.mp4")}
           choices={["O", "P", "Q", "R"]}
           correctAnswer={"Q"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
         ></MultipleChoiceLesson>
       )}
 
       {currentLessonIndex === 7 && (
         <ExecuteLesson
           title={"Execute Q"}
           correctAnswer={"Q"}
           currentLessonIndex={currentLessonIndex}
         ></ExecuteLesson>
       )}
 
       {currentLessonIndex === 8 && (
         <SpellingLesson
           title={"Can you fill in the missing letters?"}
           correctWord={["Q", "U", "I", "C", "K"]}
           questionWord={["_", "U", "_", "C", "_"]}
           currentLessonIndex={currentLessonIndex}
         ></SpellingLesson>
       )}
 
       {currentLessonIndex === 9 && (
         <VideoLesson
           title={"This is 'R'"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
           videoSource={require("@/assets/videos/r.mp4")}
         ></VideoLesson>
       )}
 
       {currentLessonIndex === 10 && (
         <ExecuteLesson
           title={"Execute R"}
           correctAnswer={"R"}
           currentLessonIndex={currentLessonIndex}
         ></ExecuteLesson>
       )}
        {currentLessonIndex === 11 && (
          <MultipleChoiceLesson
           title={"What sign language is this?"}
           videoSource={require("@/assets/videos/r.mp4")}
           choices={["R", "S", "T", "U"]}
           correctAnswer={"R"}
           videoRef={videoRef}
           setStatus={setStatus}
           currentLessonIndex={currentLessonIndex}
         ></MultipleChoiceLesson>
       )}
 
       {currentLessonIndex === 12 && (
         <SpellingLesson
           title={"Fill in the missing letters."}
           correctWord={["R", "E", "W", "A", "R", "D"]}
           questionWord={["_", "E", "W", "_", "_", "D"]}
           currentLessonIndex={currentLessonIndex}
         ></SpellingLesson>
       )}
     </>
   );
}
