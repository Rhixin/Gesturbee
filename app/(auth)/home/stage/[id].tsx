import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function Stage() {
  const { id } = useLocalSearchParams();

  const stageDummy = {
    name: "Alphabets",
    levels: [
      { id: 1, title: "A-G" },
      { id: 2, title: "H-N" },
      { id: 3, title: "O-U" },
      { id: 4, title: "V-Z" },
    ],
  };

  return (
    <SafeAreaView className="pt-10 bg-primary h-[100vh] flex items-center">
      <View className="bg-white rounded-2xl py-6 px-6 mb-6 w-[90%]">
        <Text className="font-poppins-bold text-secondary text-xl">
          Stage {id + ":   " + stageDummy.name}
        </Text>
      </View>

      <ScrollView className="w-[90%] max-h-ful">
        {stageDummy.levels.map((item, index) => (
          <TouchableOpacity
            className="bg-white rounded-2xl my-2 p-6 h-auto flex flex-row gap-4"
            activeOpacity={0.8}
          >
            <View
              key={item.id}
              className="max-h-[60px] flex items-center justify-center"
            >
              <Image
                source={require("@/assets/images/beehive locked.png")}
                className="max-w-[70px] max-h-[70px]"
                style={{
                  transform: [{ scale: 2 }],
                }}
              />
            </View>
            <View className="flex-1 flex-col justify-between">
              <Text className="text-tertiary font-poppins-bold text-xl">
                {"Level: " + (index + 1) + ": " + item.title}
              </Text>
              <View className="h-8 w-full bg-primary rounded-2xl"></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
