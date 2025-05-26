import React, { createContext, useContext, useEffect, useState } from "react";
import RoadmapService from "@/api/services/roadmap-service";
// Define types for our level context
type LevelContextType = {
  userSavedStage: number;
  userSavedLevel: number;
  userSavedLesson: number;
  userSavedTotalLesson: number;
  isLoadingLevel: boolean;
  updateLevel: (
    userId: number,
    stage: number,
    level: number,
    lesson: number,
    totalLesson: number,
    levelComplete: boolean
  ) => void;
  initializeLevel: (userId: number, stage: number, level: number) => void;
};

// Create the context with default values
const LevelContext = createContext<LevelContextType>({
  userSavedStage: 1,
  userSavedLevel: 1,
  userSavedLesson: 1,
  userSavedTotalLesson: 1,
  isLoadingLevel: false,
  updateLevel: () => {},
  initializeLevel: () => {},
});

// Provider component
export const LevelProvider: React.FC<{
  children: React.ReactNode;
  initialStage?: number;
  initialLevel?: number;
  initialLesson?: number;
  initialTotalLessons?: number;
}> = ({
  children,
  initialStage = 1,
  initialLevel = 1,
  initialLesson = 1,
  initialTotalLessons = 12,
}) => {
  const [userSavedStage, setUserSavedStage] = useState(initialStage);
  const [userSavedLevel, setUserSavedLevel] = useState(initialLevel);
  const [userSavedLesson, setUserSavedLesson] = useState(initialLesson);
  const [userSavedTotalLesson, setUserSavedTotalLesson] =
    useState(initialTotalLessons);
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);

  const updateLevel = async (
    userId: number,
    newStage: number,
    newLevel: number,
    newLesson: number,
    newTotalLesson: number,
    levelComplete: boolean
  ) => {
    setIsLoadingLevel(true);

    try {
      if (levelComplete) {
        await saveProgressToBackend(userId, newStage, newLevel);
      }
      setUserSavedStage(newStage);
      setUserSavedLevel(newLevel);
      setUserSavedLesson(newLesson);
      setUserSavedTotalLesson(newTotalLesson);
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsLoadingLevel(false);
    }
  };

  const initializeLevel = async (
    userId: number,
    newStage: number,
    newLevel: number
  ) => {
    setIsLoadingLevel(true);

    try {
      //await saveProgressToBackend(userId, newStage, newLevel);
      setUserSavedStage(newStage);
      setUserSavedLevel(newLevel);
      setUserSavedLesson(1);
      setUserSavedTotalLesson(12);

      console.log("HERERE");
      console.log(newStage + " " + newLevel);
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsLoadingLevel(false);
    }
  };

  const saveProgressToBackend = async (
    userId: number,
    stageId: number,
    levelId: number
  ) => {
    const response = await RoadmapService.updateLevel(userId, stageId, levelId);

    return response;
  };

  return (
    <LevelContext.Provider
      value={{
        userSavedStage,
        userSavedLevel,
        userSavedLesson,
        userSavedTotalLesson,
        isLoadingLevel,
        updateLevel,
        initializeLevel,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => useContext(LevelContext);
