import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Video } from "expo-av";

const VideoPlayer = ({ videoUrl }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
        <Text className="text-red-700 font-poppins text-sm mb-2">
          Video Error
        </Text>
        <Text className="text-red-600 text-xs">Unable to load the video.</Text>
      </View>
    );
  }

  return (
    <View
      className="mb-4 p-3 min-h-[400px]"
      style={{ height: 400, borderRadius: 8, overflow: "hidden" }}
    >
      <Video
        source={{ uri: videoUrl }}
        style={{
          flex: 1,
          borderRadius: 8,
        }}
        useNativeControls
        resizeMode="contain"
        shouldPlay={true}
        isLooping={true}
        onError={(err) => {
          console.error("Video playback error:", err);
          setError(true);
        }}
      />
    </View>
  );
};

export default VideoPlayer;
