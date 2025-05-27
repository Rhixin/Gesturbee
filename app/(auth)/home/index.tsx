import { useRouter } from "expo-router";
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { stageData } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";
import AnimatedBeehive from "@/components/AnimatedBeehive";

// Fixed Animated Cloud Component
const AnimatedCloud = ({
  size = 80,
  initialX = 0,
  duration = 15000,
  delay = 0,
  opacity = 0.3,
  top = 100,
}) => {
  const translateX = useRef(new Animated.Value(initialX)).current;
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    // Calculate initial position based on delay to create seamless movement
    const totalCycleDuration = duration + delay;
    const delayProgress = delay / totalCycleDuration;
    const startX = -size + (screenWidth + 2 * size) * delayProgress;

    // Set initial position
    translateX.setValue(startX);

    const animate = () => {
      // Calculate remaining duration for first animation
      const remainingDistance = screenWidth + size - startX;
      const totalDistance = screenWidth + 2 * size;
      const firstDuration = duration * (remainingDistance / totalDistance);

      // Start animation immediately from current position
      Animated.timing(translateX, {
        toValue: screenWidth + size,
        duration: Math.max(firstDuration, 100), // Ensure minimum duration
        useNativeDriver: true,
      }).start(() => {
        // Create continuous loop
        const loop = () => {
          translateX.setValue(-size);
          Animated.timing(translateX, {
            toValue: screenWidth + size,
            duration: duration,
            useNativeDriver: true,
          }).start(() => loop());
        };
        loop();
      });
    };

    // Start animation immediately
    animate();
  }, [size, duration, delay, screenWidth]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: top,
        transform: [{ translateX }],
        opacity: opacity,
      }}
    >
      <Image
        source={require("@/assets/images/Cloud/xl.png")}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default function Home() {
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { userSavedStage, userSavedLevel, userSavedTotalLesson } = useLevel();

  const navigateToStage = (id: number) => {
    router.push(`/home/stage/${id}`);
  };

  const isStageLocked = (stageNumber: number) => {
    return stageNumber > userSavedStage;
  };

  const screenHeight = Dimensions.get("window").height;

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#00BFAF" />

      {/* Floating Header */}
      <View
        className="absolute top-0 left-0 right-0 z-50"
        style={{ paddingTop: StatusBar.currentHeight || 0 }}
      >
        <SafeAreaView>
          <View className="mx-5 bg-white rounded-2xl px-5 py-2 items-center shadow-lg relative">
            <View className="rounded-xl w-60 h-8 flex justify-center items-center bg-[#01D3C1]">
              <Text className="text-lg font-poppins-bold text-white tracking-wide text-center">
                Roadmap
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 relative">
          <LinearGradient
            colors={["#00BFAF", "#0AC9B3", "#007F8B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1"
          >
            {/* Animated Clouds Background */}
            <View className="absolute inset-0 z-10">
              <AnimatedCloud
                size={185}
                duration={22000}
                delay={3000}
                opacity={0.85}
                top={80}
              />
              <AnimatedCloud
                size={195}
                duration={19000}
                delay={8000}
                opacity={0.72}
                top={200}
              />
              <AnimatedCloud
                size={175}
                duration={26000}
                delay={12000}
                opacity={0.31}
                top={150}
              />
              <AnimatedCloud
                size={205}
                duration={17000}
                delay={6000}
                opacity={0.44}
                top={300}
              />
              <AnimatedCloud
                size={160}
                duration={24000}
                delay={15000}
                opacity={0.18}
                top={400}
              />
              <AnimatedCloud
                size={225}
                duration={21000}
                delay={2000}
                opacity={0.67}
                top={500}
              />

              <AnimatedCloud
                size={190}
                duration={23000}
                delay={4000}
                opacity={0.88}
                top={600}
              />
              <AnimatedCloud
                size={165}
                duration={18000}
                delay={11000}
                opacity={0.59}
                top={700}
              />
              <AnimatedCloud
                size={235}
                duration={20000}
                delay={7000}
                opacity={0.29}
                top={650}
              />
              <AnimatedCloud
                size={180}
                duration={27000}
                delay={14000}
                opacity={0.42}
                top={800}
              />
              <AnimatedCloud
                size={155}
                duration={25000}
                delay={9000}
                opacity={0.16}
                top={900}
              />
              <AnimatedCloud
                size={380}
                duration={19000}
                delay={1000}
                opacity={0.48}
                top={1000}
              />
            </View>

            <SafeAreaView className="pt-10 pb-10 flex-1 z-20">
              {/* Add top padding to account for floating header */}
              <View className="h-24" />

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
                      <View className="min-w-[250px] items-center justify-center">
                        {/* Stage number */}
                        <View
                          className={`py-1.5 px-4 rounded-2xl ${
                            locked ? "bg-gray-300" : "bg-orange-400 shadow-md"
                          }`}
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: locked ? 0 : 0.3,
                            shadowRadius: 3,
                            elevation: locked ? 0 : 3,
                          }}
                        >
                          <Text
                            className={`text-sm font-poppins-bold tracking-wider ${
                              locked ? "text-gray-600" : "text-white"
                            }`}
                          >
                            Stage {item.stage}
                          </Text>
                        </View>

                        {/* Title */}
                        <View
                          className={`mt-2.5 py-1.5 px-4 rounded-2xl ${
                            locked ? "bg-gray-300/80" : "bg-white/90"
                          }`}
                        >
                          <Text
                            className={`text-lg font-poppins-bold text-center ${
                              locked ? "text-gray-500" : "text-orange-400"
                            }`}
                          >
                            {item.title}
                          </Text>
                        </View>

                        {/* Beehive images */}
                        <View>
                          {locked ? (
                            <AnimatedBeehive percentage={0} isGeneral={false} />
                          ) : (
                            <AnimatedBeehive
                              percentage={
                                (userSavedLevel / userSavedTotalLesson) * 100
                              }
                              isGeneral={false}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </SafeAreaView>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
