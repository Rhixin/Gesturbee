import { View, Text, Button, Pressable } from "react-native";
import { useRouter } from "expo-router"; // Import useRouter from expo-router

export default function Profile() {
  const router = useRouter(); // Initialize the router

  // Function for handling button presses
  const goToChangeInformation = () => {
    // Navigate to the "change-name" page
    router.push("/profile/changeinformation");
  };

  const gotToChangePassword = () => {
    // Navigate to the "edit-info" page
    router.push("/profile/changepassword");
  };

  return (
    <View className="flex flex-col justify-center items-center h-[100vh]">
      <Text className="text-tertiary text-xl font-bold mb-6">Profile Page</Text>

      <Pressable
        onPress={goToChangeInformation}
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Change Information
        </Text>
      </Pressable>

      <Pressable
        onPress={gotToChangePassword}
        className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4"
      >
        <Text className="text-primary font-poppins-bold text-center">
          Change Password
        </Text>
      </Pressable>
    </View>
  );
}
