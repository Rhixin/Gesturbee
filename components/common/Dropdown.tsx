import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";

const Dropdown = ({ selectedValue, onValueChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
      >
        <Text className="text-base text-gray-800">{selectedValue}</Text>
        <Text className="text-gray-500 text-lg">{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg mt-1 max-h-48">
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onValueChange(option);
                  setIsOpen(false);
                }}
                className={`p-3 border-b border-gray-100 ${
                  selectedValue === option ? "bg-blue-50" : ""
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedValue === option
                      ? "text-blue-600 font-medium"
                      : "text-gray-800"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Dropdown;
