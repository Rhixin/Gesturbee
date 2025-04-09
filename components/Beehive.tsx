import { View, Image } from "react-native";

// Beehive component
export default function Beehive({
  percentage,
  isGeneral,
}: {
  percentage: number;
  isGeneral: boolean;
}) {
  let imageSource;

  if (isGeneral) {
    imageSource = require("@/assets/images/Activities Hive/general.png");
  } else if (percentage <= 25) {
    imageSource = require("@/assets/images/Activities Hive/below-25.png");
  } else if (percentage >= 26 && percentage <= 50) {
    imageSource = require("@/assets/images/Activities Hive/below-50.png");
  } else if (percentage >= 51 && percentage <= 80) {
    imageSource = require("@/assets/images/Activities Hive/50-80.png");
  } else if (percentage >= 81 && percentage < 100) {
    imageSource = require("@/assets/images/Activities Hive/above-80.png");
  } else {
    imageSource = require("@/assets/images/Activities Hive/100.png");
  }

  return (
    <View style={{ width: 60, height: 60, overflow: "hidden" }}>
      <Image
        source={imageSource}
        style={{ width: "100%", height: "100%", resizeMode: "cover" }}
      />
    </View>
  );
}
