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
import Loading from "@/components/Loading";
import { useGlobal } from "@/context/GlobalContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "@/context/AuthContext";
import { useLevel } from "@/context/LevelContext";

import { useToast } from "@/context/ToastContext";
import api from "@/api/axios-config";

import { makeRedirectUri } from "expo-auth-session";
import TokenService from "@/api/services/token-service";
import AuthService from "@/api/services/auth-service";
import RoadmapService from "@/api/services/roadmap-service";

// Ensure this is called OUTSIDE your component
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const { isLoading, setIsLoading } = useGlobal();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const { initializeLevel } = useLevel();
  const { showToast } = useToast();

  const navigate = (path) => {
    router.push(path);
  };

  // OAuth client IDs
  const WEB_CLIENT_ID =
    "971818626439-jhdf8m930fkhjsah7u94bo68rr981apl.apps.googleusercontent.com";
  const IOS_CLIENT_ID =
    "971818626439-k11g0olpa2nkkjpgvjso66g715ist6b1.apps.googleusercontent.com";
  const ANDROID_CLIENT_ID =
    "971818626439-g1nnp0bek58q5sjd057m0cjf6ne4sjc2.apps.googleusercontent.com";

  const FB_APP_ID = "1014031907323169";
  const REDIRECT_URI = makeRedirectUri();

  // GOOGLE OAuth  ---------------------------------------------------
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      clientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      androidClientId: ANDROID_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
      scopes: ["profile", "email"],
      responseType: "id_token",
    });

  // Sequential API calls function
  const handleSuccessfulAuth = async (user, token) => {
    try {
      // Save token and set auth header
      await TokenService.saveToken(token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set user in context
      setCurrentUser(user);

      // Fetch user progress - this MUST succeed before navigation
      const progressResponse = await fetchCurrentRoadmapProgress(user.id);

      // Only proceed if progress data was successfully fetched
      if (progressResponse) {
        const { stage, level } = progressResponse.data.data;
        initializeLevel(user.id, stage, level);
      } else {
        throw new Error("Failed to load user progress data");
      }

      // Navigate to home only after everything succeeds
      setIsLoading(false);
      router.replace("/(auth)/home");
      showToast("Logged in successfully!", "success");
    } catch (error) {
      console.error("Error in authentication flow:", error);
      setIsLoading(false);

      // Clear any saved data on failure
      await TokenService.removeToken();
      delete api.defaults.headers.common["Authorization"];
      setCurrentUser(null);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  // Handle Google auth response
  useEffect(() => {
    const handleGoogleAuthResponse = async () => {
      if (googleResponse?.type === "success") {
        try {
          setIsLoading(true);

          // Get Google ID token
          const googleToken = googleResponse.params.id_token;

          // Send Google token to backend
          const response = await api.post("/auth/external-login/google", {
            idToken: googleToken,
          });

          // Backend responds with your app's tokens
          const token = response.data.token;
          const user = response.data.response.data;

          // Handle sequential auth flow
          await handleSuccessfulAuth(user, token);
        } catch (error) {
          console.error("Error during Google authentication:", error);
          setIsLoading(false);
          showToast("Google login failed. Please try again.", "error");
        }
      } else if (googleResponse?.type === "error") {
        console.error("Authentication error:", googleResponse.error);
        setIsLoading(false);
        showToast("Authentication cancelled or failed.", "error");
      }
    };

    handleGoogleAuthResponse();
  }, [googleResponse]);

  const googleLogInListener = async () => {
    try {
      setIsLoading(true);
      await googlePromptAsync();
    } catch (error) {
      setIsLoading(false);
      showToast("Google login failed!", "error");
    }
  };

  // FACEBOOK OAuth ---------------------------------------------------
  const [facebookRequest, facebookResponse, facebookPromptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: FB_APP_ID,
        scopes: ["public_profile", "email"],
        responseType: AuthSession.ResponseType.Token,
        redirectUri: REDIRECT_URI,
      },
      {
        authorizationEndpoint: "https://www.facebook.com/v12.0/dialog/oauth",
      }
    );

  useEffect(() => {
    const handleFacebookResponse = async () => {
      if (facebookResponse?.type === "success") {
        try {
          setIsLoading(true);

          // Get Facebook access token
          const facebookAccessToken = facebookResponse.params.access_token;

          // Send Facebook token to backend
          const response = await api.post("/auth/external-login/facebook", {
            accessToken: facebookAccessToken,
          });

          // Backend responds with your app's tokens
          const token = response.data.token;
          const user = response.data.response.data;

          // Handle sequential auth flow
          await handleSuccessfulAuth(user, token);
        } catch (error) {
          console.error("Error during Facebook authentication:", error);
          setIsLoading(false);
          showToast("Facebook login failed!", "error");
        }
      } else if (facebookResponse?.type === "error") {
        console.error("Authentication error:", facebookResponse.error);
        setIsLoading(false);
      }
    };

    handleFacebookResponse();
  }, [facebookResponse]);

  const facebookLogInListener = async () => {
    try {
      setIsLoading(true);
      await facebookPromptAsync();
    } catch (error) {
      setIsLoading(false);
      showToast("Facebook login failed!", "error");
    }
  };

  // Normal Login Logic -------------------------------------------
  const normalLogInListener = async () => {
    try {
      setIsLoading(true);

      const response = await AuthService.login(
        email,
        password,
        showToast,
        navigate
      );

      const token = response.data.token;
      const user = response.data.response.data;

      await handleSuccessfulAuth(user, token);
    } catch (error) {
      console.error("Error during normal login:", error);
      setIsLoading(false);
    }
  };

  // Fetch user progress API
  const fetchCurrentRoadmapProgress = async (userId) => {
    try {
      const response = await RoadmapService.getLevel(userId);
      console.log("ROADMAP PROGRESS:", response);
      return response;
    } catch (error) {
      console.error("Failed to fetch roadmap progress:", error);
      throw error; // Re-throw to be caught by the calling function
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
          <View className="border p-1 px-4 rounded-lg bg-gray-100 border-gray-300">
            <TextInput
              className="min-h-[40px] text-base text-black"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Password Label & Input */}
        <View className="mb-4">
          <Text className="text-subtitlegray font-poppins-semibold mb-2">
            Password
          </Text>

          <View className="border p-1 px-4 rounded-lg flex-row items-center justify-between bg-gray-100 border-gray-300">
            <TextInput
              className="min-h-[40px] text-base text-black flex-1 pr-2"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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
            onPress={googleLogInListener}
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
            onPress={facebookLogInListener}
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
