// ASLRecognitionContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

// Define types
interface PredictionResult {
  predictedLabel: string;
  confidence: number;
}

interface RecognizerData {
  mean: number[];
  std: number[];
  classes: string[];
  feature_names?: string[];
}

interface ASLRecognitionContextType {
  isModelReady: boolean;
  prediction: PredictionResult | null;
  loading: boolean;
  error: string | null;
  setLandmarks: (landmarks: number[]) => void;
  clearPrediction: () => void;
}

const ASLRecognitionContext = createContext<ASLRecognitionContextType | null>(
  null
);

// Import model files directly
import modelJson from "../assets/model/model.json";
import * as modelWeights from "../assets/model/weights";
import recognizerData from "../assets/model/recognizer_data.json";

export const ASLRecognitionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isModelReady, setIsModelReady] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [landmarks, setLandmarks] = useState<number[] | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mean, setMean] = useState<number[]>([]);
  const [std, setStd] = useState<number[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  // Initialize model on component mount
  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Initialize TensorFlow
        await tf.ready();

        // Load our ASL model
        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJson, modelWeights)
        );
        setModel(loadedModel);

        // Store preprocessing data
        setMean(recognizerData.mean);
        setStd(recognizerData.std);
        setClasses(recognizerData.classes);

        setIsModelReady(true);
        console.log("ASL model loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to load ASL model:", err);
        setError(`Model initialization failed: ${errorMessage}`);
      }
    };

    initializeModel();

    // Cleanup function
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  // Process landmarks and update prediction whenever landmarks change
  useEffect(() => {
    const processLandmarks = async () => {
      if (!landmarks || !isModelReady || !model) return;

      setLoading(true);
      setError(null);

      try {
        // Extract features from landmarks
        const features = extractFeaturesFromLandmarks(landmarks);

        // Get feature values in correct order
        const featureArray = Object.values(features);

        // Normalize features
        const normalizedFeatures = featureArray.map(
          (value, i) => (value - mean[i]) / std[i]
        );

        // Make prediction
        const inputTensor = tf.tensor2d([normalizedFeatures]);
        const predictionTensor = model.predict(inputTensor) as tf.Tensor;
        const predictionArray = (await predictionTensor.array()) as number[][];

        // Get predicted class
        const flatPredictions = predictionArray[0];
        let maxIndex = 0;
        let maxConfidence = flatPredictions[0];

        for (let i = 1; i < flatPredictions.length; i++) {
          if (flatPredictions[i] > maxConfidence) {
            maxConfidence = flatPredictions[i];
            maxIndex = i;
          }
        }

        // Get label
        const predictedLabel = classes[maxIndex];

        // Update prediction state
        setPrediction({
          predictedLabel,
          confidence: maxConfidence,
        });

        // Clean up tensors
        inputTensor.dispose();
        predictionTensor.dispose();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Prediction error:", err);
        setError(`Prediction failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    processLandmarks();
  }, [landmarks, isModelReady, model, mean, std, classes]);

  // Feature extraction function
  const extractFeaturesFromLandmarks = (
    landmarksFlat: number[]
  ): Record<string, number> => {
    // Reshape landmarks from flat array to array of points
    const landmarks: number[][] = [];
    for (let i = 0; i < landmarksFlat.length; i += 3) {
      landmarks.push([
        landmarksFlat[i],
        landmarksFlat[i + 1],
        landmarksFlat[i + 2],
      ]);
    }

    const wrist = landmarks[0];
    const palmIndices = [0, 5, 9, 13, 17];

    // Calculate palm center
    const palmCenter: number[] = [0, 0, 0];
    for (const idx of palmIndices) {
      palmCenter[0] += landmarks[idx][0] / palmIndices.length;
      palmCenter[1] += landmarks[idx][1] / palmIndices.length;
      palmCenter[2] += landmarks[idx][2] / palmIndices.length;
    }

    const featuresDict: Record<string, number> = {};

    const fingers: number[][][] = [
      [
        [1, 2, 3],
        [2, 3, 4],
      ], // Thumb
      [
        [5, 6, 7],
        [6, 7, 8],
      ], // Index
      [
        [9, 10, 11],
        [10, 11, 12],
      ], // Middle
      [
        [13, 14, 15],
        [14, 15, 16],
      ], // Ring
      [
        [17, 18, 19],
        [18, 19, 20],
      ], // Pinky
    ];

    const fingerNames: string[] = ["thumb", "index", "middle", "ring", "pinky"];

    // Calculate joint angles
    for (let i = 0; i < fingers.length; i++) {
      for (let j = 0; j < fingers[i].length; j++) {
        const [p1, p2, p3] = fingers[i][j];
        const jointType = j === 0 ? "knuckle" : "middle_joint";

        // Calculate vectors
        const v1: number[] = [
          landmarks[p1][0] - landmarks[p2][0],
          landmarks[p1][1] - landmarks[p2][1],
          landmarks[p1][2] - landmarks[p2][2],
        ];

        const v2: number[] = [
          landmarks[p3][0] - landmarks[p2][0],
          landmarks[p3][1] - landmarks[p2][1],
          landmarks[p3][2] - landmarks[p2][2],
        ];

        // Calculate norms
        const v1Norm = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
        const v2Norm = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);

        if (v1Norm > 0 && v2Norm > 0) {
          // Normalize vectors
          const v1Normalized: number[] = [
            v1[0] / v1Norm,
            v1[1] / v1Norm,
            v1[2] / v1Norm,
          ];
          const v2Normalized: number[] = [
            v2[0] / v2Norm,
            v2[1] / v2Norm,
            v2[2] / v2Norm,
          ];

          // Calculate dot product
          const dotProduct =
            v1Normalized[0] * v2Normalized[0] +
            v1Normalized[1] * v2Normalized[1] +
            v1Normalized[2] * v2Normalized[2];

          // Clamp dot product to [-1, 1]
          const clampedDot = Math.max(-1.0, Math.min(1.0, dotProduct));

          // Calculate angle
          const angle = Math.acos(clampedDot);
          featuresDict[`${fingerNames[i]}_${jointType}_angle`] = angle;
        } else {
          featuresDict[`${fingerNames[i]}_${jointType}_angle`] = 0.0;
        }
      }
    }

    // Fingertips indices
    const fingertips: number[] = [4, 8, 12, 16, 20];

    // Calculate fingertip to palm distance
    for (let i = 0; i < fingertips.length; i++) {
      const tip = fingertips[i];
      const dist = Math.sqrt(
        Math.pow(landmarks[tip][0] - palmCenter[0], 2) +
          Math.pow(landmarks[tip][1] - palmCenter[1], 2) +
          Math.pow(landmarks[tip][2] - palmCenter[2], 2)
      );
      featuresDict[`${fingerNames[i]}_tip_to_palm_dist`] = dist;
    }

    // Calculate fingertip heights relative to wrist
    for (let i = 0; i < fingertips.length; i++) {
      const tip = fingertips[i];
      const height = landmarks[tip][1] - wrist[1];
      featuresDict[`${fingerNames[i]}_height`] = height;
    }

    // Calculate specific finger distances
    featuresDict["thumb_to_index_dist"] = Math.sqrt(
      Math.pow(landmarks[4][0] - landmarks[8][0], 2) +
        Math.pow(landmarks[4][1] - landmarks[8][1], 2) +
        Math.pow(landmarks[4][2] - landmarks[8][2], 2)
    );

    featuresDict["thumb_to_pinky_dist"] = Math.sqrt(
      Math.pow(landmarks[4][0] - landmarks[20][0], 2) +
        Math.pow(landmarks[4][1] - landmarks[20][1], 2) +
        Math.pow(landmarks[4][2] - landmarks[20][2], 2)
    );

    // Calculate average fingertip distance (hand curvature)
    let avgFingertipDist = 0;
    for (const tip of fingertips) {
      avgFingertipDist +=
        Math.sqrt(
          Math.pow(landmarks[tip][0] - palmCenter[0], 2) +
            Math.pow(landmarks[tip][1] - palmCenter[1], 2) +
            Math.pow(landmarks[tip][2] - palmCenter[2], 2)
        ) / fingertips.length;
    }
    featuresDict["hand_curvature"] = avgFingertipDist;

    // Calculate finger spread
    const spreadDistances: number[] = [];
    for (let i = 0; i < fingertips.length - 1; i++) {
      const dist = Math.sqrt(
        Math.pow(
          landmarks[fingertips[i]][0] - landmarks[fingertips[i + 1]][0],
          2
        ) +
          Math.pow(
            landmarks[fingertips[i]][1] - landmarks[fingertips[i + 1]][1],
            2
          ) +
          Math.pow(
            landmarks[fingertips[i]][2] - landmarks[fingertips[i + 1]][2],
            2
          )
      );
      spreadDistances.push(dist);
    }

    featuresDict["finger_spread"] =
      spreadDistances.reduce((a, b) => a + b, 0) / spreadDistances.length;

    // Calculate thumb-pinky opposition
    featuresDict["thumb_pinky_opposition"] = Math.sqrt(
      Math.pow(landmarks[4][0] - landmarks[17][0], 2) +
        Math.pow(landmarks[4][1] - landmarks[17][1], 2) +
        Math.pow(landmarks[4][2] - landmarks[17][2], 2)
    );

    // Calculate palm normal and distances to palm plane
    const v1: number[] = [
      landmarks[5][0] - landmarks[0][0],
      landmarks[5][1] - landmarks[0][1],
      landmarks[5][2] - landmarks[0][2],
    ];

    const v2: number[] = [
      landmarks[17][0] - landmarks[0][0],
      landmarks[17][1] - landmarks[0][1],
      landmarks[17][2] - landmarks[0][2],
    ];

    // Cross product for normal vector
    const palmNormal: number[] = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0],
    ];

    const normalNorm = Math.sqrt(
      palmNormal[0] * palmNormal[0] +
        palmNormal[1] * palmNormal[1] +
        palmNormal[2] * palmNormal[2]
    );

    if (normalNorm > 0) {
      // Normalize palm normal
      const normalizedPalmNormal: number[] = [
        palmNormal[0] / normalNorm,
        palmNormal[1] / normalNorm,
        palmNormal[2] / normalNorm,
      ];

      // Calculate distance to palm plane for each fingertip
      for (let i = 0; i < fingertips.length; i++) {
        const tip = fingertips[i];
        const vecToTip: number[] = [
          landmarks[tip][0] - landmarks[0][0],
          landmarks[tip][1] - landmarks[0][1],
          landmarks[tip][2] - landmarks[0][2],
        ];

        const distToPlane = Math.abs(
          vecToTip[0] * normalizedPalmNormal[0] +
            vecToTip[1] * normalizedPalmNormal[1] +
            vecToTip[2] * normalizedPalmNormal[2]
        );

        featuresDict[`${fingerNames[i]}_dist_to_palm_plane`] = distToPlane;
      }
    } else {
      // Default to 0 if normal can't be calculated
      for (let i = 0; i < fingerNames.length; i++) {
        featuresDict[`${fingerNames[i]}_dist_to_palm_plane`] = 0.0;
      }
    }

    return featuresDict;
  };

  const clearPrediction = () => {
    setPrediction(null);
  };

  return (
    <ASLRecognitionContext.Provider
      value={{
        isModelReady,
        prediction,
        loading,
        error,
        setLandmarks,
        clearPrediction,
      }}
    >
      {children}
    </ASLRecognitionContext.Provider>
  );
};

export const useASLRecognition = () => {
  const context = useContext(ASLRecognitionContext);
  if (!context) {
    throw new Error(
      "useASLRecognition must be used within an ASLRecognitionProvider"
    );
  }
  return context;
};
