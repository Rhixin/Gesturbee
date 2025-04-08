import LottieView from "lottie-react-native";
import React from "react";
import { View } from "react-native";
import { useGlobal } from "./GlobalContext";

export default function ProgressBar({
  percent,
  backgroundColor = "bg-gray-300",
  fillColor = "bg-yellow-400",
  imageWidth = 50,
  imageHeight = 50,
}: {
  percent: number;
  backgroundColor?: string;
  fillColor?: string;
  imageWidth?: number;
  imageHeight?: number;
}) {
  const { progressAnimation } = useGlobal();
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View className="w-full h-auto py-4">
      <View
        className={`w-full h-8 rounded-full overflow-hidden relative ${backgroundColor}`}
      >
        <View
          className={`h-full ${fillColor} rounded-full`}
          style={{ width: `${clampedPercent}%` }}
        />
      </View>

      <LottieView
        source={progressAnimation}
        autoPlay
        loop
        style={{
          position: "absolute",
          bottom: 7,
          left: `${clampedPercent - 2}%`,
          width: imageWidth,
          height: imageHeight,
          transform: [{ translateX: -imageWidth / 2 }],
        }}
      />
    </View>
  );
}
