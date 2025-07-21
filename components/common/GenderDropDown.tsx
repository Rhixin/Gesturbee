import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomDropdown = ({ 
  label,
  value, 
  options, 
  onSelect,
  placeholder = "Select an option" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const toggleDropdown = () => {
    setIsVisible(!isVisible);
  };

  const selectItem = (item) => {
    onSelect(item.value);
    setIsVisible(false);
  };

  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-subtitlegray mb-2">
        {label}
      </Text>
      
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={toggleDropdown}
        className="border border-gray-300 p-4 rounded-lg bg-gray-100 flex-row justify-between items-center"
      >
        <Text className={value ? "text-black" : "text-gray-400"}>
          {value || placeholder}
        </Text>
        <Ionicons 
          name={isVisible ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#888" 
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg">
            <View className="py-2 border-b border-gray-200">
              <Text className="text-center text-lg font-medium text-gray-700">Select {label}</Text>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-4 px-6 border-b border-gray-100 flex-row justify-between items-center"
                  onPress={() => selectItem(item)}
                >
                  <Text className="text-base text-gray-700">{item.label}</Text>
                  {value === item.value && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 250 }}
            />
            
            <TouchableOpacity
              className="py-4 bg-teal-500 m-4 rounded-lg"
              onPress={() => setIsVisible(false)}
            >
              <Text className="text-center text-white font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

