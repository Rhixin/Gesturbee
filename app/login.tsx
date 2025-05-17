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
import AuthService from "@/api/axios-auth";
import { useToast } from "@/context/ToastContext";
import api from "@/api/axios-config";
import TokenService from "@/api/axios-token";

// Ensure this is called OUTSIDE your component
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const { isLoading, setIsLoading } = useGlobal();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setCurrentUser } = useAuth();
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
  const REDIRECT_URI = AuthSession.makeRedirectUri();

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

  // Handle Google auth response
  useEffect(() => {
    const handleGoogleAuthResponse = async () => {
      if (googleResponse?.type === "success") {
        try {
          // 1. Get Google ID token
          const googleToken = googleResponse.params.id_token;

          // 2. Send Google token to backend
          const response = await api.post("/auth/external-login/google", {
            idToken: googleToken,
          });

          // 3. Backend responds with your app's tokens
          const token = response.data.token;
          const user = response.data.response.data;

          // 4. Save the token to TokenService
          await TokenService.saveToken(token);

          // 5. Set Authorization header for future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // 6. Update the user in AuthContext
          setCurrentUser(user);

          // // 7. Navigate to authenticated area
          router.replace("/(auth)/home");
          showToast("Logged in successfully!", "success");
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
      setIsLoading(false);
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
          // 1. Get Facebook access token
          const facebookAccessToken = facebookResponse.params.access_token;

          // 2. Send Facebook token to joshua's api
          const response = await api.post("/auth/external-login/facebook", {
            accessToken: facebookAccessToken,
          });

          console.log(response);
          // 3. Backend responds with your app's tokens
          const token = response.data.token;
          const user = response.data.response.data;

          // 4. Save the token to TokenService
          await TokenService.saveToken(token);

          // 5. Set Authorization header for future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // 6. Update the user in AuthContext
          setCurrentUser(user);

          // 7. Navigate to authenticated area
          router.replace("/(auth)/home");
          showToast("Logged in successfully!", "success");
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showToast("Facebook login failed!", "error");
    }
  };

  // TODO: Normal Login Logic -------------------------------------------
  const normalLogInListener = async () => {
    setIsLoading(true);
    await AuthService.login(email, password, showToast, navigate);
    setIsLoading(false);
  };

  // if (isLoading) {
  //   return <Loading />;
  // }

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
          onPress={normalLogInListener}
          className={`px-6 py-4 rounded-lg mx-auto w-full mt-4 ${
            isLoading ? "bg-gray-600" : "bg-primary"
          }`}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row justify-center items-center space-x-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-poppins-bold">
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
            className="bg-transparent rounded-full"
            activeOpacity={0.8}
            onPress={googleLogInListener}
            disabled={!googleRequest}
          >
            <Ionicons name="logo-google" size={36} color="#DB4437" />
          </TouchableOpacity>

          {/* Facebook Icon */}
          <TouchableOpacity
            className="bg-transparent rounded-full"
            activeOpacity={0.8}
            onPress={facebookLogInListener}
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
