import React, { useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import SuccessModal from "../SuccessModal";

const AnswerExecutionView = ({ item }) => {
  const [prediction, setPrediction] = useState(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction;
        setPrediction(predictedLetter);
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
};

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

export default AnswerExecutionView;
