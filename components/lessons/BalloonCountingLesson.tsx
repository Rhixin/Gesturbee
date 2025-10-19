import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Image, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

const { width, height } = Dimensions.get("window");

interface Balloon {
  id: number;
  x: number;
  y: number;
  type: number; // 1, 2, or 3 for different balloon colors
}

export default function BalloonCountingLesson({
  title,
  currentLessonIndex,
  correctAnswer,
  balloonCount,
  isManilaTheme = false,
}: {
  title: string;
  currentLessonIndex: number;
  correctAnswer: string; // The AI answer (mapped letter for the number)
  balloonCount: number; // How many balloons to display
  isManilaTheme?: boolean;
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

  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  // Get window dimensions for responsive WebView sizing (made much smaller)
  const windowDimensions = useWindowDimensions();
  const isPortrait = windowDimensions.height > windowDimensions.width;
  const webViewWidth = isPortrait ? 180 : 240;
  const webViewHeight = isPortrait ? 240 : 180;

  // Generate random balloon positions
  useEffect(() => {
    const generatedBalloons: Balloon[] = [];
    const padding = 40; // Padding from edges
    const balloonSize = 80; // Approximate balloon size
    const minDistance = 100; // Minimum distance between balloons

    // Calculate middle area for balloons
    // Title area: top 80px
    // Camera area: starts at height - 350px
    // Balloons spawn in middle 40% of available space
    const titleHeight = 80;
    const cameraStartHeight = height - 350;
    const totalAvailableHeight = cameraStartHeight - titleHeight;

    // Spawn only in middle 40% of available height
    const middleStartY = titleHeight + (totalAvailableHeight * 0.3);
    const middleHeight = totalAvailableHeight * 0.4;

    for (let i = 0; i < balloonCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let newBalloon: Balloon;

      // Try to find a valid position that doesn't overlap
      while (!validPosition && attempts < 50) {
        const x = padding + Math.random() * (width - 2 * padding - balloonSize);
        // Position balloons in the middle 40% area only
        const y = Math.random() * (middleHeight - balloonSize);

        newBalloon = {
          id: i,
          x,
          y,
          type: (i % 3) + 1, // Cycle through balloon types 1, 2, 3
        };

        // Check if this position is far enough from existing balloons
        validPosition = generatedBalloons.every((existingBalloon) => {
          const distance = Math.sqrt(
            Math.pow(newBalloon.x - existingBalloon.x, 2) +
              Math.pow(newBalloon.y - existingBalloon.y, 2)
          );
          return distance >= minDistance;
        });

        attempts++;
      }

      if (validPosition || attempts >= 50) {
        generatedBalloons.push(newBalloon!);
      }
    }

    setBalloons(generatedBalloons);
  }, [balloonCount]);

  const isThisLessonAlreadyDone = () => {
    const currentStageId = Number(stageId);
    const currentLevelId = Number(levelId);

    if (currentStageId > userSavedStage || currentLevelId > userSavedLevel) {
      return false;
    }

    if (currentStageId == userSavedStage && currentLevelId == userSavedLevel) {
      return currentLessonIndex <= userSavedLesson;
    }

    return true;
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("=== BALLOON COUNTING - WEBVIEW MESSAGE ===");
      console.log("Raw data:", JSON.stringify(data, null, 2));

      if (data?.type === "prediction") {
        // Handle different possible data structures (same as ExecuteLesson)
        // For /words endpoint: data.data.prediction.top_prediction
        // For /alphabets endpoint: data.data.prediction.prediction or data.data.prediction
        let predictedValue;

        if (data.data?.prediction?.top_prediction) {
          // Words endpoint - extract top_prediction
          predictedValue = data.data.prediction.top_prediction;
        } else if (data.data?.prediction?.prediction) {
          // Alphabets endpoint - nested prediction
          predictedValue = data.data.prediction.prediction;
        } else if (typeof data.data?.prediction === 'string') {
          // Direct string prediction
          predictedValue = data.data.prediction;
        } else if (typeof data.prediction === 'string') {
          // Fallback
          predictedValue = data.prediction;
        }

        setPrediction(predictedValue);

        console.log("=== BALLOON COUNTING - PREDICTION DEBUG ===");
        console.log("Predicted:", predictedValue, "Type:", typeof predictedValue);
        console.log("Expected:", correctAnswer, "Type:", typeof correctAnswer);
        console.log("Are they equal?", correctAnswer === predictedValue);

        if (correctAnswer === predictedValue) {
          console.log("Correct! Balloon count signed correctly!");
          const lessonAlreadyDone = isThisLessonAlreadyDone();

          if (!lessonAlreadyDone) {
            if (userSavedLesson === userSavedTotalLesson) {
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
        } else {
          console.log(
            `Wrong answer. Expected: ${correctAnswer}, Got: ${predictedValue}. Keep trying!`
          );
          // No wrong answer modal - unlimited tries
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Title Section - At the Top */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.titleText,
            { color: "white" },
          ]}
        >
          Count the balloons and sign the number!
        </Text>
      </View>

      {/* Balloons Display Area - In the Middle */}
      <View style={styles.balloonsArea}>
        {balloons.map((balloon) => (
          <View
            key={balloon.id}
            style={[
              styles.balloonContainer,
              { left: balloon.x, top: balloon.y },
            ]}
          >
            <Image
              source={
                balloon.type === 1
                  ? require("@/assets/images/Balloon/balloon1.png")
                  : balloon.type === 2
                  ? require("@/assets/images/Balloon/balloon2.png")
                  : require("@/assets/images/Balloon/balloon3.png")
              }
              style={styles.balloonImage}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>

      {/* WebView Container - At the Bottom */}
      <View style={[
        styles.webViewContainer,
        {
          width: webViewWidth,
          height: webViewHeight,
          left: (width - webViewWidth) / 2, // Center horizontally
        }
      ]}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <Text
              style={[
                styles.loadingText,
                { color: isManilaTheme ? "#87A248" : "#01D3C1" },
              ]}
            >
              Loading Camera...
            </Text>
          </View>
        )}
        <WebView
          source={{
            uri: Number(stageId) === 1
              ? "https://gesturbee-app-model.vercel.app/alphabets"
              : "https://gesturbee-app-model.vercel.app/words"
          }}
          style={styles.webView}
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
        onContinue={handleSuccess}
        message={`Perfect! You correctly counted ${balloonCount} balloon${
          balloonCount !== 1 ? "s" : ""
        }!`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  titleContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  balloonsArea: {
    position: "absolute",
    top: 80, // Start below title
    left: 0,
    right: 0,
    bottom: 350, // Leave more space for camera at bottom
    zIndex: 10,
  },
  balloonContainer: {
    position: "absolute",
    width: 80,
    height: 100,
  },
  balloonImage: {
    width: "100%",
    height: "100%",
  },
  webViewContainer: {
    position: "absolute",
    bottom: 120, // Moved higher to avoid prev/next buttons
    // Width, height, and left are set dynamically via inline styles
    backgroundColor: "#000000",
    borderRadius: 12,
    zIndex: 90,
  },
  webView: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "transparent",
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
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
