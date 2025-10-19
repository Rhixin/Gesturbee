import { useLevel } from "@/context/LevelContext";
import { useEffect, useState } from "react";
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
import {
  getVideoPathForLetter,
  generateProgressiveSpellingWords,
  generateProgressiveMultipleChoice,
  generateSpellingPuzzle,
  getWordsForLetter,
  generateLetterSpellingPuzzle,
  generateProgressiveSpellingPuzzle,
  getImagePathForWord
} from "@/utils/alphabetContent";
import { ContentGenerator } from "@/utils/contentGenerator";

export default function Stage1Level1({
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
  isViganTheme,
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
  isViganTheme: boolean;
}) {
  const { stageId, levelId } = useLocalSearchParams();
  const { userSavedStage, userSavedLevel, userSavedLesson } = useLevel();

  // Dynamic lesson content
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);
  const [isContentGenerated, setIsContentGenerated] = useState(false);
  // Cache for multiple choice options to prevent regeneration on re-render
  const [mcOptionsCache, setMcOptionsCache] = useState<{[key: string]: string[]}>({});
  // Cache for spelling puzzles to prevent regeneration on re-render
  const [spellingCache, setSpellingCache] = useState<{[key: string]: any}>({});

  // Initializing values based on current data
  useEffect(() => {
    const initializeContent = async () => {
      const currentLevelId = Number(levelId);
      const currentStageId = Number(stageId);

      // Generate dynamic content for all stages
      const lessons = ContentGenerator.generateDynamicAlphabetLessons(currentLevelId);
      setDynamicLessons(lessons);
      setTotalLessons(lessons.length);
      setCurrentLessonIndex(Math.max(1, userSavedLesson || 1));

      // Set initial lesson title
      if (lessons.length > 0) {
        const lessonIndex = Math.max(0, (userSavedLesson || 1) - 1);
        setCurrentLessonTitle(lessons[lessonIndex]?.title || `Lesson ${userSavedLesson || 1}`);
      }

      setIsContentGenerated(true);
    };

    initializeContent();
  }, [stageId, levelId]);


  // Updating titles when navigating
  useEffect(() => {
    if (dynamicLessons.length > 0 && currentLessonIndex > 0) {
      const lessonIndex = Math.max(0, currentLessonIndex - 1);
      const lesson = dynamicLessons[lessonIndex];
      if (lesson) {
        setCurrentLessonTitle(lesson.title);
      }
    }
  }, [currentLessonIndex, dynamicLessons]);

  // Show loading until content is generated
  if (!isContentGenerated) {
    return <View></View>;
  }

  // Get current lesson data
  const getCurrentLesson = () => {
    if (dynamicLessons.length > 0 && currentLessonIndex > 0) {
      return dynamicLessons[currentLessonIndex - 1];
    }
    return null;
  };

  // Get letters that have been introduced through video lessons up to current progress
  const getLearnedLetters = () => {
    const learnedLetters: string[] = [];
    const currentLevelId = Number(levelId);

    // Add all letters from previously completed levels
    for (let prevLevel = 1; prevLevel < currentLevelId; prevLevel++) {
      const levelLetters = getLettersForLevel(prevLevel);
      learnedLetters.push(...levelLetters);
    }

    // Add letters from current level up to current progress
    for (let i = 0; i < Math.min(currentLessonIndex, dynamicLessons.length); i++) {
      const lesson = dynamicLessons[i];
      if (lesson.config?.type === 'video_learning' && lesson.content?.[0]?.word) {
        const letter = lesson.content[0].word;
        if (letter.length === 1 && !learnedLetters.includes(letter)) {
          learnedLetters.push(letter);
        }
      }
    }

    return learnedLetters;
  };

  // Helper function to get letters for a specific level (moved from ContentGenerator)
  const getLettersForLevel = (levelId: number): string[] => {
    const levelLetterMapping: { [key: number]: string[] } = {
      1: ['A', 'B', 'C'],
      2: ['D', 'E', 'F'],
      3: ['G', 'H', 'I'],
      4: ['J', 'K', 'L'],
      5: ['M', 'N', 'O'],
      6: ['P', 'Q', 'R'],
      7: ['S', 'T', 'U'],
      8: ['V', 'W', 'X'],
      9: ['Y', 'Z']
    };
    return levelLetterMapping[levelId] || [];
  };

  // Check if content uses only learned letters
  const isContentValid = (content: any) => {
    if (!content?.word) return false;

    const learnedLetters = getLearnedLetters();
    const word = content.word.toUpperCase();

    // For single letters, check if it's been learned
    if (word.length === 1) {
      return learnedLetters.includes(word);
    }

    // For words, check if all letters have been learned
    return word.split('').every(letter => learnedLetters.includes(letter));
  };

  const currentLesson = getCurrentLesson();

  const renderDynamicLesson = () => {
    if (!currentLesson) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading lesson...</Text>
        </View>
      );
    }

    const minigameType = currentLesson.config?.type;
    const content = currentLesson.content?.[0]; // Get first content item

    // Debug logging
    console.log('Current lesson:', currentLesson.title);
    console.log('Minigame type:', minigameType);
    console.log('Content:', content);
    console.log('Learned letters up to this point:', getLearnedLetters());
    console.log('Current lesson index:', currentLessonIndex);

    switch (minigameType) {
      case 'level_introduction':
        const levelLetters = content?.word?.split(', ') || ['A', 'B', 'C'];
        return (
          <LevelIntroduction
            levelId={Number(levelId)}
            letters={levelLetters}
            currentLessonIndex={currentLessonIndex}
            onContinue={() => {}}
            goToPreviousLesson={() => {}}
            isViganTheme={isViganTheme}
          />
        );

      case 'video_learning':
        return (
          <VideoLesson
            title={currentLesson.title}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            videoSource={content ? getVideoPathForLetter(content.word) : getVideoPathForLetter('A')}
            isViganTheme={isViganTheme}
            contentWord={content?.word}
          />
        );

      case 'multiple_choice':
        const learnedLettersForMC = getLearnedLetters();
        let mcTargetLetter = content?.word;

        // Ensure target is a single letter only
        if (mcTargetLetter && mcTargetLetter.length > 1) {
          mcTargetLetter = mcTargetLetter[0];
        }

        // If content letter hasn't been learned, use the most recent learned letter
        if (!mcTargetLetter || (!isContentValid({word: mcTargetLetter}) && learnedLettersForMC.length > 0)) {
          mcTargetLetter = learnedLettersForMC[learnedLettersForMC.length - 1];
        }

        // Fallback to 'A' if no letters learned
        mcTargetLetter = mcTargetLetter || 'A';

        // Generate or retrieve cached multiple choice options
        const cacheKey = `${currentLessonIndex}-${mcTargetLetter}`;
        let mcOptions: string[];
        if (mcOptionsCache[cacheKey]) {
          mcOptions = mcOptionsCache[cacheKey];
        } else {
          // Generate options using only single learned letters + target letter
          const availableLetters = [...new Set([...learnedLettersForMC, mcTargetLetter])].filter(letter => letter.length === 1);
          mcOptions = [mcTargetLetter];

          // Add other single learned letters as wrong options
          const otherOptions = availableLetters.filter(l => l !== mcTargetLetter && l.length === 1);
          while (mcOptions.length < 4 && otherOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherOptions.length);
            mcOptions.push(otherOptions.splice(randomIndex, 1)[0]);
          }

          // Fill remaining slots with single letters if needed
          while (mcOptions.length < 4) {
            const singleLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
            const remaining = singleLetters.filter(l => !mcOptions.includes(l));
            if (remaining.length > 0) {
              mcOptions.push(remaining[Math.floor(Math.random() * remaining.length)]);
            } else {
              break;
            }
          }

          // Ensure all options are single letters and shuffle
          mcOptions = mcOptions.filter(option => option.length === 1).sort(() => Math.random() - 0.5);
          setMcOptionsCache(prev => ({...prev, [cacheKey]: mcOptions}));
        }
        return (
          <MultipleChoiceLesson
            title={currentLesson.title}
            videoSource={getVideoPathForLetter(mcTargetLetter)}
            choices={mcOptions}
            correctAnswer={mcTargetLetter}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={isViganTheme}
          />
        );

      case 'gesture_recognition':
        const learnedLettersForExecution = getLearnedLetters();
        let targetLetter = content?.word;

        // If content letter hasn't been learned, use the most recent learned letter
        if (!isContentValid(content) && learnedLettersForExecution.length > 0) {
          targetLetter = learnedLettersForExecution[learnedLettersForExecution.length - 1];
        }

        // Fallback to 'A' if no letters learned (shouldn't happen normally)
        targetLetter = targetLetter || 'A';

        return (
          <ExecuteLesson
            title={`Execute Letter '${targetLetter}'`}
            correctAnswer={targetLetter}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={isViganTheme}
          />
        );

      case 'spelling':
        // Generate or retrieve cached spelling puzzle
        const spellingCacheKey = `${currentLessonIndex}-${content?.word}`;
        let puzzle: any;
        if (spellingCache[spellingCacheKey]) {
          puzzle = spellingCache[spellingCacheKey];
        } else {
          // Progressive spelling: use only letters that have been introduced through video lessons
          const learnedLetters = getLearnedLetters();

          // Determine the current letter being learned in this lesson group
          let currentLetterBeingLearned = 'A'; // fallback

          // Find the most recent video lesson to get the current letter
          for (let i = currentLessonIndex - 1; i >= 0; i--) {
            const prevLesson = dynamicLessons[i];
            if (prevLesson?.config?.type === 'video_learning' && prevLesson.content?.[0]?.word) {
              const letter = prevLesson.content[0].word;
              if (letter.length === 1) {
                currentLetterBeingLearned = letter;
                break;
              }
            }
          }

          // Get words specifically from the current letter's word bank
          const currentLetterWords = getWordsForLetter(currentLetterBeingLearned);

          // Filter words to only use those that contain letters we've learned
          const validWords = currentLetterWords.filter(word => {
            const wordLetters = word.split('');
            return wordLetters.every(letter => learnedLetters.includes(letter.toUpperCase()));
          });

          // Select a word from the current letter's word bank, fallback to any valid word
          const selectedWord = validWords.length > 0
            ? validWords[Math.floor(Math.random() * validWords.length)]
            : currentLetterWords[Math.floor(Math.random() * currentLetterWords.length)];

          puzzle = generateProgressiveSpellingPuzzle(selectedWord, currentLetterBeingLearned, learnedLetters);
          // Store selectedWord in puzzle for image path
          puzzle.selectedWord = selectedWord;
          setSpellingCache(prev => ({...prev, [spellingCacheKey]: puzzle}));
        }

        return (
          <SpellingLesson
            title={currentLesson.title}
            correctWord={puzzle.correctWord}
            questionWord={puzzle.questionWord}
            currentLessonIndex={currentLessonIndex}
            isViganTheme={isViganTheme}
            blankPositions={puzzle.blankPositions}
            learnedLetters={puzzle.learnedLetters}
            wordForImage={puzzle.selectedWord}
          />
        );

      case 'falling_letters':
        const learnedLettersForFalling = getLearnedLetters();
        return (
          <FallingLettersLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedLettersForFalling} // Updated prop name
            correctAnswer={currentLesson.correctAnswer} // Add correct answer prop
            isViganTheme={isViganTheme}
            isSiargaoTheme={false} // Stage 1 is not Siargao themed
          />
        );

      case 'balloon_pop':
        const learnedLettersForBalloon = getLearnedLetters();
        return (
          <BalloonPopLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            learnedContent={learnedLettersForBalloon} // Updated prop name
            correctAnswer={currentLesson.correctAnswer} // Add correct answer prop
            isViganTheme={isViganTheme}
            isSiargaoTheme={false} // Stage 1 is not Siargao themed
          />
        );

      case 'matching':
        const learnedLettersForMatching = getLearnedLetters();

        // Only show matching game if there are at least 3 learned letters
        if (learnedLettersForMatching.length < 3) {
          // Fallback to multiple choice instead
          const learnedLettersForMC = getLearnedLetters();
          let mcTargetLetter = content?.word;

          // Ensure target is a single letter only
          if (mcTargetLetter && mcTargetLetter.length > 1) {
            mcTargetLetter = mcTargetLetter[0];
          }

          // If content letter hasn't been learned, use the most recent learned letter
          if (!mcTargetLetter || (!isContentValid({word: mcTargetLetter}) && learnedLettersForMC.length > 0)) {
            mcTargetLetter = learnedLettersForMC[learnedLettersForMC.length - 1];
          }

          // Fallback to 'A' if no letters learned
          mcTargetLetter = mcTargetLetter || 'A';

          // Generate or retrieve cached multiple choice options
          const cacheKey = `${currentLessonIndex}-${mcTargetLetter}`;
          let mcOptions: string[];
          if (mcOptionsCache[cacheKey]) {
            mcOptions = mcOptionsCache[cacheKey];
          } else {
            // Generate options using only single learned letters + target letter
            const availableLetters = [...new Set([...learnedLettersForMC, mcTargetLetter])].filter(letter => letter.length === 1);
            mcOptions = [mcTargetLetter];

            // Add other single learned letters as wrong options
            const otherOptions = availableLetters.filter(l => l !== mcTargetLetter && l.length === 1);
            while (mcOptions.length < 4 && otherOptions.length > 0) {
              const randomIndex = Math.floor(Math.random() * otherOptions.length);
              mcOptions.push(otherOptions.splice(randomIndex, 1)[0]);
            }

            // Fill remaining slots with single letters if needed
            while (mcOptions.length < 4) {
              const singleLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
              const remaining = singleLetters.filter(l => !mcOptions.includes(l));
              if (remaining.length > 0) {
                mcOptions.push(remaining[Math.floor(Math.random() * remaining.length)]);
              } else {
                break;
              }
            }

            // Ensure all options are single letters and shuffle
            mcOptions = mcOptions.filter(option => option.length === 1).sort(() => Math.random() - 0.5);
            setMcOptionsCache(prev => ({...prev, [cacheKey]: mcOptions}));
          }

          return (
            <MultipleChoiceLesson
              title="What sign is this?"
              videoSource={getVideoPathForLetter(mcTargetLetter)}
              choices={mcOptions}
              correctAnswer={mcTargetLetter}
              videoRef={videoRef}
              setStatus={setStatus}
              currentLessonIndex={currentLessonIndex}
              isViganTheme={isViganTheme}
            />
          );
        }

        // Use the matching pairs from the generated lesson content
        const matchingPairs = currentLesson.content.map((item: any, index: number) => ({
          id: `pair_${index}`,
          videoPath: getVideoPathForLetter(item.word), // Convert word to proper require() path
          word: item.word,
          isMatched: false,
        }));

        console.log('[MATCHING] Using pairs from lesson content:', matchingPairs);

        return (
          <MatchingGameLesson
            title={currentLesson.title}
            currentLessonIndex={currentLessonIndex}
            pairs={matchingPairs}
            isViganTheme={isViganTheme}
          />
        );

      default:
        return (
          <VideoLesson
            title={currentLesson.title}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            videoSource={content ? getVideoPathForLetter(content.word) : getVideoPathForLetter('A')}
            isViganTheme={isViganTheme}
            contentWord={content?.word}
          />
        );
    }
  };


  return (
    <>
      {renderDynamicLesson()}
    </>
  );
}