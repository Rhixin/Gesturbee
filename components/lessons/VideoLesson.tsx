import { useLevel } from "@/context/LevelContext";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function VideoLesson({
  title,
  videoRef,
  videoSource,
  setStatus,
  currentLessonIndex,
}: {
  title: string;
  videoRef: React.RefObject<any>;
  videoSource: any;
  setStatus: (status: any) => void;
  currentLessonIndex: number;
}) {
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    updateLevel,
  } = useLevel();
  const { stageId, levelId } = useLocalSearchParams();

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    if (
      Number(stageId) == userSavedStage &&
      Number(levelId) == userSavedLevel &&
      currentLessonIndex == userSavedLesson
    ) {
      return false;
    }

    console.log("→ No match: Lesson is done.");
    return true;
  };

  useEffect(() => {
    if (!isThisLessonAlreadyDone()) {
      // Update Database
      if (userSavedLesson === userSavedTotalLesson) {
        updateLevel(userSavedStage, userSavedLevel + 1, 1, 10);
      } else {
        updateLevel(
          userSavedStage,
          userSavedLevel,
          userSavedLesson + 1,
          userSavedTotalLesson
        );
      }
    } else {
      // Show modal u did it
    }
  }, []);

  return (
    <>
      <View className="w-full bg-white rounded-lg overflow-hidden aspect-video items-center justify-center">
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
          style={{ width: "50%", height: "50%", aspectRatio: 16 / 9 }}
        />
      </View>

      <View className="mb-6 w-1/2">
        <View className="bg-teal-500 p-4 rounded-lg">
          <View className="flex-row items-center">
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-poppins-medium ml-2">
              {title}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
