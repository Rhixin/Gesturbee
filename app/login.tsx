import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Loading from "@/components/Loading";
import { useGlobal } from "@/context/GlobalContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

// Ensure this is called OUTSIDE your component
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const { isLoading, setIsLoading } = useGlobal();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // OAuth client IDs
  const WEB_CLIENT_ID =
    "971818626439-g1nnp0bek58q5sjd057m0cjf6ne4sjc2.apps.googleusercontent.com";
  const IOS_CLIENT_ID =
    "971818626439-k11g0olpa2nkkjpgvjso66g715ist6b1.apps.googleusercontent.com";
  const ANDROID_CLIENT_ID =
    "971818626439-g1nnp0bek58q5sjd057m0cjf6ne4sjc2.apps.googleusercontent.com";
  const FB_APP_ID = "1014031907323169";
  const REDIRECT_URI = AuthSession.makeRedirectUri();

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
    console.log("Redirect uri is: " + REDIRECT_URI);
  });

  // TODO: Handle Facebook auth response and then send token to backend
  useEffect(() => {
    const handleFacebookResponse = async () => {
      if (facebookResponse?.type === "success") {
        // Get the ID token
        const { id_token } = facebookResponse.params;
        console.log("Authentication successful!");
        console.log("ID token received:", id_token);

        // TODO: Send token to backend
        setIsLoading(false);
        router.push("/(auth)/home");
      } else if (facebookResponse?.type === "error") {
        console.error("Authentication error:", facebookResponse.error);
      }
    };

    handleFacebookResponse();
  }, [facebookResponse]);

  // Handle Event Listener Google sign in
  const handleFacebookSignIn = async () => {
    try {
      console.log("Starting Facebook Sign-In...");
      setIsLoading(true);
      await facebookPromptAsync();
    } catch (error) {
      setIsLoading(false);
      console.error("Facebook Sign-In Error:", error);
    }
  };

  // TODO: Login Logic
  const handleLogin = () => {
    // if (!email || !password) {
    //   console.log("Login Error", "Please enter both email and password");
    //   return;
    // }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/(auth)/home");
    }, 1000);
  };

  if (isLoading) {
    return <Loading />;
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
          onPress={handleLogin}
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
            onPress={handleFacebookSignIn}
            disabled={!facebookRequest}
          >
            <Ionicons name="logo-facebook" size={36} color="#4267B2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;
