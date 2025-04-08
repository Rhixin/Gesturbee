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

export default function Stage() {
  const { stageId } = useLocalSearchParams();

  const stageDummy = {
    name: "Alphabets",
    levels: [
      { id: 1, title: "A-G", percent: 40 },
      { id: 2, title: "H-N", percent: 80 },
      { id: 3, title: "O-U", percent: 30 },
      { id: 4, title: "V-Z", percent: 60 },
    ],
  };

  const router = useRouter();

  const navigateToLevel = (levelId: number) => {
    router.push(`/home/stage/${stageId}/level/${levelId}`);
  };

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
            Stage {stageId + ":   " + stageDummy.name}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView className="w-[90%] max-h-full pt-8">
        {stageDummy.levels.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-200 rounded-2xl my-2 p-6 h-auto flex flex-row gap-4 "
            activeOpacity={0.8}
            onPress={() => navigateToLevel(item.id)}
          >
            <View
              key={item.id}
              className="max-h-[60px] flex items-center justify-center"
            >
              <Image
                source={require("@/assets/images/beehive locked.png")}
                className="max-w-[70px] max-h-[70px]"
                style={{
                  transform: [{ scale: 2 }],
                }}
              />
            </View>
            <View className="flex-1 flex-col justify-between">
              <Text className="text-tertiary font-poppins-bold text-xl">
                {"Level: " + (index + 1) + ": " + item.title}
              </Text>
              <View className="h-auto">
                <ProgressBar
                  percent={item.percent}
                  backgroundColor="bg-white"
                  fillColor="bg-secondary"
                ></ProgressBar>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
