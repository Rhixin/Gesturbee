import { useLevel } from "@/context/LevelContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text } from "react-native";
import VideoLesson from "../VideoLesson";
import ExecuteLesson from "../ExecuteLesson";
import ColorExecuteLesson from "../ColorExecuteLesson";
import MultipleChoiceLesson from "../MultipleChoiceLesson";
import { useLocalSearchParams } from "expo-router";
import SpellingLesson from "../SpellingLesson";
import LevelIntroduction from "../LevelIntroduction";
import FallingLettersLesson from "../FallingLettersLesson";
import BalloonPopLesson from "../BalloonPopLesson";
import MatchingGameLesson from "../MatchingGameLesson";
import React from "react";
import { ContentGenerator } from "@/utils/contentGenerator";

// Define color groups for each level - 11 colors total divided into 4 levels
const LEVEL_COLORS_MAP: { [key: number]: string[] } = {
  1: ['RED', 'BLUE', 'YELLOW'],                         // Level 1: Primary Colors (3 colors)
  2: ['ORANGE', 'GREEN', 'VIOLET'],                     // Level 2: Secondary Colors (3 colors)
  3: ['BLACK', 'WHITE', 'GRAY'],                        // Level 3: Neutral Colors (3 colors)
  4: ['BROWN', 'PINK'],                                 // Level 4: Other Colors (2 colors)
};

// AI recognizes actual color words (no mapping needed)
// Helper function that returns the color word itself for AI
const getAIWord = (color: string): string => {
  console.log(`[Stage4] Using color "${color}" for AI recognition`);
  return color; // Return the color as-is
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
};

// Get video path for colors
const getVideoPathForColor = (color: string) => {
  return COLOR_VIDEO_MAP[color] || require("@/assets/videos/blue.MOV");
};

// Static mapping for color text images (e.g., black_text.png)
const COLOR_TEXT_IMAGE_MAP: { [key: string]: any } = {
  'BLUE': require("@/assets/images/Color/blue_text.png"),
  'GREEN': require("@/assets/images/Color/green_text.png"),
  'RED': require("@/assets/images/Color/red_text.png"),
  'BROWN': require("@/assets/images/Color/brown_text.png"),
  'BLACK': require("@/assets/images/Color/black_text.png"),
  'WHITE': require("@/assets/images/Color/white_text.png"),
  'YELLOW': require("@/assets/images/Color/yellow_text.png"),
  'ORANGE': require("@/assets/images/Color/orange_text.png"),
  'GRAY': require("@/assets/images/Color/gray_text.png"),
  'PINK': require("@/assets/images/Color/pink_text.png"),
  'VIOLET': require("@/assets/images/Color/violet_text.png"),
};

// Static mapping for color swatch images (e.g., black.png)
const COLOR_IMAGE_MAP: { [key: string]: any } = {
  'BLUE': require("@/assets/images/Color/blue.png"),
  'GREEN': require("@/assets/images/Color/green.png"),
  'RED': require("@/assets/images/Color/red.png"),
  'BROWN': require("@/assets/images/Color/brown.png"),
  'BLACK': require("@/assets/images/Color/black.png"),
  'WHITE': require("@/assets/images/Color/white.png"),
  'YELLOW': require("@/assets/images/Color/yellow.png"),
  'ORANGE': require("@/assets/images/Color/orange.png"),
  'GRAY': require("@/assets/images/Color/gray.png"),
  'PINK': require("@/assets/images/Color/pink.png"),
  'VIOLET': require("@/assets/images/Color/violet.png"),
};

// Get color text image (e.g., black_text.png)
const getColorTextImage = (color: string) => {
  return COLOR_TEXT_IMAGE_MAP[color] || null;
};

// Get color swatch image (e.g., black.png)
const getColorImage = (color: string) => {
  return COLOR_IMAGE_MAP[color] || null;
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
    LEVEL_COLORS_MAP[Number(levelId)] || ['RED', 'BLUE', 'YELLOW'],
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
      getAIWord
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
            isColorStage={true}
            colorTextImage={content?.word ? getColorTextImage(content.word) : null}
            colorImage={content?.word ? getColorImage(content.word) : null}
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
          <ColorExecuteLesson
            title={currentLesson.title}
            correctAnswer={currentLesson.correctAnswer} // AI color word
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={true} // Enable Siargao theme colors
            isManilaTheme={false}
            isBoracayTheme={false}
            colorImage={content?.word ? getColorImage(content.word) : null}
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
            const allColors = ['RED', 'BLUE', 'YELLOW', 'ORANGE', 'GREEN', 'VIOLET', 'BLACK', 'WHITE', 'GRAY', 'BROWN', 'PINK'];
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

        // Use the matching pairs from the generated lesson content (exactly 3 items)
        const matchingPairs = currentLesson.content.map((item: any, index: number) => ({
          id: `pair_${index}`,
          videoPath: getVideoPathForColor(item.word), // Convert word to proper require() path
          word: item.word,
          isMatched: false,
        }));

        console.log('[MATCHING] Using pairs from lesson content:', matchingPairs);

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