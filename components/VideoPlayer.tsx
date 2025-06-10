import QuizService from "@/api/services/quiz-service";
import { Video } from "expo-av";
import React from "react";
import { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";

const VideoPlayer = ({ s3Key, questionId }) => {
  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchVideoUrl();
  }, [s3Key]);

  const fetchVideoUrl = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await QuizService.getVideoContent(s3Key);

      if (response.success) {
        setVideoUri(response.data.presignedUrl);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching video URL:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
        <Text className="text-purple-700 font-poppins text-sm mb-2">
          Loading Video...
        </Text>
        <View className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
        <Text className="text-red-700 font-poppins text-sm mb-2">
          Video Error
        </Text>
        <TouchableOpacity onPress={fetchVideoUrl}>
          <Text className="text-red-600 text-xs underline">Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
      <Text className="text-purple-700 font-poppins text-sm mb-2">
        Video Attached
      </Text>
      <Video
        source={{ uri: videoUri }}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 8,
          backgroundColor: "#000",
        }}
        useNativeControls
        resizeMode="contain"
        shouldPlay={false}
        isLooping={false}
        onError={(error) => {
          console.log("Video playback error:", error);
          setError(true);
        }}
      />
    </View>
  );
};
