import { useLevel } from "@/context/LevelContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text } from "react-native";
import VideoLesson from "../VideoLesson";
import ExecuteLesson from "../ExecuteLesson";
import MultipleChoiceLesson from "../MultipleChoiceLesson";
import { useLocalSearchParams } from "expo-router";
import SpellingLesson from "../SpellingLesson";
import LevelIntroduction from "../LevelIntroduction";
import FallingLettersLesson from "../FallingLettersLesson";
import BalloonPopLesson from "../BalloonPopLesson";
import MatchingGameLesson from "../MatchingGameLesson";
import React from "react";
import { ContentGenerator } from "@/utils/contentGenerator";

// Define days word groups for each level - 10 words total divided into 3 levels
const LEVEL_DAYS_MAP: { [key: number]: string[] } = {
  1: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],                    // Level 1: Weekdays Part 1 (3 words)
  2: ['THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],         // Level 2: Weekdays Part 2 + Weekend (4 words)
  3: ['TODAY', 'TOMORROW', 'YESTERDAY']                    // Level 3: Time References (3 words)
};

// AI recognizes actual days words (no mapping needed)
// Helper function that returns the days word itself for AI
const getAIWord = (daysWord: string): string => {
  console.log(`[Stage6] Using days word "${daysWord}" for AI recognition`);
  return daysWord; // Return the days word as-is
};

// Static mapping for days word videos (React Native requires static paths)
const DAYS_VIDEO_MAP: { [key: string]: any } = {
  'MONDAY': require("@/assets/videos/monday.MOV"),
  'TUESDAY': require("@/assets/videos/tuesday.MOV"),
  'WEDNESDAY': require("@/assets/videos/wednesday.MOV"),
  'THURSDAY': require("@/assets/videos/thursday.MOV"),
  'FRIDAY': require("@/assets/videos/friday.MOV"),
  'SATURDAY': require("@/assets/videos/saturday.MOV"),
  'SUNDAY': require("@/assets/videos/sunday.MOV"),
  'TODAY': require("@/assets/videos/today.MOV"),
  'TOMORROW': require("@/assets/videos/tomorrow.MOV"),
  'YESTERDAY': require("@/assets/videos/yesterday.MOV"),
};

// Helper function to get video path for a days word
const getVideoPathForDays = (daysWord: string): any => {
  const video = DAYS_VIDEO_MAP[daysWord];
  if (!video) {
    console.warn(`[Stage6] No video found for days word: ${daysWord}, using fallback`);
    return DAYS_VIDEO_MAP['MONDAY']; // Fallback
  }
  return video;
};

export default function Stage6Level1({
  videoRef,
  setStatus,
  currentLessonIndex,
  setCurrentLessonIndex,
  totalLessons,
  setTotalLessons,
  currentLessonTitle,
  setCurrentLessonTitle,
  goToNextLesson,
  goToPreviousLesson,
  isCebuTheme = true,
}: {
  videoRef: any;
  setStatus: any;
  currentLessonIndex: number;
  setCurrentLessonIndex: any;
  totalLessons: number;
  setTotalLessons: any;
  currentLessonTitle: string;
  setCurrentLessonTitle: any;
  goToNextLesson: () => void;
  goToPreviousLesson: () => void;
  isCebuTheme?: boolean;
}) {
  const { levelId } = useLocalSearchParams();
  const currentLevelId = Number(levelId);

  // Get days for current level from the mapping
  const currentLevelDays = LEVEL_DAYS_MAP[currentLevelId] || [];

  console.log(`[Stage6Level1] Current Level: ${currentLevelId}`);
  console.log(`[Stage6Level1] Days for this level:`, currentLevelDays);

  // Generate lessons dynamically using ContentGenerator
  const lessons = useMemo(() => {
    console.log(`[Stage6Level1] Generating lessons for level ${currentLevelId}`);
    const generatedLessons = ContentGenerator.generateDynamicDaysLessons(
      currentLevelId,
      currentLevelDays,
      getVideoPathForDays,
      getAIWord
    );
    console.log(`[Stage6Level1] Generated ${generatedLessons.length} lessons`);
    return generatedLessons;
  }, [currentLevelId, currentLevelDays]);

  // Set total lessons on component mount
  useEffect(() => {
    if (lessons.length > 0) {
      setTotalLessons(lessons.length);
      console.log(`[Stage6Level1] Total lessons set to: ${lessons.length}`);
    }
  }, [lessons.length, setTotalLessons]);

  const currentLesson = lessons[currentLessonIndex - 1];

  // Update lesson title when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setCurrentLessonTitle(currentLesson.title);
      console.log(`[Stage6Level1] Lesson ${currentLessonIndex}: ${currentLesson.title} (Type: ${currentLesson.config?.type})`);
    }
  }, [currentLessonIndex, currentLesson, setCurrentLessonTitle]);

  // Helper to get all learned days up to current lesson
  const getLearnedDays = useCallback(() => {
    const learned: string[] = [];
    for (let i = 0; i < currentLessonIndex; i++) {
      const lesson = lessons[i];
      if (lesson?.config?.type === 'video_learning') {
        const content = lesson.config.content;
        if (content?.word && currentLevelDays.includes(content.word)) {
          learned.push(content.word);
        }
      }
    }
    console.log(`[Stage6Level1] Learned days up to lesson ${currentLessonIndex}:`, learned);
    return learned;
  }, [currentLessonIndex, lessons, currentLevelDays]);

  if (!currentLesson) {
    console.warn(`[Stage6Level1] No lesson found for index ${currentLessonIndex}`);
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-poppins-medium text-gray-600">
          Loading lesson...
        </Text>
      </View>
    );
  }

  const lessonType = currentLesson.config?.type;
  const content = currentLesson.config?.content;

  console.log(`[Stage6Level1] Rendering lesson type: ${lessonType}`);

  // Render based on lesson type
  switch (lessonType) {
    case "level_introduction":
      return (
        <LevelIntroduction
          levelId={currentLevelId}
          letters={currentLevelDays}
          currentLessonIndex={currentLessonIndex}
          onContinue={goToNextLesson}
          goToPreviousLesson={goToPreviousLesson}
          isCebuTheme={true} // Enable Cebu theme
        />
      );

    case "video_learning":
      if (!content?.videoSource || !content?.word) {
        console.error(`[Stage6Level1] Missing video content for lesson ${currentLessonIndex}`);
        return null;
      }

      return (
        <VideoLesson
          title={currentLesson.title}
          videoRef={videoRef}
          videoSource={content.videoSource}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          contentWord={content.word}
          isCebuTheme={true} // Enable Cebu theme
        />
      );

    case "execute_test":
      return (
        <ExecuteLesson
          title={currentLesson.title}
          correctAnswer={currentLesson.correctAnswer}
          currentLessonIndex={currentLessonIndex}
          contentWord={content?.word}
          isCebuTheme={true} // Enable Cebu theme
        />
      );

    case "multiple_choice":
      if (!content?.videoSource || !currentLesson.choices) {
        console.error(`[Stage6Level1] Missing multiple choice content for lesson ${currentLessonIndex}`);
        return null;
      }

      return (
        <MultipleChoiceLesson
          title={currentLesson.title}
          videoSource={content.videoSource}
          choices={currentLesson.choices}
          correctAnswer={currentLesson.correctAnswer}
          videoRef={videoRef}
          setStatus={setStatus}
          currentLessonIndex={currentLessonIndex}
          isCebuTheme={true} // Enable Cebu theme
        />
      );

    case "falling_letters":
      // Use learned content from lesson data if available, otherwise calculate it
      const learnedDaysForFalling = currentLesson.learnedContent || getLearnedDays();

      return (
        <FallingLettersLesson
          title={currentLesson.title}
          currentLessonIndex={currentLessonIndex}
          learnedContent={learnedDaysForFalling} // Pass learned days words from lesson or calculated
          correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
          contentWord={content?.word}
          isCebuTheme={true} // Enable Cebu theme
        />
      );

    case "balloon_pop":
      // Use learned content from lesson data if available, otherwise calculate it
      const learnedDaysForBalloon = currentLesson.learnedContent || getLearnedDays();

      return (
        <BalloonPopLesson
          title={currentLesson.title}
          currentLessonIndex={currentLessonIndex}
          learnedContent={learnedDaysForBalloon} // Pass learned days words from lesson or calculated
          correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
          isCebuTheme={true} // Enable Cebu theme
        />
      );

    case "matching":
      const learnedDaysForMatching = getLearnedDays();

      // Check if we have enough learned days for matching game (≥3)
      if (learnedDaysForMatching.length < 3 || !currentLesson.content) {
        // Fallback to execute test if not enough content
        return (
          <ExecuteLesson
            title={currentLesson.title}
            correctAnswer={currentLesson.correctAnswer || 'MONDAY'}
            currentLessonIndex={currentLessonIndex}
            contentWord={content?.word}
            isCebuTheme={true}
          />
        );
      }

      // Use the matching pairs from the generated lesson content (exactly 3 items)
      const matchingPairs = currentLesson.content.map((item: any, index: number) => ({
        id: `pair_${index}`,
        videoPath: getVideoPathForDays(item.word), // Convert word to proper require() path
        word: item.word,
        isMatched: false,
      }));

      console.log('[MATCHING] Using pairs from lesson content:', matchingPairs);

      return (
        <MatchingGameLesson
          title={currentLesson.title}
          currentLessonIndex={currentLessonIndex}
          pairs={matchingPairs}
          isCebuTheme={true}
        />
      );

    case "spelling":
      if (!content?.word) {
        console.error(`[Stage6Level1] Missing word for spelling lesson ${currentLessonIndex}`);
        return null;
      }

      return (
        <SpellingLesson
          title={currentLesson.title}
          word={content.word}
          currentLessonIndex={currentLessonIndex}
        />
      );

    default:
      console.warn(`[Stage6Level1] Unknown lesson type: ${lessonType}`);
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-poppins-medium text-red-600">
            Unknown lesson type: {lessonType}
          </Text>
        </View>
      );
  }
}
