import * as tf from "@tensorflow/tfjs";

class ASLRecognizer {
  constructor(data) {
    this.mean = data.mean;
    this.std = data.std;
    this.classes = data.classes;
    this.feature_names = data.feature_names;
  }

  // Normalize features just like in Python
  normalize(features) {
    return features.map((value, i) => (value - this.mean[i]) / this.std[i]);
  }

  // Predict function mirroring the Python implementation
  async predict(features, model) {
    // Normalize features
    const normalizedFeatures = this.normalize(features);

    // Reshape to match the model's expected input shape
    // This mirrors the Python reshape(1, -1)
    const inputTensor = tf.tensor2d([normalizedFeatures]);

    // Make prediction
    const prediction = model.predict(inputTensor);
    const predictionArray = await prediction.array();

    // Get predicted class (argmax equivalent)
    const flatPredictions = predictionArray[0];
    let maxIndex = 0;
    let maxConfidence = flatPredictions[0];

    for (let i = 1; i < flatPredictions.length; i++) {
      if (flatPredictions[i] > maxConfidence) {
        maxConfidence = flatPredictions[i];
        maxIndex = i;
      }
    }

    // Get label (equivalent to label_encoder.inverse_transform)
    const predictedLabel = this.classes[maxIndex];

    // Clean up tensors to prevent memory leaks
    inputTensor.dispose();
    prediction.dispose();

    // Return equivalent to Python's return format
    return {
      predictedLabel,
      confidence: maxConfidence,
    };
  }
}

export default ASLRecognizer;
