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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { stageData } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";
import AnimatedBeehive from "@/components/AnimatedBeehive";

// Animated Cloud Component
const AnimatedCloud = ({ source, style, duration = 15000, delay = 0 }) => {
  const translateX = useRef(new Animated.Value(-200)).current;
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const animateCloud = () => {
      translateX.setValue(-200);
      Animated.timing(translateX, {
        toValue: screenWidth + 100,
        duration: duration,
        useNativeDriver: true,
      }).start(() => {
        // Loop the animation
        animateCloud();
      });
    };

    // Start animation with delay
    const timeout = setTimeout(() => {
      animateCloud();
    }, delay);

    return () => clearTimeout(timeout);
  }, [translateX, screenWidth, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          transform: [{ translateX }],
        },
        style,
      ]}
    >
      <Image source={source} style={{ opacity: 0.7 }} resizeMode="contain" />
    </Animated.View>
  );
};

// Background Clouds Component
const BackgroundClouds = () => {
  const screenHeight = Dimensions.get("window").height;

  return (
    <View style={{ position: "absolute", width: "100%", height: "100%" }}>
      {/* Large clouds - slower movement */}
      <AnimatedCloud
        source={require("@/assets/images/Cloud/xl.png")}
        style={{
          top: screenHeight * 0.1,
          width: 120,
          height: 80,
        }}
        duration={20000}
        delay={0}
      />

      <AnimatedCloud
        source={require("@/assets/images/Cloud/l.png")}
        style={{
          top: screenHeight * 0.25,
          width: 100,
          height: 65,
        }}
        duration={18000}
        delay={5000}
      />

      {/* Medium clouds - medium speed */}
      <AnimatedCloud
        source={require("@/assets/images/Cloud/m.png")}
        style={{
          top: screenHeight * 0.4,
          width: 80,
          height: 50,
        }}
        duration={15000}
        delay={2000}
      />

      <AnimatedCloud
        source={require("@/assets/images/Cloud/m.png")}
        style={{
          top: screenHeight * 0.6,
          width: 85,
          height: 55,
        }}
        duration={16000}
        delay={8000}
      />

      {/* Small clouds - faster movement */}
      <AnimatedCloud
        source={require("@/assets/images/Cloud/s.png")}
        style={{
          top: screenHeight * 0.15,
          width: 60,
          height: 40,
        }}
        duration={12000}
        delay={3000}
      />

      <AnimatedCloud
        source={require("@/assets/images/Cloud/s.png")}
        style={{
          top: screenHeight * 0.35,
          width: 55,
          height: 35,
        }}
        duration={13000}
        delay={7000}
      />

      <AnimatedCloud
        source={require("@/assets/images/Cloud/s.png")}
        style={{
          top: screenHeight * 0.7,
          width: 65,
          height: 42,
        }}
        duration={11000}
        delay={4000}
      />

      {/* Additional layer of variety */}
      <AnimatedCloud
        source={require("@/assets/images/Cloud/xl.png")}
        style={{
          top: screenHeight * 0.8,
          width: 110,
          height: 75,
        }}
        duration={22000}
        delay={10000}
      />
    </View>
  );
};
