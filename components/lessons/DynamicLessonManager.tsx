import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLevel } from '@/context/LevelContext';
import { useAuth } from '@/context/AuthContext';

// Import lesson components
import VideoLesson from './VideoLesson';
import MultipleChoiceLesson from './MultipleChoiceLesson';
import ExecuteLesson from './ExecuteLesson';
import SpellingLesson from './SpellingLesson';
import FallingLettersLesson from './FallingLettersLesson';
import BalloonPopLesson from './BalloonPopLesson';
import MatchingGameLesson from './MatchingGameLesson';

// Import types and utilities
import {
  MinigameSession,
  MinigameResult,
  MinigameType,
} from '@/types/minigame';
import { ContentGenerator } from '@/utils/contentGenerator';

interface DynamicLessonManagerProps {
  videoRef: React.RefObject<any>;
  setStatus: (status: any) => void;
  currentLessonIndex: number;
  setCurrentLessonIndex: React.Dispatch<React.SetStateAction<number>>;
  totalLessons: number;
  setTotalLessons: React.Dispatch<React.SetStateAction<number>>;
  currentLessonTitle: string;
  setCurrentLessonTitle: React.Dispatch<React.SetStateAction<string>>;
  goToNextLesson: () => void;
}

const DynamicLessonManager: React.FC<DynamicLessonManagerProps> = ({
  videoRef,
  setStatus,
  currentLessonIndex,
  setCurrentLessonIndex,
  totalLessons,
  setTotalLessons,
  currentLessonTitle,
  setCurrentLessonTitle,
  goToNextLesson,
}) => {
  const { stageId, levelId } = useLocalSearchParams();
  const { userSavedStage, userSavedLevel, userSavedLesson } = useLevel();
  const { currentUser } = useAuth();

  const [currentSession, setCurrentSession] = useState<MinigameSession | null>(null);
  const [lessonProgression, setLessonProgression] = useState<MinigameType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const LESSON_TITLES: Record<MinigameType, string[]> = {
    video_learning: ["Learn the Sign", "Watch and Learn", "New Sign Introduction"],
    multiple_choice: ["What sign is this?", "Choose the Correct Answer", "Test Your Knowledge"],
    gesture_recognition: ["Show the Sign", "Your Turn to Sign", "Practice Time"],
    spelling: ["Complete the Word", "Fill in the Blanks", "Spelling Challenge"],
    matching: ["Match the Signs", "Find the Pairs", "Memory Match"],
    falling_letters: ["Catch the Letters", "Letter Rain", "Spelling Drop"],
    balloon_pop: ["Pop the Balloons", "Balloon Challenge", "Time to Pop"],
    memory_cards: ["Memory Game", "Card Match", "Remember the Signs"],
    sequence_builder: ["Build the Sequence", "Order the Signs", "Arrange Correctly"],
    level_introduction: ["Welcome", "Let's Begin", "Level Introduction"],
  };

  useEffect(() => {
    initializeLessons();
  }, [stageId, levelId]);

  useEffect(() => {
    if (lessonProgression.length > 0) {
      generateCurrentSession();
    }
  }, [currentLessonIndex, lessonProgression]);

  const initializeLessons = () => {
    if (!stageId || !levelId) return;

    const progression = ContentGenerator.generateLessonProgression(
      Number(stageId),
      Number(levelId)
    );

    setLessonProgression(progression);
    setTotalLessons(progression.length);
    setIsLoading(false);
  };

  const generateCurrentSession = () => {
    if (currentLessonIndex <= 0 || currentLessonIndex > lessonProgression.length) return;

    const minigameType = lessonProgression[currentLessonIndex - 1];
    const session = ContentGenerator.generateMinigameSession(
      Number(stageId),
      Number(levelId),
      currentLessonIndex,
      minigameType
    );

    setCurrentSession(session);

    // Set lesson title
    const titles = LESSON_TITLES[minigameType];
    const titleIndex = (currentLessonIndex - 1) % titles.length;
    setCurrentLessonTitle(titles[titleIndex]);
  };

  const handleMinigameComplete = (result: MinigameResult) => {
    if (!currentSession) return;

    // Update session with results
    const updatedSession = {
      ...currentSession,
      isCompleted: true,
      score: result.score,
      attempts: result.attempts,
      completionTime: new Date(),
    };

    setCurrentSession(updatedSession);

    // Handle progression logic here
    if (result.success) {
      // Progress to next lesson or level
      setTimeout(() => {
        goToNextLesson();
      }, 2000);
    }
  };

  const handleGameEnd = () => {
    goToNextLesson();
  };

  if (isLoading || !currentSession) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-poppins">Loading lesson...</Text>
      </View>
    );
  }

  const renderCurrentLesson = () => {
    const minigameType = lessonProgression[currentLessonIndex - 1];
    const content = currentSession.content[0]; // Use first content item for single lessons

    switch (minigameType) {
      case 'video_learning':
        return (
          <VideoLesson
            title={`This is '${content.word}'`}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
            videoSource={{ uri: content.videoPath }}
          />
        );

      case 'multiple_choice':
        const choices = generateMultipleChoiceOptions(content.word);
        return (
          <MultipleChoiceLesson
            title="What sign is this?"
            videoSource={{ uri: content.videoPath }}
            choices={choices}
            correctAnswer={content.word}
            videoRef={videoRef}
            setStatus={setStatus}
            currentLessonIndex={currentLessonIndex}
          />
        );

      case 'gesture_recognition':
        return (
          <ExecuteLesson
            title={`Execute ${content.word}`}
            correctAnswer={content.word}
            currentLessonIndex={currentLessonIndex}
          />
        );

      case 'spelling':
        const spellingData = generateSpellingData(content.word);
        return (
          <SpellingLesson
            title="Can you fill in the missing letters?"
            correctWord={spellingData.correctWord}
            questionWord={spellingData.questionWord}
            currentLessonIndex={currentLessonIndex}
            blankPositions={spellingData.blankPositions}
            learnedLetters={spellingData.learnedLetters}
            isViganTheme={Number(stageId) === 1}
          />
        );

      case 'falling_letters':
        const fallingLettersData = generateLearnedLetters();
        return (
          <FallingLettersLesson
            title="Catch the Letters"
            currentLessonIndex={currentLessonIndex}
            learnedLetters={fallingLettersData}
            isViganTheme={Number(stageId) === 1}
          />
        );

      case 'balloon_pop':
        const balloonLettersData = generateLearnedLetters();
        return (
          <BalloonPopLesson
            title="Pop the Balloons"
            currentLessonIndex={currentLessonIndex}
            learnedLetters={balloonLettersData}
            isViganTheme={Number(stageId) === 1}
          />
        );

      case 'matching':
        const matchingLettersData = generateLearnedLetters();

        // Fallback to multiple choice if less than 3 letters learned
        if (matchingLettersData.length < 3) {
          const choices = generateMultipleChoiceOptions(content.word);
          return (
            <MultipleChoiceLesson
              title="What sign is this?"
              videoSource={{ uri: content.videoPath }}
              choices={choices}
              correctAnswer={content.word}
              videoRef={videoRef}
              setStatus={setStatus}
              currentLessonIndex={currentLessonIndex}
            />
          );
        }

        const matchingPairs = matchingLettersData.slice(0, 3).map((letter, index) => ({
          id: `pair_${index}`,
          videoPath: `${letter.toLowerCase()}.mp4`,
          word: letter,
          isMatched: false,
        }));

        return (
          <MatchingGameLesson
            title="Match the Signs"
            currentLessonIndex={currentLessonIndex}
            pairs={matchingPairs}
            isViganTheme={Number(stageId) === 1}
          />
        );

      // Add other minigame types as needed
      default:
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg font-poppins">
              Minigame type "{minigameType}" not implemented yet
            </Text>
          </View>
        );
    }
  };

  const generateMultipleChoiceOptions = (correctAnswer: string): string[] => {
    const category = ContentGenerator.getCategoryForStage(Number(stageId));
    const allContent = ContentGenerator.getContentForLevel(Number(stageId), Number(levelId));

    const options = [correctAnswer];
    const otherOptions = allContent
      .filter(item => item.word !== correctAnswer)
      .map(item => item.word)
      .slice(0, 3);

    options.push(...otherOptions);

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  const generateLearnedLetters = (): string[] => {
    // Generate learned letters based on current stage and level
    const category = ContentGenerator.getCategoryForStage(Number(stageId));
    const levelContent = ContentGenerator.getContentForLevel(Number(stageId), Number(levelId));
    return [...new Set(
      levelContent.flatMap(content => content.word.split(''))
    )];
  };

  const generateSpellingData = (word: string) => {
    const letters = word.split('');
    const questionWord = letters.map((letter, index) => {
      // Hide random letters (about 40% of them)
      return Math.random() < 0.4 ? '_' : letter;
    });

    // Ensure at least one letter is hidden and one is shown
    if (!questionWord.includes('_')) {
      questionWord[Math.floor(Math.random() * questionWord.length)] = '_';
    }
    if (!questionWord.some(l => l !== '_')) {
      questionWord[0] = letters[0];
    }

    // Generate blank positions array for SpellingLesson component
    const blankPositions: { index: number; letter: string }[] = [];
    questionWord.forEach((letter, index) => {
      if (letter === '_') {
        blankPositions.push({
          index,
          letter: letters[index] // The correct letter that should go in this position
        });
      }
    });

    const learnedLetters = generateLearnedLetters();

    return {
      correctWord: letters,
      questionWord,
      blankPositions,
      learnedLetters
    };
  };

  return <>{renderCurrentLesson()}</>;
};

export default DynamicLessonManager;