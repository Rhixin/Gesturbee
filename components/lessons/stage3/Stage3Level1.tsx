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

// Define greeting groups for each level
const LEVEL_GREETINGS_MAP: { [key: number]: string[] } = {
  1: ['GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING', 'HELLO', 'HOW ARE YOU'],    // Level 1: Morning-Evening Greetings
  2: ['IM FINE', 'NICE TO MEET YOU', 'THANK YOU', 'YOURE WELCOME', 'SEE YOU TOMORROW']    // Level 2: Social Expressions
};

// Map greetings to letters for AI testing (since AI only recognizes A-Z)
// This is a temporary workaround: GOOD MORNING=A, GOOD AFTERNOON=B, etc.
const GREETING_TO_LETTER_MAP: { [key: string]: string } = {
  'GOOD MORNING': 'A', 'GOOD AFTERNOON': 'B', 'GOOD EVENING': 'C', 'HELLO': 'D', 'HOW ARE YOU': 'E',
  'IM FINE': 'F', 'NICE TO MEET YOU': 'G', 'THANK YOU': 'H', 'YOURE WELCOME': 'I', 'SEE YOU TOMORROW': 'J'
};

// Helper function to get AI test letter for a greeting
const getAITestLetter = (greeting: string): string => {
  const letter = GREETING_TO_LETTER_MAP[greeting];
  console.log(`[Stage3] Greeting "${greeting}" mapped to letter ${letter} for AI testing`);
  return letter || 'A'; // Fallback to 'A'
};

// Static mapping for greeting videos (React Native requires static paths)
const GREETING_VIDEO_MAP: { [key: string]: any } = {
  'GOOD MORNING': require("@/assets/videos/good_morning.MOV"),
  'GOOD AFTERNOON': require("@/assets/videos/good_afternoon.MOV"),
  'GOOD EVENING': require("@/assets/videos/good_evening.MOV"),
  'HELLO': require("@/assets/videos/hello.MOV"),
  'HOW ARE YOU': require("@/assets/videos/how_are_you.MOV"),
  'IM FINE': require("@/assets/videos/im_fine.MOV"),
  'NICE TO MEET YOU': require("@/assets/videos/nice_to_meet_you.MOV"),
  'THANK YOU': require("@/assets/videos/thank_you.MOV"),
  'YOURE WELCOME': require("@/assets/videos/youre_welcome.MOV"),
  'SEE YOU TOMORROW': require("@/assets/videos/see_you_tomorrow.MOV"),
};

// Get video path for greetings
const getVideoPathForGreeting = (greeting: string) => {
  return GREETING_VIDEO_MAP[greeting] || require("@/assets/videos/hello.MOV");
};

const Stage3Level1 = React.memo(function Stage3Level1({
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
  isBoracayTheme = true,
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
  isBoracayTheme?: boolean;
}) {
  const { stageId, levelId } = useLocalSearchParams();
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Cache for multiple choice options to prevent regeneration on re-render
  const [mcOptionsCache, setMcOptionsCache] = useState<{[key: string]: string[]}>({});

  // Get greetings for current level - memoized to prevent recreation
  const currentLevelGreetings = useMemo(() =>
    LEVEL_GREETINGS_MAP[Number(levelId)] || ['HELLO', 'GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING', 'HOW ARE YOU'],
    [levelId]
  );

  // Progressive learning: Get greetings learned up to current lesson progress
  const getLearnedGreetings = () => {
    const learnedGreetings: string[] = [];
    const currentLevelId = Number(levelId);

    // Add all greetings from previously completed levels
    for (let prevLevel = 1; prevLevel < currentLevelId; prevLevel++) {
      const levelGreetings = LEVEL_GREETINGS_MAP[prevLevel] || [];
      learnedGreetings.push(...levelGreetings);
    }

    // Add greetings from current level up to current progress
    for (let i = 0; i < Math.min(currentLessonIndex, dynamicLessons.length); i++) {
      const lesson = dynamicLessons[i];
      if (lesson.type === 'video_learning' && lesson.content?.[0]?.word) {
        const greeting = lesson.content[0].word;
        if (!learnedGreetings.includes(greeting)) {
          learnedGreetings.push(greeting);
        }
      }
    }

    return learnedGreetings;
  };

  // Memoize the lessons to prevent regeneration on re-render
  const memoizedLessons = useMemo(() => {
    if (!levelId) return [];

    // Use ContentGenerator to create randomized lessons for Stage 3 (greetings)
    const lessons = ContentGenerator.generateDynamicGreetingLessons(
      Number(levelId),
      currentLevelGreetings,
      getVideoPathForGreeting,
      getAITestLetter
    );

    return lessons;
  }, [levelId, currentLevelGreetings]);

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
          <Text style={{ color: '#488DA2' }}>Loading Boracay Greetings...</Text>
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
            letters={currentLevelGreetings} // Pass current level greetings as letters
            currentLessonIndex={currentLessonIndex}
            onContinue={goToNextLesson}
            goToPreviousLesson={goToPreviousLesson}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={true} // Enable Boracay theme colors
          />
        );

      case "video_learning":
        return (
          <VideoLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForGreeting(content.word) : getVideoPathForGreeting('HELLO')}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={isBoracayTheme}
            videoRef={videoRef}
            contentWord={content?.word}
          />
        );

      case "multiple_choice":
        return (
          <MultipleChoiceLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForGreeting(content.word) : getVideoPathForGreeting('HELLO')}
            choices={currentLesson.choices}
            correctAnswer={currentLesson.correctAnswer}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={true} // Enable Boracay theme colors
          />
        );

      case "execute":
        return (
          <ExecuteLesson
            title={currentLesson.title}
            correctAnswer={currentLesson.correctAnswer} // This is now mapped to letter (A, B, C, etc.)
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={true} // Enable Boracay theme colors
            contentWord={content?.word}
          />
        );

      case "falling_letters":
        const learnedGreetingsForFalling = getLearnedGreetings();

        return (
          <FallingLettersLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedGreetingsForFalling} // Pass only learned greetings
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={true} // Enable Boracay theme colors and shells
          />
        );

      case "balloon_pop":
        const learnedGreetingsForBalloon = getLearnedGreetings();

        return (
          <BalloonPopLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedGreetingsForBalloon} // Pass only learned greetings
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={true} // Enable Boracay theme colors and shells
          />
        );

      case "matching":
        const learnedGreetingsForMatching = getLearnedGreetings();

        // Check if we have enough learned greetings for matching game (≥3)
        if (learnedGreetingsForMatching.length < 3) {
          // Fallback to multiple choice if less than 3 learned greetings
          const mcTargetGreeting = learnedGreetingsForMatching.length > 0
            ? learnedGreetingsForMatching[Math.floor(Math.random() * learnedGreetingsForMatching.length)]
            : 'HELLO'; // Fallback to 'HELLO' if no greetings learned

          // Generate or retrieve cached multiple choice options
          const cacheKey = `${currentLessonIndex}-${mcTargetGreeting}`;
          let mcOptions: string[];
          if (mcOptionsCache[cacheKey]) {
            mcOptions = mcOptionsCache[cacheKey];
          } else {
            // Generate simple fallback choices for the rare case of matching game with insufficient learned greetings
            mcOptions = [mcTargetGreeting];
            const allGreetings = ['HELLO', 'GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING', 'HOW ARE YOU', 'IM FINE', 'NICE TO MEET YOU', 'THANK YOU', 'YOURE WELCOME', 'SEE YOU TOMORROW'];
            const otherGreetings = allGreetings.filter(greeting => greeting !== mcTargetGreeting);

            while (mcOptions.length < 4 && otherGreetings.length > 0) {
              const randomIndex = Math.floor(Math.random() * otherGreetings.length);
              mcOptions.push(otherGreetings.splice(randomIndex, 1)[0]);
            }

            // Shuffle the options and cache them
            mcOptions.sort(() => Math.random() - 0.5);
            setMcOptionsCache(prev => ({...prev, [cacheKey]: mcOptions}));
          }

          return (
            <MultipleChoiceLesson
              title="What greeting is this?"
              videoSource={getVideoPathForGreeting(mcTargetGreeting)}
              choices={mcOptions}
              correctAnswer={mcTargetGreeting}
              videoRef={videoRef}
              setStatus={setStatus}
              currentLessonIndex={currentLessonIndex}
              isViganTheme={false}
              isSiargaoTheme={false}
              isManilaTheme={false}
              isBoracayTheme={isBoracayTheme}
            />
          );
        }

        // Limit to maximum 4 pairs for better gameplay
        const maxPairs = 4;
        const greetingsToMatch = learnedGreetingsForMatching.slice(0, maxPairs);

        const matchingPairs = greetingsToMatch.map((greeting, index) => ({
          id: `pair_${index}`,
          videoPath: getVideoPathForGreeting(greeting),
          word: greeting,
          isMatched: false,
        }));

        return (
          <MatchingGameLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            pairs={matchingPairs}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={isBoracayTheme}
          />
        );

      default:
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#488DA2' }}>
              Lesson type "{currentLesson.type}" not implemented yet
            </Text>
          </View>
        );
    }
  }, [isLoading, dynamicLessons, currentLessonIndex, videoRef, setStatus, isBoracayTheme, goToNextLesson, goToPreviousLesson, mcOptionsCache, setMcOptionsCache]);

  return renderDynamicLesson();
});

export default Stage3Level1;