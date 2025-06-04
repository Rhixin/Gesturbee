import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "../SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function SpellingLesson({
  title,
  correctWord,
  questionWord,
  currentLessonIndex,
}: {
  title: string;
  correctWord: string[]; // Array of correct letters: ['A','G','A','I','N']
  questionWord: string[]; // Array with blanks: ['_','G','_','I','N']
  currentLessonIndex: number;
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
  // Track which position we're currently trying to fill
  const [currentPosition, setCurrentPosition] = useState(0);
  // Find the first blank position to start with
  useEffect(() => {
    const firstBlankIndex = questionWord.findIndex((letter) => letter === "_");
    setCurrentPosition(firstBlankIndex !== -1 ? firstBlankIndex : -1);
  }, [questionWord]);

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    if (
      Number(stageId) == userSavedStage &&
      Number(levelId) == userSavedLevel &&
      currentLessonIndex == userSavedLesson
    ) {
      return false;
    }

    return true;
  };

  // Check if all blanks are filled correctly
  const isWordComplete = () => {
    return !currentWordState.includes("_");
  };

  // Find the next blank position
  const findNextBlankPosition = (startPos) => {
    for (let i = startPos + 1; i < questionWord.length; i++) {
      if (questionWord[i] === "_") {
        return i;
      }
    }
    return -1; // No more blanks
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction;
        setPrediction(predictedLetter);

        // Check if the current position is valid and the prediction matches what we need
        if (
          currentPosition !== -1 &&
          predictedLetter === correctWord[currentPosition]
        ) {
          // Update the current word state
          const newWordState = [...currentWordState];
          newWordState[currentPosition] = predictedLetter;
          setCurrentWordState(newWordState);

          // Find the next blank position
          const nextPosition = findNextBlankPosition(currentPosition);
          setCurrentPosition(nextPosition);

          // If there are no more blanks, the word is complete
          if (nextPosition === -1) {
            if (!isThisLessonAlreadyDone()) {
              // Update Database
              if (userSavedLesson === userSavedTotalLesson) {
                updateLevel(
                  currentUser.id,
                  userSavedStage,
                  userSavedLevel + 1,
                  1,
                  12,
                  true
                );
                setShowLevelCompleteModal(true);
              } else {
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
    // Optionally reset the state if you want to restart the exercise
    setCurrentWordState([...questionWord]);

    const firstBlankIndex = questionWord.findIndex((letter) => letter === "_");
    setCurrentPosition(firstBlankIndex !== -1 ? firstBlankIndex : -1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Display the current word state */}
      <View style={styles.wordContainer}>
        {currentWordState.map((letter, index) => (
          <View
            key={index}
            style={[
              styles.letterBox,
              {
                borderColor: index === currentPosition ? "#FBBC05" : "#dddddd",
              },
            ]}
          >
            <Text style={styles.letter}>{letter}</Text>
          </View>
        ))}
      </View>

      {/* Show which letter to sign */}
      {currentPosition !== -1 && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction}>
            Sign the letter:{" "}
            <Text style={styles.highlightLetter}>
              {correctWord[currentPosition]}
            </Text>
          </Text>
        </View>
      )}

      <View style={styles.webViewContainer}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FBBC05" />
            <Text style={styles.loadingText}>Loading...</Text>
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
    marginBottom: 16,
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
    width: "100%",
    flex: 1,
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
