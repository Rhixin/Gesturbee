import { useAuth } from "@/context/AuthContext";
import { useLevel } from "@/context/LevelContext";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useEffect } from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function VideoLesson({
  title,
  videoRef,
  videoSource,
  setStatus,
  currentLessonIndex,
  isViganTheme = false,
}: {
  title: string;
  videoRef: React.RefObject<any>;
  videoSource: any;
  setStatus: (status: any) => void;
  currentLessonIndex: number;
  isViganTheme?: boolean;
}) {
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    updateLevel,
    setShowLevelCompleteModal,
  } = useLevel();
  const { stageId, levelId } = useLocalSearchParams();
  const { currentUser } = useAuth();

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    if (
      Number(stageId) == userSavedStage &&
      Number(levelId) == userSavedLevel &&
      currentLessonIndex == userSavedLesson
    ) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!isThisLessonAlreadyDone()) {
      // Update Database
      if (userSavedLesson === userSavedTotalLesson) {
        updateLevel(
          currentUser.id,
          userSavedStage,
          userSavedLevel + 1,
          1,
          12,
          true
        );
        setShowLevelCompleteModal(true);
      } else {
        updateLevel(
          currentUser.id,
          userSavedStage,
          userSavedLevel,
          userSavedLesson + 1,
          userSavedTotalLesson,
          false
        );
      }
    } else {
      // Show modal u did it
    }
  }, []);

  return (
    <>
      <View className="mb-6 mt-6 w-1/2">
        <View
          className="p-4 rounded-lg"
          style={{ backgroundColor: isViganTheme ? "#FFE9C3" : "#01D3C1" }}
        >
          <View className="flex-row items-center">
            <Text
              className="text-2xl font-poppins-medium ml-2"
              style={{ color: isViganTheme ? "#875C35" : "white" }}
            >
              {title}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="w-full rounded-lg overflow-hidden aspect-video items-center mt-4"
        style={{ backgroundColor: "transparent" }}
      >
        <Video
          ref={videoRef}
          source={videoSource}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          onPlaybackStatusUpdate={(status) => setStatus(status)}
          onEnd={async () => {
            if (videoRef?.current) {
              await videoRef.current.setStatusAsync({
                shouldPlay: true,
                positionMillis: 0,
              });
            }
          }}
          style={{
            width: "50%",
            height: "50%",
            aspectRatio: 14 / 9,
            backgroundColor: "transparent",
          }}
        />
      </View>
    </>
  );
}
