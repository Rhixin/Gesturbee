import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

const AnswerMultipleChoiceView = ({
  item,
  setAnswerItem,
  answerForm,
  currentViewIndex,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <View
      key={refreshKey}
      className="flex justify-center items-center flex-col"
    >
      <Video
        source={item.video}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        style={{
          marginTop: 30,
          width: "40%",
          height: "25%",
          aspectRatio: 16 / 9,
        }}
      />

      <View className="my-4">
        <Text className="text-2xl text-gray-800 font-semibold text-center">
          {item.question}
        </Text>
      </View>

      <View className="space-y-4 items-center mb-4 w-full">
        {[item.choiceA, item.choiceB, item.choiceC, item.choiceD].map(
          (choice, index) => (
            <TouchableOpacity
              key={index}
              className={`my-2 flex border rounded-full w-[250px] py-2 px-6 items-center flex-row justify-between ${
                answerForm[currentViewIndex] == index
                  ? "bg-primary"
                  : "bg-white"
              }`}
              onPress={() => {
                setAnswerItem(index);
                setRefreshKey((prev) => prev + 1);
              }}
            >
              <Text className="text-xl font-medium text-teal-500">
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
