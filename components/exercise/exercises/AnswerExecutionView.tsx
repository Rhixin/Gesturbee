import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";

const AnswerExecutionView = ({ item, setAnswerItem, answerForm, currentViewIndex }) => {
  const [prediction, setPrediction] = useState(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Load saved answer when currentViewIndex changes (navigating between questions)
  useEffect(() => {
    const savedAnswer = answerForm?.[currentViewIndex];
    if (savedAnswer) {
      setPrediction(savedAnswer);
      setIsCorrect(savedAnswer === item.correctAnswer);
    } else {
      setPrediction(null);
      setIsCorrect(false);
    }
    setShowSuccessModal(false);
  }, [currentViewIndex, answerForm, item.correctAnswer]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction;
        setPrediction(predictedLetter);
        
        // Check if prediction matches correct answer
        if (predictedLetter === item.correctAnswer) {
          setIsCorrect(true);
          setShowSuccessModal(true);
          // Set the answer in the form
          if (setAnswerItem) {
            setAnswerItem(predictedLetter);
          }
        } else {
          setIsCorrect(false);
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
      <Text style={styles.title}>{item.question}</Text>
      <Text className="font-poppins-medium text-3xl px-4 py-2 bg-primary rounded-lg my-4 text-white">
        {item.correctAnswer}
      </Text>

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
      {prediction && (
        <View style={styles.predictionContainer}>
          <Text style={[
            styles.prediction,
            { color: prediction === item.correctAnswer ? '#22c55e' : '#ef4444' }
          ]}>
            {prediction}
          </Text>
          {prediction === item.correctAnswer ? (
            <Text style={styles.correctText}>✓ Correct!</Text>
          ) : (
            <Text style={styles.incorrectText}>Try again</Text>
          )}
        </View>
      )}
      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleContinueAndReset}
        message={"You executed it perfectly!"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    height: "100%",
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
  predictionContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  prediction: {
    fontSize: 32,
    fontFamily: "poppins-bold",
    marginBottom: 8,
  },
  correctText: {
    color: "#22c55e",
    fontSize: 16,
    fontFamily: "poppins-medium",
  },
  incorrectText: {
    color: "#ef4444",
    fontSize: 16,
    fontFamily: "poppins-medium",
  },
});

export default AnswerExecutionView;
