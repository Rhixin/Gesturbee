// app/index.tsx (Home Screen)
import { Text, View, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LandingPage() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login");
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  return (
    <View className="flex flex-col items-center justify-center h-[100vh] bg-primary">
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
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[300px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center ">
          Log In
        </Text>
      </Pressable>
      <Pressable
        onPress={navigateToRegister}
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[300px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Register
        </Text>
      </Pressable>
    </View>
  );
}
