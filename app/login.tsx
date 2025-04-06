import { View, Text, Button, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Login = () => {
  const router = useRouter();
  const navigateToHome = () => {
    router.push("/(auth)/home");
  };

  return (
    <View className="bg-primary h-[100vh] flex justify-center items-center">
      <Text>Login your information here</Text>

      <Pressable
        onPress={navigateToHome}
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Log in
        </Text>
      </Pressable>
    </View>
  );
};

export default Login;
