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

// Define months word groups for each level - 12 words total divided into 4 levels
const LEVEL_MONTHS_MAP: { [key: number]: string[] } = {
  1: ['JANUARY', 'FEBRUARY', 'MARCH'],                    // Level 1: Jan-Mar (3 words)
  2: ['APRIL', 'MAY', 'JUNE'],                           // Level 2: Apr-Jun (3 words)
  3: ['JULY', 'AUGUST', 'SEPTEMBER'],                    // Level 3: Jul-Sep (3 words)
  4: ['OCTOBER', 'NOVEMBER', 'DECEMBER']                 // Level 4: Oct-Dec (3 words)
};

// AI recognizes actual months words (no mapping needed)
// Helper function that returns the months word itself for AI
const getAIWord = (monthsWord: string): string => {
  console.log(`[Stage7] Using months word "${monthsWord}" for AI recognition`);
  return monthsWord; // Return the months word as-is
};

// Static mapping for months word videos (React Native requires static paths)
const MONTHS_VIDEO_MAP: { [key: string]: any } = {
  'JANUARY': require("@/assets/videos/january.MOV"),
  'FEBRUARY': require("@/assets/videos/february.MOV"),
  'MARCH': require("@/assets/videos/march.MOV"),
  'APRIL': require("@/assets/videos/april.MOV"),
  'MAY': require("@/assets/videos/may.MOV"),
  'JUNE': require("@/assets/videos/june.MOV"),
  'JULY': require("@/assets/videos/july.MOV"),
  'AUGUST': require("@/assets/videos/august.MOV"),
  'SEPTEMBER': require("@/assets/videos/september.MOV"),
  'OCTOBER': require("@/assets/videos/october.MOV"),
  'NOVEMBER': require("@/assets/videos/november.MOV"),
  'DECEMBER': require("@/assets/videos/december.MOV"),
};

// Helper function to get video path for a months word
const getVideoPathForMonths = (monthsWord: string): any => {
  const video = MONTHS_VIDEO_MAP[monthsWord];
  if (!video) {
    console.warn(`[Stage7] No video found for months word: ${monthsWord}, using fallback`);
    return MONTHS_VIDEO_MAP['JANUARY']; // Fallback
  }
  return video;
};

export default function Stage7Level1({
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
  isBoholTheme = true,
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
  isBoholTheme?: boolean;
}) {
  const { levelId } = useLocalSearchParams();
  const currentLevelId = Number(levelId);

  // Get months for current level from the mapping
  const currentLevelMonths = LEVEL_MONTHS_MAP[currentLevelId] || [];

  console.log(`[Stage7Level1] Current Level: ${currentLevelId}`);
  console.log(`[Stage7Level1] Months for this level:`, currentLevelMonths);

  // Generate lessons dynamically using ContentGenerator
  const lessons = useMemo(() => {
    console.log(`[Stage7Level1] Generating lessons for level ${currentLevelId}`);
    const generatedLessons = ContentGenerator.generateDynamicMonthsLessons(
      currentLevelId,
      currentLevelMonths,
      getVideoPathForMonths,
      getAIWord
    );
    console.log(`[Stage7Level1] Generated ${generatedLessons.length} lessons`);
    return generatedLessons;
  }, [currentLevelId, currentLevelMonths]);

  // Set total lessons on component mount
  useEffect(() => {
    if (lessons.length > 0) {
      setTotalLessons(lessons.length);
      console.log(`[Stage7Level1] Total lessons set to: ${lessons.length}`);
    }
  }, [lessons.length, setTotalLessons]);

  const currentLesson = lessons[currentLessonIndex - 1];

  // Update lesson title when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setCurrentLessonTitle(currentLesson.title);
      console.log(`[Stage7Level1] Lesson ${currentLessonIndex}: ${currentLesson.title} (Type: ${currentLesson.config?.type})`);
    }
  }, [currentLessonIndex, currentLesson, setCurrentLessonTitle]);

  // Helper to get all learned months up to current lesson
  const getLearnedMonths = useCallback(() => {
    const learned: string[] = [];
    for (let i = 0; i < currentLessonIndex; i++) {
      const lesson = lessons[i];
      if (lesson?.config?.type === 'video_learning') {
        const content = lesson.config.content;
        if (content?.word && currentLevelMonths.includes(content.word)) {
          learned.push(content.word);
        }
      }
    }
    console.log(`[Stage7Level1] Learned months up to lesson ${currentLessonIndex}:`, learned);
    return learned;
  }, [currentLessonIndex, lessons, currentLevelMonths]);

  if (!currentLesson) {
    console.warn(`[Stage7Level1] No lesson found for index ${currentLessonIndex}`);
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

  console.log(`[Stage7Level1] Rendering lesson type: ${lessonType}`);

  // Render based on lesson type
  switch (lessonType) {
    case "level_introduction":
      return (
        <LevelIntroduction
          levelId={currentLevelId}
          letters={currentLevelMonths}
          currentLessonIndex={currentLessonIndex}
          onContinue={goToNextLesson}
          goToPreviousLesson={goToPreviousLesson}
          isBoholTheme={true} // Enable Bohol theme
        />
      );

    case "video_learning":
      if (!content?.videoSource || !content?.word) {
        console.error(`[Stage7Level1] Missing video content for lesson ${currentLessonIndex}`);
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
          isBoholTheme={true} // Enable Bohol theme
        />
      );

    case "execute_test":
      return (
        <ExecuteLesson
          title={currentLesson.title}
          correctAnswer={currentLesson.correctAnswer}
          currentLessonIndex={currentLessonIndex}
          contentWord={content?.word}
          isBoholTheme={true} // Enable Bohol theme
        />
      );

    case "multiple_choice":
      if (!content?.videoSource || !currentLesson.choices) {
        console.error(`[Stage7Level1] Missing multiple choice content for lesson ${currentLessonIndex}`);
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
          isBoholTheme={true} // Enable Bohol theme
        />
      );

    case "falling_letters":
      // Use learned content from lesson data if available, otherwise calculate it
      const learnedMonthsForFalling = currentLesson.learnedContent || getLearnedMonths();

      return (
        <FallingLettersLesson
          title={currentLesson.title}
          currentLessonIndex={currentLessonIndex}
          learnedContent={learnedMonthsForFalling} // Pass learned months words from lesson or calculated
          correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
          contentWord={content?.word}
          isBoholTheme={true} // Enable Bohol theme with tarsier
        />
      );

    case "balloon_pop":
      // Use learned content from lesson data if available, otherwise calculate it
      const learnedMonthsForBalloon = currentLesson.learnedContent || getLearnedMonths();

      return (
        <BalloonPopLesson
          title={currentLesson.title}
          currentLessonIndex={currentLessonIndex}
          learnedContent={learnedMonthsForBalloon} // Pass learned months words from lesson or calculated
          correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
          isBoholTheme={true} // Enable Bohol theme with tarsier
        />
      );

    case "matching":
      const learnedMonthsForMatching = getLearnedMonths();

      // Check if we have enough learned months for matching game (≥3)
      if (learnedMonthsForMatching.length < 3 || !currentLesson.content) {
        // Fallback to execute test if not enough content
        return (
          <ExecuteLesson
            title={currentLesson.title}
            correctAnswer={currentLesson.correctAnswer || 'JANUARY'}
            currentLessonIndex={currentLessonIndex}
            contentWord={content?.word}
            isBoholTheme={true}
          />
        );
      }

      // Use the matching pairs from the generated lesson content (exactly 3 items)
      const matchingPairs = currentLesson.content.map((item: any, index: number) => ({
        id: `pair_${index}`,
        videoPath: getVideoPathForMonths(item.word), // Convert word to proper require() path
        word: item.word,
        isMatched: false,
      }));

      console.log('[MATCHING] Using pairs from lesson content:', matchingPairs);

      return (
        <MatchingGameLesson
          title={currentLesson.title}
          currentLessonIndex={currentLessonIndex}
          pairs={matchingPairs}
          isBoholTheme={true}
        />
      );

    case "spelling":
      if (!content?.word) {
        console.error(`[Stage7Level1] Missing word for spelling lesson ${currentLessonIndex}`);
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
      console.warn(`[Stage7Level1] Unknown lesson type: ${lessonType}`);
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-poppins-medium text-red-600">
            Unknown lesson type: {lessonType}
          </Text>
        </View>
      );
  }
}
