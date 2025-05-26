import React, { useState } from "react";
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
import { useGlobal } from "@/context/GlobalContext";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/context/AuthContext";
import { useLevel } from "@/context/LevelContext";
import { useToast } from "@/context/ToastContext";
import AuthService from "@/api/services/auth-service";
import { useFacebookAuth, useGoogleAuth } from "@/hooks/useOAuth";

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const { isLoading, setIsLoading } = useGlobal();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const { initializeLevel } = useLevel();
  const { showToast } = useToast();

  const navigate = (path) => {
    router.push(path);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Email must contain @";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSuccess = async (user, token) => {
    await AuthService.handleSuccessfulAuth(
      user,
      token,
      setCurrentUser,
      initializeLevel,
      router,
      showToast
    );

    setIsLoading(false);
  };

  const handleAuthError = (message) => {
    showToast(message, "error");
    setIsLoading(false);
  };

  const { googleRequest, promptGoogleAuth } = useGoogleAuth(
    handleAuthSuccess,
    handleAuthError,
    setIsLoading
  );

  const { facebookRequest, promptFacebookAuth } = useFacebookAuth(
    handleAuthSuccess,
    handleAuthError,
    setIsLoading
  );

  const normalLogInListener = async () => {
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const response = await AuthService.login(email, password);

    if (response.success) {
      const token = response.token;
      const user = response.data;

      await handleAuthSuccess(user, token);
    } else {
      showToast(response.error, "error");
    }

    setIsLoading(false);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

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
          <View
            className={`border p-1 px-4 rounded-lg bg-gray-100 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          >
            <TextInput
              className="min-h-[40px] text-base text-black"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.email && (
            <Text className="text-red-500 font-poppins text-sm mt-1">
              {errors.email}
            </Text>
          )}
        </View>

        {/* Password Label & Input */}
        <View className="mb-4">
          <Text className="text-subtitlegray font-poppins-semibold mb-2">
            Password
          </Text>

          <View
            className={`border p-1 px-4 rounded-lg flex-row items-center justify-between bg-gray-100 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          >
            <TextInput
              className="min-h-[40px] text-base text-black flex-1 pr-2"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={isLoading ? "#D1D5DB" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 font-poppins text-sm mt-1">
              {errors.password}
            </Text>
          )}
        </View>

        {/* Forget Password */}
        <View className="flex items-end w-full mb-4">
          <Text className="text-subtitlegray font-poppins">
            Forget Password?
          </Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={normalLogInListener}
          className={`px-6 py-4 rounded-lg mx-auto w-full mt-4 ${
            isLoading ? "bg-gray-400" : "bg-primary"
          }`}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row justify-center items-center space-x-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-poppins-bold text-center ml-2">
                Logging in...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-poppins-bold text-center">
              Log in
            </Text>
          )}
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
            className={`bg-transparent rounded-full ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
            activeOpacity={0.8}
            onPress={promptGoogleAuth}
            disabled={!googleRequest || isLoading}
          >
            <Ionicons name="logo-google" size={36} color="#DB4437" />
          </TouchableOpacity>

          {/* Facebook Icon */}
          <TouchableOpacity
            className={`bg-transparent rounded-full ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
            activeOpacity={0.8}
            onPress={promptFacebookAuth}
            disabled={!facebookRequest || isLoading}
          >
            <Ionicons name="logo-facebook" size={36} color="#4267B2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;
