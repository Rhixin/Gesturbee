import React, { createContext, useContext, useEffect, useState } from "react";

// Define types for our level context
type LevelContextType = {
  userSavedStage: number;
  userSavedLevel: number;
  userSavedLesson: number;
  userSavedTotalLesson: number;
  updateLevel: (
    stage: number,
    level: number,
    lesson: number,
    totalLesson: number
  ) => void;
};

// Create the context with default values
const LevelContext = createContext<LevelContextType>({
  userSavedStage: 1,
  userSavedLevel: 1,
  userSavedLesson: 1,
  userSavedTotalLesson: 1,
  updateLevel: () => {},
});

// Create a provider component
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
  initialTotalLessons = 10,
}) => {
  const [userSavedStage, setUserSavedStage] = useState(initialStage);
  const [userSavedLevel, setUserSavedLevel] = useState(initialLevel);
  const [userSavedLesson, setUserSavedLesson] = useState(initialLesson);
  const [userSavedTotalLesson, setUserSavedTotalLesson] =
    useState(initialTotalLessons);

  // TODO: initial query to get initial value sa level ni user
  useEffect(() => {
    setUserSavedStage(1);
    setUserSavedLevel(1);
    setUserSavedLesson(1);
    setUserSavedTotalLesson(10);
  }, []);

  // TODO: transact with backend using api, update level ni user
  const updateLevel = (
    newStage: number,
    newLevel: number,
    newLesson: number,
    newTotalLesson: number
  ) => {
    saveProgressToBackend(userSavedStage, userSavedLevel);

    setUserSavedStage(newStage);
    setUserSavedLevel(newLevel);
    setUserSavedLesson(newLesson);
    setUserSavedTotalLesson(newTotalLesson);
  };

  const saveProgressToBackend = (stageId: number, levelId: number) => {
    // TODO: Implement API call to save progress
  };

  return (
    <LevelContext.Provider
      value={{
        userSavedStage,
        userSavedLevel,
        userSavedLesson,
        userSavedTotalLesson,
        updateLevel,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

// Create a custom hook to use the level context
export const useLevel = () => useContext(LevelContext);
