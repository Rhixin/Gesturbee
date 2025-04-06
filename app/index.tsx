// app/index.tsx (Home Screen)
import { Text, View, Pressable, Button } from "react-native";
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
    <View className="flex flex-col items-center justify-center h-[100vh] bg-gradient-to-b from-[#00BFAF] to-[#104846]">
      <Text className="font-poppins-bold text-2xl tracking-widest text-white">
        GESTUR
        <Text className="text-secondary tracking-widest">BEE</Text>
      </Text>

      <Pressable
        onPress={navigateToLogin}
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center ">
          Log In
        </Text>
      </Pressable>
      <Pressable
        onPress={navigateToRegister}
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Register
        </Text>
      </Pressable>
    </View>
  );
}
