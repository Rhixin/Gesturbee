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

export default function Home() {
  const scrollViewRef = useRef<RNScrollView>(null);

  const dummyData = [
    { id: 5, level: 5, title: "Interpreting a Song", type: 1 },
    { id: 4, level: 4, title: "Simple Phrases", type: 1 },
    { id: 3, level: 3, title: "Common Words", type: 1 },
    { id: 2, level: 2, title: "Numbers", type: 0 },
    { id: 1, level: 1, title: "Alphabets", type: 0 },
  ];

  const router = useRouter();

  const navigateToStage = (id: number) => {
    router.push(`/home/stages/${id}`);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }}
    >
      <SafeAreaView className="pt-10">
        {dummyData.map((item) => (
          <Pressable key={item.id} onPress={() => navigateToStage(item.id)}>
            <View
              className={`w-full flex ${
                item.level % 2 === 0 ? "items-start" : "items-end"
              }`}
            >
              <View className="flex items-center justify-center min-w-[250px]">
                <View className="bg-primary px-4 py-2 rounded-lg">
                  <Text className="font-poppins-bold text-white text-lg">
                    {item.level}
                  </Text>
                </View>

                <View className="bg-primary px-4 py-2 rounded-lg mt-2">
                  <Text className="font-poppins-bold text-white text-lg">
                    {item.title}
                  </Text>
                </View>

                <View>
                  {item.type ? (
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
          </Pressable>
        ))}
      </SafeAreaView>
    </ScrollView>
  );
}
