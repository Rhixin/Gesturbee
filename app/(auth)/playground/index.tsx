import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import Loading from "@/components/Loading";

export default function Playground() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");
  const [isTfReady, setIsTfReady] = useState(false);
  const [aslModel, setAslModel] = useState<tf.LayersModel | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [prediction, setPrediction] = useState("Waiting");
  const [loadingMessage, setLoadingMessage] = useState("Loading");

  const aslJSON = require("@/assets/model/model.json");
  const aslWeights = require("@/assets/model/group1_shard.bin");

  const loadModel = async () => {
    try {
      await tf.ready();
      setIsTfReady(true);
      const loadedModel = await tf.loadLayersModel(
        bundleResourceIO(aslJSON, aslWeights)
      );
      setAslModel(loadedModel);
      console.log("✅ Model loaded!");
    } catch (e) {
      console.log("❌ Error loading model:", e);
    }
  };

  const loadCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      console.log("✅ Camera permission:", status);
    } catch (e) {
      console.log("❌ Error loading Camera:", e);
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingMessage("Loading Camera...");
      await loadCamera();
      setLoadingMessage("Loading AI Model...");
      await loadModel();
    })();
  }, []);

  const captureAndPredict = async () => {
    if (!cameraRef.current || !aslModel) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        skipProcessing: true,
        base64: true,
      });

      // Resize the image to 200x200
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 200, height: 200 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Fetch the image from URI and convert it to raw bytes
      const imgBuffer = await fetch(manipulatedImage.uri);
      const imgArrayBuffer = await imgBuffer.arrayBuffer();
      const raw = new Uint8Array(imgArrayBuffer);

      // Decode the image into a tensor
      let imageTensor = decodeJpeg(raw);

      // Normalize and add a batch dimension
      const normalized = imageTensor.div(255.0).expandDims(0);

      // Make prediction with the model
      const output = aslModel.predict(normalized) as tf.Tensor;
      const predictions = await output.data();
      const predictedIndex = predictions.indexOf(Math.max(...predictions));

      // Map the prediction index to a label (adjust this to your classes)
      const labels = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "del",
        "space",
        "nothing",
      ];

      setPrediction(labels[predictedIndex]);
    } catch (err) {
      console.error("Prediction error:", err);
    }
  };

  if (!hasPermission || !aslModel) {
    return <Loading text={loadingMessage}></Loading>;
  }

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="bg-blue-500 pt-5">
        <Text className="text-white text-2xl font-bold text-center">
          Predicted: {prediction}
        </Text>
      </SafeAreaView>

      <CameraView style={{ flex: 1 }} facing={cameraFacing} ref={cameraRef}>
        <View className="flex justify-center items-center absolute bottom-5 w-full space-y-3">
          <TouchableOpacity
            className="bg-black opacity-50 w-36 h-12 justify-center items-center rounded-lg"
            onPress={() =>
              setCameraFacing((current) =>
                current === "back" ? "front" : "back"
              )
            }
          >
            <Text className="text-white text-lg">Flip Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 w-36 h-12 justify-center items-center rounded-lg"
            onPress={captureAndPredict}
          >
            <Text className="text-white text-lg">Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
