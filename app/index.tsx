import { Text, View, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [animation, setAnimation] = useState(null);

  const navigateToLogin = () => {
    router.push("/login");
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  useEffect(() => {
    setAnimation(require("../assets/animations/bubbles_yellow.json"));
  }, []);

  return (
    <View className="flex flex-col items-center justify-center h-[100vh] bg-primary relative">
      <LottieView
        source={animation}
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
      />

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

      <Pressable
        onPress={navigateToLogin}
        className="bg-white px-6 py-4 rounded-lg mx-auto min-w-[300px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Log In
        </Text>
      </Pressable>
      <Pressable
        onPress={navigateToRegister}
        className="bg-white px-6 py-4 rounded-lg mx-auto min-w-[300px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Register
        </Text>
      </Pressable>
    </View>
  );
}
