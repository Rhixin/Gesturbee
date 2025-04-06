import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Login = () => {
  const router = useRouter();
  const navigateToHome = () => {
    router.push("/(auth)/home");
  };

  return (
    <View className="bg-primary h-[100vh] flex">
      <View className="min-h-[100px] flex flex-row items-center justify-start gap-6 px-6 mt-20">
        <Text className="text-white font-poppins-bold text-[28px]">
          Welcome Back!
        </Text>

        <Image
          source={require("../assets/images/Bee.png")}
          style={{ width: 70, height: 70, resizeMode: "contain" }}
        />
      </View>

      <View className="bg-white h-[80vh] w-full rounded-t-3xl flex-1">
        <Pressable
          onPress={navigateToHome}
          className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4"
        >
          <Text className="text-primary font-poppins-bold text-center">
            Log in
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;
