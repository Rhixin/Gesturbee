import { Text, View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
// import LottieView from "lottie-react-native";
import { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import React from "react";

export default function LandingPage() {
  const router = useRouter();
  const { bubbleAnimation } = useGlobal();

  const navigateToLogin = () => {
    router.push("/login");
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  return (
    <View className="flex flex-col items-center justify-center h-[100vh] bg-primary relative">
      {/* <LottieView
        source={bubbleAnimation}
        autoPlay
        loop
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.2,
        }}
      /> */}

      <View className="flex flex-row gap-4">
        <Image
          source={require("../assets/images/Bee.png")}
          style={{ width: 100, height: 100, resizeMode: "contain" }}
        />
        <View className="flex justify-center">
          <Text className="font-poppins-bold text-3xl tracking-widest text-white">
            GESTUR
            <Text className="text-secondary tracking-widest">BEE</Text>
          </Text>

          <Text className="text-white text-sm">
            Turning Gestures into Conversations
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={navigateToLogin}
        className="bg-white px-6 py-4 rounded-lg mx-auto min-w-[300px] mt-4"
        activeOpacity={0.8}
      >
        <Text className="text-primary font-poppins-bold text-center">
          Log In
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={navigateToRegister}
        className="bg-white px-6 py-4 rounded-lg mx-auto min-w-[300px] mt-4"
        activeOpacity={0.8}
      >
        <Text className="text-primary font-poppins-bold text-center">
          Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
