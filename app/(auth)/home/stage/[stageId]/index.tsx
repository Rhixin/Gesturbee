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
import { getStageById } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";

export default function Stage() {
  const { stageId } = useLocalSearchParams();
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
  } = useLevel();
  const selectedStage = getStageById(Number(stageId));

  const router = useRouter();

  const navigateToLevel = (levelId: number) => {
    router.push(`/home/stage/${stageId}/level/${levelId}`);
  };

  const goBack = () => {
    router.back();
  };

  const isLevelLocked = (levelNumber) => {
    if (levelNumber > userSavedLevel) {
      return true;
    }

    return false;
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
            Stage {selectedStage.id + ":   " + selectedStage.title}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        className="w-[90%] max-h-full pt-8 mb-28"
        showsVerticalScrollIndicator={false}
      >
        {selectedStage.levels.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-200 rounded-2xl my-2 p-6 h-auto flex flex-row gap-4 "
            activeOpacity={0.8}
            onPress={() => navigateToLevel(item.levelid)}
            disabled={isLevelLocked(item.levelid)}
          >
            <View
              key={item.levelid}
              className="max-h-[60px] flex items-center justify-center"
            >
              <Image
                source={
                  selectedStage.id > userSavedStage ||
                  (selectedStage.id === userSavedStage &&
                    item.levelid > userSavedLevel)
                    ? require("@/assets/images/beehive locked.png")
                    : require("@/assets/images/beehive unlocked.png")
                }
                className="max-w-[70px] max-h-[70px]"
                style={{
                  transform: [{ scale: 2 }],
                }}
              />
            </View>
            <View className="flex-1 flex-col justify-between">
              <Text className="text-tertiary font-poppins-bold text-xl">
                {"Level: " + (index + 1) + ": " + item.levelname}
              </Text>
              <View className="h-auto">
                <ProgressBar
                  percent={
                    selectedStage.id < userSavedStage
                      ? 100
                      : selectedStage.id === userSavedStage
                      ? item.levelid < userSavedLevel
                        ? 100
                        : item.levelid === userSavedLevel
                        ? userSavedLesson === 0
                          ? 0
                          : (userSavedLesson / userSavedTotalLesson) * 100
                        : 0
                      : 0
                  }
                  backgroundColor={
                    selectedStage.id > userSavedStage ||
                    (selectedStage.id === userSavedStage &&
                      item.levelid > userSavedLevel)
                      ? "bg-tertiary"
                      : "bg-white"
                  }
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
