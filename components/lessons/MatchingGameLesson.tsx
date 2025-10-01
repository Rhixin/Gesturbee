import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { StyleSheet, Dimensions } from "react-native";
import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "@/components/modals/SuccessModal";
import { getVideoPathForLetter } from "@/utils/alphabetContent";

const { width, height } = Dimensions.get("window");

interface MatchingPair {
  id: string;
  videoPath: string;
  word: string;
  isMatched: boolean;
}

interface MatchingGameLessonProps {
  title: string;
  currentLessonIndex: number;
  pairs: MatchingPair[];
  isViganTheme?: boolean;
}

export default function MatchingGameLesson({
  title,
  currentLessonIndex,
  pairs,
  isViganTheme = false,
}: MatchingGameLessonProps) {
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    updateLevel,
    setShowLevelCompleteModal,
  } = useLevel();
  const { stageId, levelId } = useLocalSearchParams();
  const { currentUser } = useAuth();

  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(pairs);
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedMatches, setCompletedMatches] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Shuffle the answer order to randomize positions
  const shuffledAnswers = useMemo(() => {
    const answers = pairs.map(pair => pair.word);
    return [...answers].sort(() => Math.random() - 0.5);
  }, [pairs]);

  // Generate unique colors for each match
  const matchColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  const getMatchColor = (videoId: string, answerWord: string) => {
    if (matches[videoId] === answerWord) {
      const matchIndex = Object.keys(matches).indexOf(videoId);
      return matchColors[matchIndex % matchColors.length];
    }
    return null;
  };

  // videoPath is already processed by getVideoPathForLetter, so use it directly

  const handleVideoClick = (videoId: string) => {
    if (matches[videoId]) {
      // Already matched, do nothing
      return;
    }

    if (selectedVideo === videoId) {
      // Deselect if clicking the same video
      setSelectedVideo(null);
    } else {
      // Select this video
      setSelectedVideo(videoId);
    }
  };

  const handleAnswerClick = (answerWord: string) => {
    if (!selectedVideo) {
      // No video selected
      return;
    }

    // Check if this answer is already matched
    const alreadyMatched = Object.values(matches).includes(answerWord);
    if (alreadyMatched) {
      return;
    }

    // Check if this is the correct match
    const selectedVideoPair = pairs.find(p => p.id === selectedVideo);
    if (selectedVideoPair && selectedVideoPair.word === answerWord) {
      // Correct match!
      handleSuccessfulMatch(selectedVideo, answerWord);
      setSelectedVideo(null);
    } else {
      // Wrong match - deselect video
      setSelectedVideo(null);
    }
  };

  const handleSuccessfulMatch = (videoId: string, answerId: string) => {
    setMatches((prev) => ({
      ...prev,
      [videoId]: answerId,
    }));

    setCompletedMatches((prev) => {
      const newCount = prev + 1;
      if (newCount === pairs.length) {
        // All matches completed
        setTimeout(() => {
          handleLevelComplete();
        }, 500);
      }
      return newCount;
    });
  };

  const handleLevelComplete = async () => {
    setShowSuccessModal(true);

    if (currentUser) {
      try {
        const isThisLessonAlreadyDone = () => {
          const currentStageId = Number(stageId);
          const currentLevelId = Number(levelId);

          if (currentStageId < userSavedStage) return true;
          if (
            currentStageId === userSavedStage &&
            currentLevelId < userSavedLevel
          )
            return true;
          if (
            currentStageId === userSavedStage &&
            currentLevelId === userSavedLevel &&
            currentLessonIndex < userSavedLesson
          )
            return true;

          return false;
        };

        if (!isThisLessonAlreadyDone()) {
          if (currentLessonIndex === userSavedTotalLesson) {
            setShowLevelCompleteModal(true);
          }

          await updateLevel(
            Number(stageId),
            Number(levelId),
            currentLessonIndex + 1,
            userSavedTotalLesson
          );
        }
      } catch (error) {
        console.error("Error updating level:", error);
      }
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
  };

  // Get border color for matched pairs
  const getVideoBorderColor = (videoId: string) => {
    if (matches[videoId]) {
      const matchIndex = Object.keys(matches).indexOf(videoId);
      return matchColors[matchIndex % matchColors.length];
    }
    if (selectedVideo === videoId) {
      return "#2196F3"; // Blue for selected
    }
    return "#ddd"; // Default border
  };

  const getAnswerBorderColor = (answerWord: string) => {
    const matchedVideoId = Object.keys(matches).find(key => matches[key] === answerWord);
    if (matchedVideoId) {
      const matchIndex = Object.keys(matches).indexOf(matchedVideoId);
      return matchColors[matchIndex % matchColors.length];
    }
    return "#ddd"; // Default border
  };

  return (
    <View style={styles.container}>
      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleSuccess}
        message="Great job! You matched all the pairs correctly!"
      />

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Left Column - Videos */}
        <View style={styles.leftColumn}>
          {pairs.map((pair, index) => (
            <TouchableOpacity
              key={pair.id}
              onPress={() => handleVideoClick(pair.id)}
            >
              <View
                style={[
                  styles.videoContainer,
                  { borderColor: getVideoBorderColor(pair.id) },
                  selectedVideo === pair.id && styles.selectedVideo,
                ]}
              >
                <Video
                  source={pair.videoPath}
                  style={styles.video}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={true}
                  isLooping={true}
                  isMuted={true}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right Column - Answer Boxes */}
        <View style={styles.rightColumn}>
          {shuffledAnswers.map((answerWord, index) => (
            <TouchableOpacity
              key={`answer-${answerWord}`}
              onPress={() => handleAnswerClick(answerWord)}
            >
              <View
                style={[
                  styles.answerBox,
                  { borderColor: getAnswerBorderColor(answerWord) },
                  isViganTheme && styles.viganAnswerBox,
                ]}
              >
                <Text
                  style={[
                    styles.answerText,
                    isViganTheme && styles.viganAnswerText,
                  ]}
                >
                  {answerWord}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, isViganTheme && styles.viganText]}>
          Matched: {completedMatches}/{pairs.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  viganTitle: {
    color: "#875C35",
  },
  instruction: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  viganText: {
    color: "#875C35",
  },
  gameArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 60,
    paddingVertical: 20,
  },
  leftColumn: {
    flex: 0.25, // Even narrower columns
    alignItems: "center",
    justifyContent: "space-around",
    marginRight: 80, // Much larger margin between columns
  },
  rightColumn: {
    flex: 0.25, // Even narrower columns
    alignItems: "center",
    justifyContent: "space-around",
    marginLeft: 80, // Much larger margin between columns
  },
  videoContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#ddd",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedVideo: {
    borderWidth: 4,
    elevation: 8,
    shadowOpacity: 0.3,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  answerBox: {
    width: 120,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viganAnswerBox: {
    backgroundColor: "#FFE9C3",
  },
  answerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  viganAnswerText: {
    color: "#875C35",
  },
  progressContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
});
