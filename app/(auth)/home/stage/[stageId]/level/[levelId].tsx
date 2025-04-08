import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function Level() {
  const { levelId } = useLocalSearchParams();

  const stageDummy = {
    name: "Alphabets",
    levels: [
      { id: 1, title: "A-G" },
      { id: 2, title: "H-N" },
      { id: 3, title: "O-U" },
      { id: 4, title: "V-Z" },
    ],
  };

  return (
    <View className="pt-10 bg-primary h-[100vh] flex items-center">
      <View className="bg-white rounded-2xl py-6 px-6 mb-6 w-[90%]">
        <Text className="font-poppins-bold text-secondary text-xl">
          LEEEVEEEEEL {levelId}
        </Text>
      </View>
    </View>
  );
}
