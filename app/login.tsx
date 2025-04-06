import { View, Text, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Login = () => {
  const router = useRouter();
  const navigateToHome = () => {
    router.push("/(auth)/home");
  };

  return (
    <View>
      <Text>Login your information here</Text>
      <Button title="Login" onPress={navigateToHome} />
    </View>
  );
};

export default Login;
