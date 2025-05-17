import { useLevel } from "@/context/LevelContext";
import { useEffect, useState } from "react";
import { View } from "react-native";
import VideoLesson from "../VideoLesson";

export default function Stage1Level1({
  videoRef,
  setStatus,
  currentLessonIndex,
  setCurrentLessonIndex,
  highestLessonIndex,
  setHighestLessonIndex,
  totalLessons,
  setTotalLessons,
}: {
  videoRef: React.RefObject<any>;
  setStatus: (status: any) => void;
  currentLessonIndex: number;
  setCurrentLessonIndex: React.Dispatch<React.SetStateAction<number>>;
  highestLessonIndex: number;
  setHighestLessonIndex: React.Dispatch<React.SetStateAction<number>>;
  totalLessons: number;
  setTotalLessons: React.Dispatch<React.SetStateAction<number>>;
}) {
  const maxLessons = 10;
  const { userSavedStage, userSavedLevel, userSavedLesson } = useLevel();

  // Initializing values based on current data
  useEffect(() => {
    if (userSavedStage == 1 && userSavedLevel == 1) {
      setCurrentLessonIndex(userSavedLesson);
      setHighestLessonIndex(userSavedLesson);
      setTotalLessons(maxLessons);
    } else {
      setCurrentLessonIndex(1);
      setHighestLessonIndex(1);
    }
  }, []);

  return (
    <>
      {currentLessonIndex === 1 && (
        <VideoLesson
          title={"Start Learning A"}
          videoRef={videoRef}
          setStatus={setStatus}
        ></VideoLesson>
      )}

      {currentLessonIndex === 2 && (
        <VideoLesson
          title={"Start Learning B"}
          videoRef={videoRef}
          setStatus={setStatus}
        ></VideoLesson>
      )}

      {currentLessonIndex === 3 && (
        <VideoLesson
          title={"Start Learning C"}
          videoRef={videoRef}
          setStatus={setStatus}
        ></VideoLesson>
      )}

      {currentLessonIndex === 4 && (
        <VideoLesson
          title={"Start Learning D"}
          videoRef={videoRef}
          setStatus={setStatus}
        ></VideoLesson>
      )}
    </>
  );
}
