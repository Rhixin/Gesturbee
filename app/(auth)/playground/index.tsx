import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, SafeAreaView } from "react-native";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

export default function Playground() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(
    "Initializing TensorFlow.js..."
  );
  const [modelInfo, setModelInfo] = useState("");
  const [error, setError] = useState("");

  // Model files
  const aslJSON = require("@/assets/model/model.json");
  const aslWeights = require("../../../assets/model/group1-shard1of1.bin");

  const loadModel = async () => {
    try {
      // Initialize TensorFlow
      setLoadingStatus("Setting up TensorFlow.js...");
      await tf.ready();
      setIsTfReady(true);
      setLoadingStatus("TensorFlow.js is ready! Loading model...");

      console.log(aslJSON);
      console.log(aslWeights);

      // Load the model
      const loadedModel = await tf.loadLayersModel(
        bundleResourceIO(aslJSON, aslWeights)
      );

      console.log(loadedModel);

      // Model is loaded successfully
      setIsModelReady(true);
      setLoadingStatus("✅ Model loaded successfully!");

      //   // Get model info for display
      //   try {
      //     const modelDetails = {
      //       inputShape: loadedModel.inputs[0].shape,
      //       outputShape: loadedModel.outputs[0].shape,
      //       layerCount: loadedModel.layers.length,
      //     };
      //     setModelInfo(JSON.stringify(modelDetails, null, 2));
      //   } catch (infoError) {
      //     console.log("Error getting model info:", infoError);
      //     setModelInfo("Model loaded, but couldn't get detailed info.");
      //   }

      //   console.log("✅ Model loaded successfully!");
    } catch (e) {
      console.error("❌ Error loading model:", e);
      setError(`Error: ${e.message}`);
      setLoadingStatus("Failed to load model");
    }
  };

  useEffect(() => {
    loadModel();

    // Cleanup function
    return () => {
      // Clean up tensors when component unmounts
      if (tf.engine().numTensors > 0) {
        console.log(`Cleaning up ${tf.engine().numTensors} tensors`);
        tf.disposeVariables();
      }
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <SafeAreaView style={{ backgroundColor: "#3498db", padding: 15 }}>
        <Text
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          TensorFlow.js Model Loading
        </Text>
      </SafeAreaView>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {!isModelReady ? (
          <View style={{ alignItems: "center" }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 15, fontSize: 16, textAlign: "center" }}>
              {loadingStatus}
            </Text>
            {error ? (
              <Text
                style={{ marginTop: 10, color: "red", textAlign: "center" }}
              >
                {error}
              </Text>
            ) : null}
            <View
              style={{
                marginTop: 20,
                padding: 15,
                backgroundColor: "#e0e0e0",
                borderRadius: 8,
              }}
            >
              <Text>TensorFlow.js Ready: {isTfReady ? "✅" : "⏳"}</Text>
              <Text>Model Loaded: {isModelReady ? "✅" : "⏳"}</Text>
            </View>
          </View>
        ) : (
          <View style={{ width: "100%" }}>
            <View
              style={{
                backgroundColor: "#dff0d8",
                padding: 15,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "#3c763d",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                ✅ Model Loaded Successfully!
              </Text>
            </View>

            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
            >
              Model Information:
            </Text>
            <View
              style={{
                backgroundColor: "#f8f9fa",
                padding: 15,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontFamily: "monospace" }}>{modelInfo}</Text>
            </View>

            <Text style={{ marginTop: 20, textAlign: "center" }}>
              Number of tensors in memory: {tf.engine().numTensors}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
