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

// Define color groups for each level - 13 colors total divided into 4 levels (better pacing)
const LEVEL_COLORS_MAP: { [key: number]: string[] } = {
  1: ['BLUE', 'GREEN', 'RED'],                          // Level 1: Primary Colors (3 colors)
  2: ['BROWN', 'BLACK', 'WHITE', 'YELLOW'],             // Level 2: Basic Colors (4 colors)
  3: ['ORANGE', 'GRAY', 'PINK'],                        // Level 3: Secondary Colors (3 colors)
  4: ['VIOLET', 'LIGHT', 'DARK']                        // Level 4: Advanced Colors (3 colors)
};

// Map colors to letters for AI testing (since AI only recognizes A-Z)
// This is a temporary workaround: BLUE=A, GREEN=B, RED=C, etc.
const COLOR_TO_LETTER_MAP: { [key: string]: string } = {
  'BLUE': 'A', 'GREEN': 'B', 'RED': 'C', 'BROWN': 'D', 'BLACK': 'E',
  'WHITE': 'F', 'YELLOW': 'G', 'ORANGE': 'H', 'GRAY': 'I', 'PINK': 'J',
  'VIOLET': 'K', 'LIGHT': 'L', 'DARK': 'M'
};

// Helper function to get AI test letter for a color
const getAITestLetter = (color: string): string => {
  const letter = COLOR_TO_LETTER_MAP[color];
  console.log(`[Stage4] Color "${color}" mapped to letter ${letter} for AI testing`);
  return letter || 'A'; // Fallback to 'A'
};

// Static mapping for color videos (React Native requires static paths)
const COLOR_VIDEO_MAP: { [key: string]: any } = {
  'BLUE': require("@/assets/videos/blue.MOV"),
  'GREEN': require("@/assets/videos/green.MOV"),
  'RED': require("@/assets/videos/red.MOV"),
  'BROWN': require("@/assets/videos/brown.MOV"),
  'BLACK': require("@/assets/videos/black.MOV"),
  'WHITE': require("@/assets/videos/white.MOV"),
  'YELLOW': require("@/assets/videos/yellow.MOV"),
  'ORANGE': require("@/assets/videos/orange.MOV"),
  'GRAY': require("@/assets/videos/gray.MOV"),
  'PINK': require("@/assets/videos/pink.MOV"),
  'VIOLET': require("@/assets/videos/violet.MOV"),
  'LIGHT': require("@/assets/videos/light.MOV"),
  'DARK': require("@/assets/videos/dark.MOV"),
};

// Get video path for colors
const getVideoPathForColor = (color: string) => {
  return COLOR_VIDEO_MAP[color] || require("@/assets/videos/blue.MOV");
};

const Stage4Level1 = React.memo(function Stage4Level1({
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
  isSiargaoTheme = true,
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
  goToPreviousLesson: () => void;
  isSiargaoTheme?: boolean;
}) {
  const { stageId, levelId } = useLocalSearchParams();
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Cache for multiple choice options to prevent regeneration on re-render
  const [mcOptionsCache, setMcOptionsCache] = useState<{[key: string]: string[]}>({});

  // Get colors for current level - memoized to prevent recreation
  const currentLevelColors = useMemo(() =>
    LEVEL_COLORS_MAP[Number(levelId)] || ['BLUE', 'GREEN', 'RED', 'BROWN', 'BLACK'],
    [levelId]
  );

  // Progressive learning: Get colors learned up to current lesson progress
  const getLearnedColors = () => {
    const learnedColors: string[] = [];
    const currentLevelId = Number(levelId);

    // Add all colors from previously completed levels
    for (let prevLevel = 1; prevLevel < currentLevelId; prevLevel++) {
      const levelColors = LEVEL_COLORS_MAP[prevLevel] || [];
      learnedColors.push(...levelColors);
    }

    // Add colors from current level up to current progress
    for (let i = 0; i < Math.min(currentLessonIndex, dynamicLessons.length); i++) {
      const lesson = dynamicLessons[i];
      if (lesson.type === 'video_learning' && lesson.content?.[0]?.word) {
        const color = lesson.content[0].word;
        if (!learnedColors.includes(color)) {
          learnedColors.push(color);
        }
      }
    }

    return learnedColors;
  };

  // Memoize the lessons to prevent regeneration on re-render
  const memoizedLessons = useMemo(() => {
    if (!levelId) return [];

    // Use ContentGenerator to create randomized lessons for Stage 4 (colors)
    const lessons = ContentGenerator.generateDynamicColorLessons(
      Number(levelId),
      currentLevelColors,
      getVideoPathForColor,
      getAITestLetter
    );

    return lessons;
  }, [levelId, currentLevelColors]);

  // Generate dynamic content using ContentGenerator
  useEffect(() => {
    if (memoizedLessons.length > 0) {
      setDynamicLessons(memoizedLessons);
      setTotalLessons(memoizedLessons.length);
      setIsLoading(false);
    }
  }, [memoizedLessons]);

  // Update lesson title when lesson changes
  useEffect(() => {
    if (!isLoading && dynamicLessons.length > 0) {
      const currentLesson = dynamicLessons[currentLessonIndex - 1];
      if (currentLesson && currentLessonTitle !== currentLesson.title) {
        setCurrentLessonTitle(currentLesson.title);
      }
    }
  }, [currentLessonIndex, dynamicLessons, isLoading, currentLessonTitle, setCurrentLessonTitle]);

  const renderDynamicLesson = useCallback(() => {
    if (isLoading || !dynamicLessons.length) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B8A869' }}>Loading Siargao Colors...</Text>
        </View>
      );
    }

    const currentLesson = dynamicLessons[currentLessonIndex - 1];

    if (!currentLesson) {
      return null;
    }

    const content = currentLesson.content?.[0];

    switch (currentLesson.type) {
      case "level_introduction":
        return (
          <LevelIntroduction
            levelId={Number(levelId)}
            letters={currentLevelColors} // Pass current level colors as letters
            currentLessonIndex={currentLessonIndex}
            onContinue={goToNextLesson}
            goToPreviousLesson={goToPreviousLesson}
            isViganTheme={false}
            isSiargaoTheme={true} // Enable Siargao theme colors
            isManilaTheme={false}
            isBoracayTheme={false}
          />
        );

      case "video_learning":
        return (
          <VideoLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForColor(content.word) : getVideoPathForColor('BLUE')}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={isSiargaoTheme}
            isManilaTheme={false}
            isBoracayTheme={false}
            videoRef={videoRef}
            contentWord={content?.word}
          />
        );

      case "multiple_choice":
        return (
          <MultipleChoiceLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForColor(content.word) : getVideoPathForColor('BLUE')}
            choices={currentLesson.choices}
            correctAnswer={currentLesson.correctAnswer}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={true} // Enable Siargao theme colors
            isManilaTheme={false}
            isBoracayTheme={false}
          />
        );

      case "execute":
        return (
          <ExecuteLesson
            title={currentLesson.title}
            correctAnswer={currentLesson.correctAnswer} // This is now mapped to letter (A, B, C, etc.)
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={true} // Enable Siargao theme colors
            isManilaTheme={false}
            isBoracayTheme={false}
            contentWord={content?.word}
          />
        );

      case "falling_letters":
        // Use learned content from lesson data if available, otherwise calculate it
        const learnedColorsForFalling = currentLesson.learnedContent || getLearnedColors();

        return (
          <FallingLettersLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedColorsForFalling} // Pass learned colors from lesson or calculated
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false}
            isSiargaoTheme={true} // Enable Siargao theme colors and coconuts
            isManilaTheme={false}
            isBoracayTheme={false}
          />
        );

      case "balloon_pop":
        // Use learned content from lesson data if available, otherwise calculate it
        const learnedColorsForBalloon = currentLesson.learnedContent || getLearnedColors();

        return (
          <BalloonPopLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedColorsForBalloon} // Pass learned colors from lesson or calculated
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false}
            isSiargaoTheme={true} // Enable Siargao theme colors and coconuts
            isManilaTheme={false}
            isBoracayTheme={false}
          />
        );

      case "matching":
        const learnedColorsForMatching = getLearnedColors();

        // Check if we have enough learned colors for matching game (≥3)
        if (learnedColorsForMatching.length < 3) {
          // Fallback to multiple choice if less than 3 learned colors
          const mcTargetColor = learnedColorsForMatching.length > 0
            ? learnedColorsForMatching[Math.floor(Math.random() * learnedColorsForMatching.length)]
            : 'BLUE'; // Fallback to 'BLUE' if no colors learned

          // Generate or retrieve cached multiple choice options
          const cacheKey = `${currentLessonIndex}-${mcTargetColor}`;
          let mcOptions: string[];
          if (mcOptionsCache[cacheKey]) {
            mcOptions = mcOptionsCache[cacheKey];
          } else {
            // Generate simple fallback choices for the rare case of matching game with insufficient learned colors
            mcOptions = [mcTargetColor];
            const allColors = ['BLUE', 'GREEN', 'RED', 'BROWN', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE', 'GRAY', 'PINK', 'VIOLET', 'LIGHT', 'DARK'];
            const otherColors = allColors.filter(color => color !== mcTargetColor);

            while (mcOptions.length < 4 && otherColors.length > 0) {
              const randomIndex = Math.floor(Math.random() * otherColors.length);
              mcOptions.push(otherColors.splice(randomIndex, 1)[0]);
            }

            // Shuffle the options and cache them
            mcOptions.sort(() => Math.random() - 0.5);
            setMcOptionsCache(prev => ({...prev, [cacheKey]: mcOptions}));
          }

          return (
            <MultipleChoiceLesson
              title="What color is this?"
              videoSource={getVideoPathForColor(mcTargetColor)}
              choices={mcOptions}
              correctAnswer={mcTargetColor}
              videoRef={videoRef}
              setStatus={setStatus}
              currentLessonIndex={currentLessonIndex}
              isViganTheme={false}
              isSiargaoTheme={isSiargaoTheme}
              isManilaTheme={false}
              isBoracayTheme={false}
            />
          );
        }

        // Limit to maximum 4 pairs for better gameplay
        const maxPairs = 4;
        const colorsToMatch = learnedColorsForMatching.slice(0, maxPairs);

        const matchingPairs = colorsToMatch.map((color, index) => ({
          id: `pair_${index}`,
          videoPath: getVideoPathForColor(color),
          word: color,
          isMatched: false,
        }));

        return (
          <MatchingGameLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            pairs={matchingPairs}
            isViganTheme={false}
            isSiargaoTheme={isSiargaoTheme}
            isManilaTheme={false}
            isBoracayTheme={false}
          />
        );

      default:
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#B8A869' }}>
              Lesson type "{currentLesson.type}" not implemented yet
            </Text>
          </View>
        );
    }
  }, [isLoading, dynamicLessons, currentLessonIndex, videoRef, setStatus, isSiargaoTheme, goToNextLesson, goToPreviousLesson, mcOptionsCache, setMcOptionsCache]);

  return renderDynamicLesson();
});

export default Stage4Level1;