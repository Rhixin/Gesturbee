import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { TouchableOpacity, View, Text } from "react-native";

export default function VideoLesson({
  title,
  videoRef,
  setStatus,
}: {
  title: string;
  videoRef: React.RefObject<any>;
  setStatus: (status: any) => void;
}) {
  return (
    <>
      <View className="mx-4 my-6">
        <View className="w-full bg-gray-300 rounded-lg overflow-hidden aspect-video items-center justify-center">
          <Video
            ref={videoRef}
            source={require("@/assets/videos/a.mp4")}
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
            style={{ width: "100%", height: "100%", aspectRatio: 16 / 9 }}
          />
        </View>
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
