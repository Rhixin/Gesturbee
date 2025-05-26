import React, { useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";

// Animated Beehive component
export default function AnimatedBeehive({
  percentage,
  isGeneral,
}: {
  percentage: number;
  isGeneral: boolean;
}) {
  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation (up and down movement)
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Gentle rotation animation
    const rotationAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle breathing/pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    floatingAnimation.start();
    rotationAnimation.start();
    pulseAnimation.start();

    // Cleanup function
    return () => {
      floatingAnimation.stop();
      rotationAnimation.stop();
      pulseAnimation.stop();
    };
  }, [floatAnim, rotateAnim, scaleAnim]);

  // Determine image source based on percentage and isGeneral
  let imageSource;
  if (isGeneral) {
    imageSource = require("@/assets/images/Activities Hive/general.png");
  } else if (percentage == 0) {
    imageSource = require("@/assets/images/Beehive/lock.png");
  } else if (percentage <= 25) {
    imageSource = require("@/assets/images/Beehive/20.png");
  } else if (percentage >= 26 && percentage <= 50) {
    imageSource = require("@/assets/images/Beehive/40.png");
  } else if (percentage >= 51 && percentage <= 80) {
    imageSource = require("@/assets/images/Beehive/60.png");
  } else if (percentage >= 81 && percentage < 100) {
    imageSource = require("@/assets/images/Beehive/80.png");
  } else {
    imageSource = require("@/assets/images/Beehive/100.png");
  }

  // Interpolate rotation value
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-3deg", "3deg"],
  });

  return (
    <Animated.View
      style={{
        width: 180,
        height: 180,
        paddingTop: 20,
        transform: [
          { translateY: floatAnim },
          { rotate: rotateInterpolate },
          { scale: scaleAnim },
        ],
      }}
    >
      <Image
        source={imageSource}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "contain",
        }}
        resizeMethod="resize"
      />
    </Animated.View>
  );
}
