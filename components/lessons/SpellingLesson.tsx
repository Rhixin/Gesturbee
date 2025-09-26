import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function SpellingLesson({
  title,
  correctWord,
  questionWord,
  currentLessonIndex,
  isViganTheme = false,
  blankPositions,
  learnedLetters,
}: {
  title: string;
  correctWord: string[]; // Array of correct letters: ['A','P','P','L','E']
  questionWord: string[]; // Array with blanks: ['_','P','_','L','E']
  currentLessonIndex: number;
  isViganTheme?: boolean;
  blankPositions: { index: number; letter: string }[]; // Positions and letters of blanks
  learnedLetters: string[]; // Available learned letters
}) {
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
  const [prediction, setPrediction] = useState("");
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Track the current word state with filled in letters
  const [currentWordState, setCurrentWordState] = useState([...questionWord]);
  // Track remaining blank positions that need to be filled
  const [remainingBlanks, setRemainingBlanks] = useState([...blankPositions]);

  // Initialize remaining blanks when component mounts or props change
  useEffect(() => {
    setCurrentWordState([...questionWord]);
    setRemainingBlanks([...blankPositions]);
  }, [questionWord, blankPositions]);

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    const currentStageId = Number(stageId);
    const currentLevelId = Number(levelId);

    // If we're on a higher stage or level, this is new content
    if (currentStageId > userSavedStage || currentLevelId > userSavedLevel) {
      return false;
    }

    // If we're on the same stage and level, check lesson progress
    if (currentStageId == userSavedStage && currentLevelId == userSavedLevel) {
      // If current lesson is beyond saved progress, it's not done yet
      return currentLessonIndex <= userSavedLesson;
    }

    // If we're on a lower stage/level, it's already done
    return true;
  };

  // Check if all blanks are filled correctly
  const isWordComplete = () => {
    return remainingBlanks.length === 0;
  };

  // Get available letters that can fill any remaining blank
  const getAvailableLetters = () => {
    return [...new Set(remainingBlanks.map((blank) => blank.letter))];
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction.toUpperCase();
        setPrediction(predictedLetter);

        // Find the next blank in order (leftmost remaining blank) that matches the predicted letter
        const sortedBlanks = remainingBlanks.sort((a, b) => a.index - b.index);
        const nextBlank = sortedBlanks[0]; // Get the leftmost remaining blank

        // Only fill if the predicted letter matches the next expected blank
        if (nextBlank && nextBlank.letter === predictedLetter) {
          const blankToFill = nextBlank;
          const newWordState = [...currentWordState];
          newWordState[blankToFill.index] = correctWord[blankToFill.index];
          setCurrentWordState(newWordState);

          // Remove this blank from remaining blanks
          const newRemainingBlanks = remainingBlanks.filter(
            (blank) => blank.index !== blankToFill.index
          );
          setRemainingBlanks(newRemainingBlanks);

          // Check if all blanks are filled
          if (newRemainingBlanks.length === 0) {
            console.log("Spelling lesson completed!");
            const lessonAlreadyDone = isThisLessonAlreadyDone();
            console.log("Is lesson already done?", lessonAlreadyDone);
            console.log("Current lesson index:", currentLessonIndex);
            console.log("User saved lesson:", userSavedLesson);
            console.log(
              "User saved stage:",
              userSavedStage,
              "Stage ID:",
              Number(stageId)
            );
            console.log(
              "User saved level:",
              userSavedLevel,
              "Level ID:",
              Number(levelId)
            );

            if (!lessonAlreadyDone) {
              // Update Database
              if (userSavedLesson === userSavedTotalLesson) {
                console.log("Level complete! Updating to next level");
                updateLevel(
                  currentUser.id,
                  userSavedStage,
                  userSavedLevel + 1,
                  1,
                  userSavedTotalLesson, // Use the same total lessons for next level
                  true
                );
                setShowLevelCompleteModal(true);
              } else {
                console.log("Moving to next lesson:", userSavedLesson + 1);
                updateLevel(
                  currentUser.id,
                  userSavedStage,
                  userSavedLevel,
                  userSavedLesson + 1,
                  userSavedTotalLesson,
                  false
                );
              }
            }

            setShowSuccessModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
    // Don't reset - let the parent component handle navigation to next lesson
  };

  return (
    <View style={styles.container}>
      {/* Display the current word state */}
      <View style={styles.wordContainer}>
        {currentWordState.map((letter, index) => {
          const isBlank = remainingBlanks.some(
            (blank) => blank.index === index
          );
          return (
            <View
              key={index}
              style={[
                styles.letterBox,
                {
                  borderColor: isBlank
                    ? isViganTheme
                      ? "#F59E0B"
                      : "#01D3C1"
                    : "#dddddd",
                  backgroundColor: isBlank
                    ? isViganTheme
                      ? "#FEF3C7"
                      : "#E0F7FA"
                    : "#ffffff",
                },
              ]}
            >
              <Text
                style={[
                  styles.letter,
                  {
                    color: isViganTheme ? "#875C35" : "#374151",
                  },
                ]}
              >
                {letter}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Word Picture */}
      <View style={styles.pictureContainer}>
        <Image
          source={require("@/assets/images/Bee/bee4.png")}
          style={styles.wordPicture}
          resizeMode="contain"
        />
      </View>

      <View style={styles.webViewContainer}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isViganTheme ? "#875C35" : "#01D3C1"}
            />
            <Text
              style={[
                styles.loadingText,
                {
                  color: isViganTheme ? "#875C35" : "#01D3C1",
                },
              ]}
            >
              Loading...
            </Text>
          </View>
        )}
        <WebView
          source={{ uri: "https://gesturbee-app-model.vercel.app/" }}
          style={{
            width: "100%",
            height: "100%",
            opacity: isWebViewLoaded ? 1 : 0,
          }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cameraAccessibilityLabel="Allow Camera Access"
          geolocationEnabled={true}
          useWebKit={true}
          originWhitelist={[""]}
          androidHardwareAccelerationDisabled={false}
          onLoad={() => setIsWebViewLoaded(true)}
          onMessage={onMessage}
        />
      </View>

      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleContinueAndReset}
        message={"You completed the word successfully!"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    height: "55%",
  },
  title: {
    color: "black",
    fontSize: 24,
    fontFamily: "poppins-medium",
    marginLeft: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  letterBox: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  letter: {
    fontSize: 30,
    fontFamily: "poppins-bold",
    color: "black",
  },
  instructionContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  pictureContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  wordPicture: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  instruction: {
    fontSize: 18,
    fontFamily: "poppins-regular",
    color: "black",
  },
  highlightLetter: {
    fontSize: 20,
    fontFamily: "poppins-bold",
    color: "#FBBC05",
  },
  webViewContainer: {
    width: "80%",
    height: 240,
    backgroundColor: "black",
    position: "relative",
    marginBottom: 20,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: "black",
  },
  webView: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  prediction: {
    color: "black",
    fontSize: 24,
    fontFamily: "poppins-medium",
    marginLeft: 8,
    marginTop: 12,
    marginBottom: 16,
  },
});
