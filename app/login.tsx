import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Loading from "@/components/Loading";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const navigateToHome = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/(auth)/home");
    }, 2000);
  };

  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <View className="bg-primary h-[100vh] flex">
      {/* Top Message */}
      <View className="min-h-[100px] flex flex-row items-center justify-start gap-6 px-6 mt-20">
        <Text className="text-white font-poppins-bold text-3xl">
          Welcome Back!
        </Text>

        <Image
          source={require("../assets/images/Bee.png")}
          style={{ width: 70, height: 70, resizeMode: "contain" }}
        />
      </View>

      {/* White Container */}
      <View className="bg-white h-[80vh] w-full rounded-t-3xl flex-1 p-6 py-10">
        {/* Email Label & Input */}
        <View className="mb-4">
          <Text className="text-tertiary font-poppins-semibold mb-2">
            Email
          </Text>
          <View className="border p-1 px-2 border-primary rounded-lg">
            <TextInput
              className="min-h-[40px] text-base text-black"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Password Label & Input */}
        <View className="mb-4">
          <Text className="text-tertiary font-poppins-semibold mb-2">
            Password
          </Text>

          <View className="border p-1 px-2 border-primary rounded-lg flex-row items-center justify-between">
            <TextInput
              className="min-h-[40px] text-base text-black flex-1 pr-2"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#6B7280"
              />
            </Pressable>
          </View>
        </View>

        {/* Forget Password */}
        <View className="flex items-end w-full mb-4">
          <Text className="text-tertiary font-poppins">Forget Password?</Text>
        </View>

        {/* Login Button */}
        <Pressable
          onPress={navigateToHome}
          className="bg-primary px-6 py-4 rounded-lg mx-auto w-full mt-4"
        >
          <Text className="text-white font-poppins-bold text-center">
            Log in
          </Text>
        </Pressable>

        {/* Loading Indicator */}
        {loading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {/* Sign Up */}
        <View className="w-full items-center my-8">
          <Text className="font-poppins text-primary">
            Don't have an account?
            <Link href="/register">
              <Text className="font-poppins-medium text-primary"> Sign Up</Text>
            </Link>
          </Text>
        </View>

        {/* or Login With */}
        <View className="w-full items-center flex flex-row">
          <View className="border-b flex-1 border-primary"></View>
          <Text className="font-poppins text-primary mx-6">or login with</Text>
          <View className="border-b flex-1 border-primary"></View>
        </View>

        <View className="flex flex-row justify-center space-x-6 mt-10 gap-8">
          {/* Google Icon */}
          <Pressable className="bg-transparent rounded-full">
            <Ionicons name="logo-google" size={36} color="#DB4437" />
          </Pressable>

          {/* Facebook Icon */}
          <Pressable className="bg-transparent rounded-full">
            <Ionicons name="logo-facebook" size={36} color="#4267B2" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Login;
