import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ScrollView as RNScrollView,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { stageData } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";

export default function Home() {
  const scrollViewRef = useRef<RNScrollView>(null);
  const router = useRouter();

  const { userSavedStage } = useLevel();

  const navigateToStage = (id: number) => {
    router.push(`/home/stage/${id}`);
  };

  const isStageLocked = (stageNumber) => {
    if (stageNumber > userSavedStage) {
      return true;
    }

    return false;
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }}
    >
      <SafeAreaView className="pt-10">
        {stageData.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigateToStage(item.id)}
            activeOpacity={0.7}
            disabled={isStageLocked(item.id)}
          >
            <View
              className={`w-full flex ${
                item.stage % 2 === 0 ? "items-start" : "items-end"
              }`}
            >
              <View className="flex items-center justify-center min-w-[250px]">
                <View className="bg-primary px-4 py-2 rounded-lg">
                  <Text className="font-poppins-bold text-white text-lg">
                    {item.stage}
                  </Text>
                </View>

                <View className="bg-primary px-4 py-2 rounded-lg mt-2">
                  <Text className="font-poppins-bold text-white text-lg">
                    {item.title}
                  </Text>
                </View>

                <View>
                  {item.stage > userSavedStage ? (
                    <Image
                      source={require("@/assets/images/beehive locked.png")}
                      className="max-w-[180px] max-h-[180px]"
                      style={{
                        transform: [{ scale: 2 }],
                      }}
                    />
                  ) : (
                    <Image
                      source={require("@/assets/images/beehive unlocked.png")}
                      className="max-w-[180px] max-h-[180px]"
                      style={{
                        transform: [{ scale: 2 }],
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </ScrollView>
  );
}
