import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

const AnswerMultipleChoiceView = ({
  item,
  setAnswerItem,
  answerForm,
  currentViewIndex,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const possibleAnswers = ["A", "B", "C", "D"];
  const videoRef = useRef(null);

  console.log(item);
  return (
    <View className="flex justify-center items-center flex-col">
      <Video
        ref={videoRef}
        source={
          item?.video && typeof item.video === "string"
            ? { uri: item.video }
            : typeof item.video === "object" && "uri" in item.video
            ? item.video
            : { uri: "" }
        }
        useNativeControls
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        style={{
          marginTop: 20,
          width: "60%",
          height: "40%",
          aspectRatio: 16 / 8,
        }}
      />

      <View className="my-2">
        <Text className="text-xl text-gray-800 font-semibold text-center">
          {item.question}
        </Text>
      </View>

      <View className="space-y-3 items-center mb-2 w-full" key={refreshKey}>
        {[item.choiceA, item.choiceB, item.choiceC, item.choiceD].map(
          (choice, index) => (
            <TouchableOpacity
              key={index}
              className={`my-2 flex border rounded-full w-[240px] py-2 px-4 items-center flex-row justify-between ${
                answerForm?.[currentViewIndex]?.answer == possibleAnswers[index]
                  ? "bg-primary text-white"
                  : "bg-white"
              }`}
              onPress={() => {
                setAnswerItem({
                  itemNumber: item.itemNumber,
                  answer: possibleAnswers[index],
                });
                setRefreshKey((prev) => prev + 1);
              }}
            >
              <Text className="text-lg font-medium text-teal-500">
                {choice}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

export default AnswerMultipleChoiceView;
