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

// Define number groups for each level
const LEVEL_NUMBERS_MAP: { [key: number]: string[] } = {
  1: ['1', '2', '3', '4', '5'],    // Level 1: Numbers 1-5
  2: ['6', '7', '8', '9', '10']    // Level 2: Numbers 6-10
};

// Map numbers to letters for AI testing (since AI only recognizes A-Z)
// This is a temporary workaround: 1=A, 2=B, 3=C, 4=D, 5=E, 6=F, 7=G, 8=H, 9=I, 10=J
const NUMBER_TO_LETTER_MAP: { [key: string]: string } = {
  '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E',
  '6': 'F', '7': 'G', '8': 'H', '9': 'I', '10': 'J'
};

// Helper function to get AI test letter for a number
const getAITestLetter = (number: string): string => {
  const letter = NUMBER_TO_LETTER_MAP[number];
  console.log(`[Stage2] Number ${number} mapped to letter ${letter} for AI testing`);
  return letter || 'A'; // Fallback to 'A'
};

// Static mapping for number videos (React Native requires static paths)
const NUMBER_VIDEO_MAP: { [key: string]: any } = {
  '1': require("@/assets/videos/one.MOV"),
  '2': require("@/assets/videos/two.MOV"),
  '3': require("@/assets/videos/three.MOV"),
  '4': require("@/assets/videos/four.MOV"),
  '5': require("@/assets/videos/five.MOV"),
  '6': require("@/assets/videos/six.MOV"),
  '7': require("@/assets/videos/seven.MOV"),
  '8': require("@/assets/videos/eight.MOV"),
  '9': require("@/assets/videos/nine.MOV"),
  '10': require("@/assets/videos/ten.MOV"),
};

// Get video path for numbers
const getVideoPathForNumber = (number: string) => {
  return NUMBER_VIDEO_MAP[number] || require("@/assets/videos/one.MOV");
};

const Stage2Level1 = React.memo(function Stage2Level1({
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
  isManilaTheme = true,
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
  isManilaTheme?: boolean;
}) {
  const { stageId, levelId } = useLocalSearchParams();
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Cache for multiple choice options to prevent regeneration on re-render (same as Stage 1)
  const [mcOptionsCache, setMcOptionsCache] = useState<{[key: string]: string[]}>({});

  // Get numbers for current level - memoized to prevent recreation
  const currentLevelNumbers = useMemo(() =>
    LEVEL_NUMBERS_MAP[Number(levelId)] || ['1', '2', '3', '4', '5'],
    [levelId]
  );

  // Progressive learning: Get numbers learned up to current lesson progress - function to avoid circular dependency
  const getLearnedNumbers = () => {
    const learnedNumbers: string[] = [];
    const currentLevelId = Number(levelId);

    // Add all numbers from previously completed levels
    for (let prevLevel = 1; prevLevel < currentLevelId; prevLevel++) {
      const levelNumbers = LEVEL_NUMBERS_MAP[prevLevel] || [];
      learnedNumbers.push(...levelNumbers);
    }

    // Add numbers from current level up to current progress
    for (let i = 0; i < Math.min(currentLessonIndex, dynamicLessons.length); i++) {
      const lesson = dynamicLessons[i];
      if (lesson.type === 'video_learning' && lesson.content?.[0]?.word) {
        const number = lesson.content[0].word;
        if (!learnedNumbers.includes(number)) {
          learnedNumbers.push(number);
        }
      }
    }

    return learnedNumbers;
  };

  // Memoize the lessons to prevent regeneration on re-render
  const memoizedLessons = useMemo(() => {
    if (!levelId) return [];

    // Use ContentGenerator to create randomized lessons for Stage 2 (numbers)
    const lessons = ContentGenerator.generateDynamicNumberLessons(
      Number(levelId),
      currentLevelNumbers,
      getVideoPathForNumber,
      getAITestLetter
    );

    return lessons;
  }, [levelId, currentLevelNumbers]);

  // Generate dynamic content using ContentGenerator (similar to Stage1Level1)
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
    // Reduce logging to prevent spam
    if (isLoading || !dynamicLessons.length) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#87A248' }}>Loading Manila Numbers...</Text>
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
            letters={currentLevelNumbers} // Pass current level numbers as letters
            currentLessonIndex={currentLessonIndex}
            onContinue={goToNextLesson}
            goToPreviousLesson={goToPreviousLesson}
            isViganTheme={false} // Stage 2 is Manila theme, not Vigan
            isManilaTheme={true} // Enable Manila theme colors
          />
        );

      case "video_learning":
        return (
          <VideoLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForNumber(content.word) : getVideoPathForNumber('1')}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isManilaTheme={isManilaTheme}
            videoRef={videoRef}
            contentWord={content?.word}
          />
        );

      case "multiple_choice":
        return (
          <MultipleChoiceLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForNumber(content.word) : getVideoPathForNumber('1')}
            choices={currentLesson.choices}
            correctAnswer={currentLesson.correctAnswer}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isManilaTheme={true} // Enable Manila theme colors
          />
        );

      case "execute":
        return (
          <ExecuteLesson
            title={currentLesson.title}
            correctAnswer={currentLesson.correctAnswer} // This is now mapped to letter (A, B, C, etc.)
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false} // Stage 2 is Manila theme, not Vigan
            isManilaTheme={true} // Enable Manila theme colors
            contentWord={content?.word}
          />
        );

      case "falling_letters":
        const learnedNumbersForFalling = getLearnedNumbers();

        return (
          <FallingLettersLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedNumbersForFalling} // Pass only learned numbers
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false} // Stage 2 uses Manila theme, not Vigan
            isSiargaoTheme={false} // Stage 2 is not Siargao theme
            isManilaTheme={true} // Enable Manila theme colors and surfboards
          />
        );

      case "balloon_pop":
        const learnedNumbersForBalloon = getLearnedNumbers();

        return (
          <BalloonPopLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedNumbersForBalloon} // Pass only learned numbers
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false} // Stage 2 uses Manila theme, not Vigan
            isSiargaoTheme={false} // Stage 2 is not Siargao theme
            isManilaTheme={true} // Enable Manila theme colors and coconuts
          />
        );

      case "matching":
        const learnedNumbersForMatching = getLearnedNumbers();

        // Check if we have enough learned numbers for matching game (≥3)
        if (learnedNumbersForMatching.length < 3) {
          // Fallback to multiple choice if less than 3 learned numbers
          const mcTargetNumber = learnedNumbersForMatching.length > 0
            ? learnedNumbersForMatching[Math.floor(Math.random() * learnedNumbersForMatching.length)]
            : '1'; // Fallback to '1' if no numbers learned

          // Generate or retrieve cached multiple choice options (same approach as Stage 1)
          const cacheKey = `${currentLessonIndex}-${mcTargetNumber}`;
          let mcOptions: string[];
          if (mcOptionsCache[cacheKey]) {
            mcOptions = mcOptionsCache[cacheKey];
          } else {
            // Generate simple fallback choices for the rare case of matching game with insufficient learned numbers
            mcOptions = [mcTargetNumber];
            const allNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
            const otherNumbers = allNumbers.filter(num => num !== mcTargetNumber);

            while (mcOptions.length < 4 && otherNumbers.length > 0) {
              const randomIndex = Math.floor(Math.random() * otherNumbers.length);
              mcOptions.push(otherNumbers.splice(randomIndex, 1)[0]);
            }

            // Shuffle the options and cache them
            mcOptions.sort(() => Math.random() - 0.5);
            setMcOptionsCache(prev => ({...prev, [cacheKey]: mcOptions}));
          }

          return (
            <MultipleChoiceLesson
              title="What number is this?"
              videoSource={getVideoPathForNumber(mcTargetNumber)}
              choices={mcOptions}
              correctAnswer={mcTargetNumber}
              videoRef={videoRef}
              setStatus={setStatus}
              currentLessonIndex={currentLessonIndex}
              isManilaTheme={isManilaTheme}
            />
          );
        }

        // Limit to maximum 4 pairs for better gameplay
        const maxPairs = 4;
        const numbersToMatch = learnedNumbersForMatching.slice(0, maxPairs);

        const matchingPairs = numbersToMatch.map((number, index) => ({
          id: `pair_${index}`,
          videoPath: getVideoPathForNumber(number),
          word: number,
          isMatched: false,
        }));

        return (
          <MatchingGameLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            pairs={matchingPairs}
            isManilaTheme={isManilaTheme}
          />
        );

      default:
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#9D7C00' }}>
              Lesson type "{currentLesson.type}" not implemented yet
            </Text>
          </View>
        );
    }
  }, [isLoading, dynamicLessons, currentLessonIndex, videoRef, setStatus, isManilaTheme, goToNextLesson, goToPreviousLesson, mcOptionsCache, setMcOptionsCache]);

  return renderDynamicLesson();
});

export default Stage2Level1;