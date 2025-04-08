import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function Classroom() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Classroom id {id}</Text>
    </View>
  );
}
