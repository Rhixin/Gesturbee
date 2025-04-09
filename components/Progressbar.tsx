import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { View, LayoutChangeEvent } from "react-native";
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
  const [barWidth, setBarWidth] = useState(0);
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Callback to get actual width of progress bar
  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setBarWidth(width);
  };

  // Calculate pixel position for Lottie
  const lottieLeft = (barWidth * clampedPercent) / 100;

  return (
    <View className="w-full py-4">
      <View
        onLayout={handleLayout}
        className={`w-full rounded-full overflow-hidden relative ${backgroundColor}`}
        style={{ height: 20 }}
      >
        <View
          className={`${fillColor} rounded-full`}
          style={{ width: `${clampedPercent}%`, height: 20 }}
        />
      </View>

      {percent > 0 && barWidth > 0 && (
        <LottieView
          source={progressAnimation}
          autoPlay
          loop
          style={{
            position: "absolute",
            bottom: 7,
            left: lottieLeft - imageWidth / 2,
            width: imageWidth,
            height: imageHeight,
          }}
        />
      )}
    </View>
  );
}
