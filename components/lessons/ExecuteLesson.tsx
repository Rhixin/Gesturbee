import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "../SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function ExecuteLesson({
  title,
  correctAnswer,
  currentLessonIndex,
}: {
  title: string;
  correctAnswer: string;
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

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction;
        setPrediction(predictedLetter);

        if (correctAnswer == predictedLetter) {
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
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

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
      <Text style={styles.prediction}>{prediction}</Text>
      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleContinueAndReset}
        message={"You executed it perfectly!"}
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
  },
  webViewContainer: {
    width: "100%",
    flex: 1,
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
