import ProgressBar from "@/components/Progressbar";
import { Ionicons } from "@expo/vector-icons";
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

  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <View className="bg-white h-[100vh] items-center">
      <SafeAreaView className=" bg-secondary rounded-b-3xl w-full">
        <TouchableOpacity
          className="px-8"
          onPress={() => {
            goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={"white"} />
        </TouchableOpacity>

        <View className="rounded-2xl w-[100%]  px-4 items-center">
          <View className="bg-white px-6 rounded-2xl">
            <Text className="font-poppins-medium text-black text-xl">
              Lesson 1
            </Text>
          </View>
          <View className="my-4">
            <Text className="text-white text-2xl font-poppins-medium">
              Greetings
            </Text>
          </View>
        </View>

        <View className="w-[100%] flex items-center mb-4">
          <View className="items-center flex justify-center w-[70%]">
            <ProgressBar
              percent={60}
              backgroundColor="bg-white"
              fillColor="bg-primary"
            ></ProgressBar>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
