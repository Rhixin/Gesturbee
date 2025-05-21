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

export default function Quiz() {
  const { quizId } = useLocalSearchParams();
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <View className="bg-white h-[100vh] items-center">
      <SafeAreaView className=" bg-primary rounded-b-3xl w-full">
        <TouchableOpacity
          className="px-8"
          onPress={() => {
            goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={"white"} />
        </TouchableOpacity>

        <View className="rounded-2xl w-[100%]  p-4 items-center">
          <Text className="font-poppins-bold text-white text-3xl">
            Quiz {quizId}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        className="w-[90%] max-h-full pt-8 mb-28"
        showsVerticalScrollIndicator={false}
      >
       
      </ScrollView>
    </View>
  );
}
