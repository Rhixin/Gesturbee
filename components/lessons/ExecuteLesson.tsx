import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function ExecuteLesson({
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
  contentWord = null,
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
  contentWord?: string | null;
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

  // const onMessage = (event) => {
  //   try {
  //     const data = JSON.parse(event.nativeEvent.data);
  //     if (data?.type === "prediction") {
  //       console.log(data);
  //       setPrediction(data.data.prediction);

  //       if (correctAnswer == data.data.prediction) {
  //         if (!isThisLessonAlreadyDone()) {
  //           // Update Database
  //           if (userSavedLesson === userSavedTotalLesson) {
  //             updateLevel(userSavedStage, userSavedLevel + 1, 1, 10);
  //           } else {
  //             updateLevel(
  //               userSavedStage,
  //               userSavedLevel,
  //               userSavedLesson + 1,
  //               userSavedTotalLesson
  //             );
  //           }
  //         } else {
  //           // Show modal u did it
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Error parsing message:", error);
  //   }
  // };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("=== WEBVIEW MESSAGE RECEIVED ===");
      console.log("Raw data:", JSON.stringify(data, null, 2));

      if (data?.type === "prediction") {
        // Handle different possible data structures
        const predictedLetter =
          data.data?.prediction?.prediction ||
          data.data?.prediction ||
          data.prediction;
        setPrediction(predictedLetter);

        console.log("=== AI PREDICTION DEBUG ===");
        console.log("Predicted:", predictedLetter, "Type:", typeof predictedLetter);
        console.log("Expected:", correctAnswer, "Type:", typeof correctAnswer);
        console.log("Are they equal?", correctAnswer === predictedLetter);
        console.log("Stage ID:", stageId, "Level ID:", levelId);

        if (correctAnswer === predictedLetter) {
          console.log("Correct answer detected!");
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
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      {/* Title Section */}
      <View className="mb-6 mt-6 w-1/2">
        <View
          className="p-4 rounded-lg"
          style={{ backgroundColor: isViganTheme ? "#FFE9C3" : isSiargaoTheme ? "#B8A869" : isManilaTheme ? "#87A248" : isBoracayTheme ? "#488DA2" : isPalawanTheme ? "#D4C8B8" : isCebuTheme ? "#F4D9C6" : isBoholTheme ? "#D4E5C7" : "#01D3C1" }}
        >
          <View className="flex-row items-center">
            <Text
              className="text-2xl font-poppins-medium"
              style={{ color: isViganTheme ? "#875C35" : isManilaTheme ? "white" : isBoracayTheme ? "white" : isPalawanTheme ? "#6A645C" : isCebuTheme ? "#B65828" : isBoholTheme ? "#6D825A" : "white" }}
            >
              Sign "{contentWord || title}"
            </Text>
          </View>
        </View>
      </View>

      {/* WebView Container */}
      <View style={styles.webViewContainer}>
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
        message={"You executed it perfectly!"}
      />
    </>
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
  },
  webViewContainer: {
    width: "80%",
    height: 300,
    backgroundColor: "black",
    position: "relative",
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
