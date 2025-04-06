import { View, Text, Button } from "react-native";
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
    <View className="flex-1 justify-center items-center bg-blue-500 p-5">
      <Text className="text-white text-xl font-bold mb-6">Profile Screen</Text>

      <View className="w-full max-w-md">
        <Button
          title="Edit Personal Information"
          onPress={goToChangeInformation}
          color="#4CAF50"
        />
        <View className="my-4" />
        <Button
          title="Change Password"
          onPress={gotToChangePassword}
          color="#4CAF50"
        />
      </View>
    </View>
  );
}
