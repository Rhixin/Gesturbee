import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { stageData } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";

export default function Home() {
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { userSavedStage } = useLevel();

  const navigateToStage = (id: number) => {
    router.push(`/home/stage/${id}`);
  };

  const isStageLocked = (stageNumber: number) => {
    return stageNumber > userSavedStage;
  };

  // Get screen height to fix container height
  const screenHeight = Dimensions.get("window").height;

  return (
    <ScrollView
      ref={scrollViewRef}
      bounces={false} // prevent iOS bounce overscroll
      contentContainerStyle={{ flexGrow: 1 }}
      // Remove onContentSizeChange to avoid auto scroll to bottom
    >
      <ImageBackground
        source={require("@/assets/images/homebg7.png")}
        style={{ flex: 1, minHeight: screenHeight }}
        resizeMode="cover"
      >
        <SafeAreaView className="pt-10 pb-10" style={{ flex: 1 }}>
          {stageData.map((item, index) => {
            const locked = isStageLocked(item.id);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToStage(item.id)}
                activeOpacity={0.7}
                disabled={locked}
              >
                <View
                  className={`w-full flex ${
                    item.stage % 2 === 0 ? "items-start" : "items-end"
                  }`}
                >
                  <View
                    style={{
                      minWidth: 250,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Stage number */}
                    <View
                      style={{
                        backgroundColor: locked ? "#ccc" : "#FF9F1C",
                        paddingVertical: 6,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: locked ? 0 : 0.3,
                        shadowRadius: 3,
                        elevation: locked ? 0 : 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "800",
                          color: locked ? "#666" : "#fff",
                          letterSpacing: 1,
                        }}
                      >
                        STAGE {item.stage}
                      </Text>
                    </View>

                    {/* Title */}
                    <View
                      style={{
                        backgroundColor: locked
                          ? "rgba(200, 200, 200, 0.8)"
                          : "rgba(255,255,255,0.9)",
                        marginTop: 10,
                        paddingVertical: 6,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "800",
                          color: locked ? "#888" : "#FF9F1C",
                          textAlign: "center",
                        }}
                      >
                        {item.title}
                      </Text>
                    </View>

                    {/* Beehive images */}
                    <View>
                      {locked ? (
                        <Image
                          source={require("@/assets/images/beehive locked.png")}
                          style={{ width: 180, height: 180, transform: [{ scale: 2 }] }}
                        />
                      ) : (
                        <Image
                          source={require("@/assets/images/beehive unlocked.png")}
                          style={{ width: 180, height: 180, transform: [{ scale: 2 }] }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </SafeAreaView>
      </ImageBackground>
    </ScrollView>
  );
}
