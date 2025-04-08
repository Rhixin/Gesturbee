import { useLocalSearchParams } from "expo-router";
import { View, Text, SafeAreaView } from "react-native";

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
      <View className="w-[90%] max-h-ful">
        <View className="bg-white rounded-2xl py-6 px-6">
          <Text className="font-poppins-bold text-secondary text-xl">
            Stage {id + ":   " + stageDummy.name}
          </Text>
        </View>

        {stageDummy.levels.map((item) => {
          return (
            <View key={item.id}>
              <Text>{item.title}</Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
