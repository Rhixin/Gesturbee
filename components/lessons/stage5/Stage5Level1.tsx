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

// Define family word groups for each level - 10 words total divided into 3 levels
const LEVEL_FAMILY_MAP: { [key: number]: string[] } = {
  1: ['FATHER', 'MOTHER', 'SON', 'DAUGHTER'],                    // Level 1: Immediate Family (4 words)
  2: ['GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNTIE'],         // Level 2: Extended Family (4 words)
  3: ['COUSIN', 'PARENTS']                                      // Level 3: Other Family (2 words)
};

// AI recognizes actual family words (no mapping needed)
// Helper function that returns the family word itself for AI
const getAIWord = (familyWord: string): string => {
  console.log(`[Stage5] Using family word "${familyWord}" for AI recognition`);
  return familyWord; // Return the family word as-is
};

// Static mapping for family word videos (React Native requires static paths)
const FAMILY_VIDEO_MAP: { [key: string]: any } = {
  'FATHER': require("@/assets/videos/father.MOV"),
  'MOTHER': require("@/assets/videos/mother.MOV"),
  'SON': require("@/assets/videos/son.MOV"),
  'DAUGHTER': require("@/assets/videos/daughter.MOV"),
  'GRANDFATHER': require("@/assets/videos/grandfather.MOV"),
  'GRANDMOTHER': require("@/assets/videos/grandmother.MOV"),
  'UNCLE': require("@/assets/videos/uncle.MOV"),
  'AUNTIE': require("@/assets/videos/auntie.MOV"),
  'COUSIN': require("@/assets/videos/cousin.MOV"),
  'PARENTS': require("@/assets/videos/parents.MOV"),
};

// Get video path for family words
const getVideoPathForFamily = (familyWord: string) => {
  return FAMILY_VIDEO_MAP[familyWord] || require("@/assets/videos/father.MOV");
};

const Stage5Level1 = React.memo(function Stage5Level1({
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
  isPalawanTheme = true,
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
  isPalawanTheme?: boolean;
}) {
  const { stageId, levelId } = useLocalSearchParams();
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Cache for multiple choice options to prevent regeneration on re-render
  const [mcOptionsCache, setMcOptionsCache] = useState<{[key: string]: string[]}>({});

  // Get family words for current level - memoized to prevent recreation
  const currentLevelFamily = useMemo(() =>
    LEVEL_FAMILY_MAP[Number(levelId)] || ['FATHER', 'MOTHER', 'SON', 'DAUGHTER'],
    [levelId]
  );

  // Progressive learning: Get family words learned up to current lesson progress
  const getLearnedFamily = () => {
    const learnedFamily: string[] = [];
    const currentLevelId = Number(levelId);

    // Add all family words from previously completed levels
    for (let prevLevel = 1; prevLevel < currentLevelId; prevLevel++) {
      const levelFamily = LEVEL_FAMILY_MAP[prevLevel] || [];
      learnedFamily.push(...levelFamily);
    }

    // Add family words from current level up to current progress
    for (let i = 0; i < Math.min(currentLessonIndex, dynamicLessons.length); i++) {
      const lesson = dynamicLessons[i];
      if (lesson.type === 'video_learning' && lesson.content?.[0]?.word) {
        const familyWord = lesson.content[0].word;
        if (!learnedFamily.includes(familyWord)) {
          learnedFamily.push(familyWord);
        }
      }
    }

    return learnedFamily;
  };

  // Memoize the lessons to prevent regeneration on re-render
  const memoizedLessons = useMemo(() => {
    if (!levelId) return [];

    // Use ContentGenerator to create randomized lessons for Stage 5 (family)
    const lessons = ContentGenerator.generateDynamicFamilyLessons(
      Number(levelId),
      currentLevelFamily,
      getVideoPathForFamily,
      getAIWord
    );

    return lessons;
  }, [levelId, currentLevelFamily]);

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
          <Text style={{ color: '#6A645C' }}>Loading Palawan Family...</Text>
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
            letters={currentLevelFamily} // Pass current level family words as letters
            currentLessonIndex={currentLessonIndex}
            onContinue={goToNextLesson}
            goToPreviousLesson={goToPreviousLesson}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={false}
            isPalawanTheme={true} // Enable Palawan theme
          />
        );

      case "video_learning":
        return (
          <VideoLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForFamily(content.word) : getVideoPathForFamily('FATHER')}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={false}
            isPalawanTheme={isPalawanTheme}
            videoRef={videoRef}
            contentWord={content?.word}
          />
        );

      case "multiple_choice":
        return (
          <MultipleChoiceLesson
            title={currentLesson.title}
            videoSource={content ? getVideoPathForFamily(content.word) : getVideoPathForFamily('FATHER')}
            choices={currentLesson.choices}
            correctAnswer={currentLesson.correctAnswer}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={false}
            isPalawanTheme={true} // Enable Palawan theme
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
            isBoracayTheme={false}
            isPalawanTheme={true} // Enable Palawan theme
            contentWord={content?.word}
          />
        );

      case "falling_letters":
        // Use learned content from lesson data if available, otherwise calculate it
        const learnedFamilyForFalling = currentLesson.learnedContent || getLearnedFamily();

        return (
          <FallingLettersLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedFamilyForFalling} // Pass learned family words from lesson or calculated
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={false}
            isPalawanTheme={true} // Enable Palawan theme with boats
          />
        );

      case "balloon_pop":
        // Use learned content from lesson data if available, otherwise calculate it
        const learnedFamilyForBalloon = currentLesson.learnedContent || getLearnedFamily();

        return (
          <BalloonPopLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedFamilyForBalloon} // Pass learned family words from lesson or calculated
            correctAnswer={currentLesson.correctAnswer} // AI mapped letter for checking
            isViganTheme={false}
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={false}
            isPalawanTheme={true} // Enable Palawan theme with boats
          />
        );

      case "matching":
        const learnedFamilyForMatching = getLearnedFamily();

        // Check if we have enough learned family words for matching game (≥3)
        if (learnedFamilyForMatching.length < 3) {
          // Fallback to multiple choice if less than 3 learned family words
          const mcTargetFamily = learnedFamilyForMatching.length > 0
            ? learnedFamilyForMatching[Math.floor(Math.random() * learnedFamilyForMatching.length)]
            : 'FATHER'; // Fallback to 'FATHER' if no family words learned

          // Generate or retrieve cached multiple choice options
          const cacheKey = `${currentLessonIndex}-${mcTargetFamily}`;
          let mcOptions: string[];
          if (mcOptionsCache[cacheKey]) {
            mcOptions = mcOptionsCache[cacheKey];
          } else {
            // Generate simple fallback choices for the rare case of matching game with insufficient learned family words
            mcOptions = [mcTargetFamily];
            const allFamily = ['FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNTIE', 'COUSIN', 'PARENTS'];
            const otherFamily = allFamily.filter(word => word !== mcTargetFamily);

            while (mcOptions.length < 4 && otherFamily.length > 0) {
              const randomIndex = Math.floor(Math.random() * otherFamily.length);
              mcOptions.push(otherFamily.splice(randomIndex, 1)[0]);
            }

            // Shuffle the options and cache them
            mcOptions.sort(() => Math.random() - 0.5);
            setMcOptionsCache(prev => ({...prev, [cacheKey]: mcOptions}));
          }

          return (
            <MultipleChoiceLesson
              title="What family member is this?"
              videoSource={getVideoPathForFamily(mcTargetFamily)}
              choices={mcOptions}
              correctAnswer={mcTargetFamily}
              videoRef={videoRef}
              setStatus={setStatus}
              currentLessonIndex={currentLessonIndex}
              isViganTheme={false}
              isSiargaoTheme={false}
              isManilaTheme={false}
              isBoracayTheme={false}
              isPalawanTheme={isPalawanTheme}
            />
          );
        }

        // Use the matching pairs from the generated lesson content (exactly 3 items)
        const matchingPairs = currentLesson.content.map((item: any, index: number) => ({
          id: `pair_${index}`,
          videoPath: getVideoPathForFamily(item.word), // Convert word to proper require() path
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
            isSiargaoTheme={false}
            isManilaTheme={false}
            isBoracayTheme={false}
            isPalawanTheme={isPalawanTheme}
          />
        );

      default:
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#6A645C' }}>
              Lesson type "{currentLesson.type}" not implemented yet
            </Text>
          </View>
        );
    }
  }, [isLoading, dynamicLessons, currentLessonIndex, videoRef, setStatus, isPalawanTheme, goToNextLesson, goToPreviousLesson, mcOptionsCache, setMcOptionsCache]);

  return renderDynamicLesson();
});

export default Stage5Level1;