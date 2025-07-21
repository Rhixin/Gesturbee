import { Feather } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function CameraBuffer() {
  return (
    <View className="w-[80vw] h-[40vh] bg-gray-100 rounded-lg border-2 border-dashed border-secondary mt-6 items-center justify-center">
      <View className="p-6 rounded-full bg-secondary items-center justify-center">
        <Feather name="camera" size={64} color="white" />
      </View>
      <View className="mt-4 items-center">
        <Text className="text-lg font-medium text-gray-600">
          Camera Access Required
        </Text>
      </View>
    </View>
  );
}
