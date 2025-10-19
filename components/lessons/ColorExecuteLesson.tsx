import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet, useWindowDimensions, Image } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function ColorExecuteLesson({
  title,
  correctAnswer,
  currentLessonIndex,
  isViganTheme = false,
  isSiargaoTheme = false,
  isManilaTheme = false,
  isBoracayTheme = false,
  isPalawanTheme = false,
  isCebuTheme = false,
  isBoholTheme = false,
  colorImage,
}: {
  title: string;
  correctAnswer: string;
  currentLessonIndex: number;
  isViganTheme?: boolean;
  isSiargaoTheme?: boolean;
  isManilaTheme?: boolean;
  isBoracayTheme?: boolean;
  isPalawanTheme?: boolean;
  isCebuTheme?: boolean;
  isBoholTheme?: boolean;
  colorImage: any;
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

  // Get window dimensions to adjust WebView size based on orientation
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  // Randomize message box images
  const messageBoxVariants = [
    require("@/assets/images/Message/messagebox1.png"),
    require("@/assets/images/Message/messagebox2.png"),
    require("@/assets/images/Message/messagebox3.png"),
  ];

  // Select random message box variant (memoized to keep consistent during re-renders)
  const selectedMessageBox = useMemo(() => {
    return messageBoxVariants[Math.floor(Math.random() * messageBoxVariants.length)];
  }, []);

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    const currentStageId = Number(stageId);
    const currentLevelId = Number(levelId);

    console.log("Checking if lesson is done:");
    console.log(
      "Current Stage/Level/Lesson:",
      currentStageId,
      currentLevelId,
      currentLessonIndex
    );
    console.log(
      "Saved Stage/Level/Lesson:",
      userSavedStage,
      userSavedLevel,
      userSavedLesson
    );

    // If we're on a higher stage or level, this is new content
    if (currentStageId > userSavedStage || currentLevelId > userSavedLevel) {
      console.log("Higher stage/level - not done yet");
      return false;
    }

    // If we're on the same stage and level, check lesson progress
    if (currentStageId == userSavedStage && currentLevelId == userSavedLevel) {
      const isDone = currentLessonIndex <= userSavedLesson;
      console.log(
        "Same stage/level - checking lesson progress:",
        currentLessonIndex,
        "<=",
        userSavedLesson,
        "=",
        isDone
      );
      return isDone;
    }

    // If we're on a lower stage/level, it's already done
    console.log("Lower stage/level - already done");
    return true;
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("=== COLOR EXECUTE - WEBVIEW MESSAGE ===");
      console.log("Raw data:", JSON.stringify(data, null, 2));

      if (data?.type === "prediction") {
        // Handle different possible data structures
        // For /words endpoint: data.data.prediction.top_prediction
        let predictedColor;

        if (data.data?.prediction?.top_prediction) {
          // Words endpoint - extract top_prediction
          predictedColor = data.data.prediction.top_prediction;
        } else if (data.data?.prediction?.prediction) {
          // Nested prediction
          predictedColor = data.data.prediction.prediction;
        } else if (typeof data.data?.prediction === 'string') {
          // Direct string prediction
          predictedColor = data.data.prediction;
        } else if (typeof data.prediction === 'string') {
          // Fallback
          predictedColor = data.prediction;
        }

        setPrediction(predictedColor);

        console.log("=== COLOR EXECUTE - PREDICTION DEBUG ===");
        console.log("Predicted:", predictedColor, "Type:", typeof predictedColor);
        console.log("Expected:", correctAnswer, "Type:", typeof correctAnswer);
        console.log("Are they equal?", correctAnswer === predictedColor);

        if (correctAnswer === predictedColor) {
          console.log("Correct color detected!");
          const lessonAlreadyDone = isThisLessonAlreadyDone();
          console.log("Is lesson already done?", lessonAlreadyDone);

          if (!lessonAlreadyDone) {
            // Update Database
            if (userSavedLesson === userSavedTotalLesson) {
              console.log("Level complete! Updating to next level");
              updateLevel(
                currentUser.id,
                userSavedStage,
                userSavedLevel + 1,
                1,
                userSavedTotalLesson,
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
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      {/* Title Section with Color Image and Message Box */}
      <View style={styles.titleContainer}>
        {/* Color Image on the Left (replacing bee) */}
        <Image
          source={colorImage}
          style={styles.colorImageLeft}
          resizeMode="contain"
        />

        {/* Message Box with Title Text */}
        <View style={styles.messageBoxContainer}>
          <Image
            source={selectedMessageBox}
            style={styles.messageBoxImage}
            resizeMode="contain"
          />
          <View style={styles.messageTextContainer}>
            <Text
              style={[
                styles.messageText,
                { color: isViganTheme ? "#875C35" : isSiargaoTheme ? "#9D7C00" : isManilaTheme ? "#87A248" : isBoracayTheme ? "#488DA2" : isPalawanTheme ? "#6A645C" : isCebuTheme ? "#B65828" : isBoholTheme ? "#6D825A" : "#01D3C1" }
              ]}
            >
              What color is this?
            </Text>
          </View>
        </View>
      </View>

      {/* WebView Container */}
      <View style={[
        styles.webViewContainer,
        {
          width: isPortrait ? 240 : 360,
          height: isPortrait ? 320 : 270,
        }
      ]}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isViganTheme ? "#875C35" : isManilaTheme ? "#87A248" : "#01D3C1"}
            />
            <Text
              style={[
                styles.loadingText,
                { color: isViganTheme ? "#875C35" : isManilaTheme ? "#87A248" : "#01D3C1" },
              ]}
            >
              Loading...
            </Text>
          </View>
        )}
        <WebView
          source={{
            uri: "https://gesturbee-app-model.vercel.app/words"
          }}
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
          originWhitelist={["*"]}
          androidHardwareAccelerationDisabled={false}
          onLoad={() => setIsWebViewLoaded(true)}
          onMessage={onMessage}
        />
      </View>

      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleContinueAndReset}
        message={"You executed it perfectly!"}
      />
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    width: '80%',
  },
  colorImageLeft: {
    width: 120,
    height: 120,
    marginRight: -20,
    zIndex: 2,
  },
  messageBoxContainer: {
    flex: 1,
    position: 'relative',
    height: 120,
  },
  messageBoxImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  messageTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingLeft: 40,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  webViewContainer: {
    backgroundColor: "black",
    position: "relative",
    // Width and height are set dynamically based on orientation
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
});
