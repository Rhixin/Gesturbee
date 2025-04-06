import { View, Text, Pressable } from "react-native";
import React from "react";

const Register = () => {
  return (
    <View className="bg-primary h-[100vh] flex justify-center items-center">
      <Text>Register</Text>

      <Pressable className="bg-white px-6 py-2 rounded-lg mx-auto min-w-[200px] mt-4">
        <Text className="text-primary font-poppins-bold text-center">
          Register
        </Text>
      </Pressable>
    </View>
  );
};

export default Register;
