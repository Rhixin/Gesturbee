import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import LottieView from "lottie-react-native";

const Loading = () => {
  const [animation, setAnimation] = useState(null);
  useEffect(() => {
    setAnimation(require("../assets/animations/loading.json"));
  }, []);

  return (
    <View className="h-[100vh] bg-white flex justify-center items-center">
      <LottieView
        source={animation}
        autoPlay
        loop
        style={{
          opacity: 1,
          width: 128,
          height: 128,
        }}
      />
      <Text className="text-secondary font-poppins-medium">Loading...</Text>
    </View>
  );
};

export default Loading;
