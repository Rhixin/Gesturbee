import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Loading from "@/components/Loading";
import { useGlobal } from "@/components/GlobalContext";

const Login = () => {
  const { isLoading, setIsLoading } = useGlobal();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const navigateToHome = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/(auth)/home");
    }, 1000);
  };

  if (isLoading) {
    return <Loading></Loading>;
  }

  return (
    <View className="bg-primary h-[100vh] flex ">
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
          <Text className="text-subtitlegray font-poppins-semibold mb-2">
            Email
          </Text>
          <View className="border p-1 px-4 rounded-lg bg-gray-100 border-gray-300">
            <TextInput
              className="min-h-[40px] text-base text-black"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Password Label & Input */}
        <View className="mb-4">
          <Text className="text-subtitlegray font-poppins-semibold mb-2">
            Password
          </Text>

          <View className="border p-1 px-4  rounded-lg flex-row items-center justify-between bg-gray-100 border-gray-300">
            <TextInput
              className="min-h-[40px] text-base text-black flex-1 pr-2"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forget Password */}
        <View className="flex items-end w-full mb-4">
          <Text className="text-subtitlegray font-poppins">
            Forget Password?
          </Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={navigateToHome}
          className="bg-primary px-6 py-4 rounded-lg mx-auto w-full mt-4"
          activeOpacity={0.8}
        >
          <Text className="text-white font-poppins-bold text-center">
            Log in
          </Text>
        </TouchableOpacity>

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
          <TouchableOpacity
            className="bg-transparent rounded-full"
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={36} color="#DB4437" />
          </TouchableOpacity>

          {/* Facebook Icon */}
          <TouchableOpacity
            className="bg-transparent rounded-full"
            activeOpacity={0.8}
          >
            <Ionicons name="logo-facebook" size={36} color="#4267B2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;
