import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, TextInput, Pressable, Text, TouchableOpacity } from "react-native";

export default function ChangePassword({ onClose = () => {}, onSave = () => {} } = {}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveChanges = () => {
    // Add validation logic here
    if (newPassword === confirmPassword) {
      onSave();
    }
  };

  return (
    <View className="bg-primary">

      {/* Title */}
      <Text className="text-xl font-bold text-center mt-5 mb-8">Change your password</Text>
      
      {/* Current Password */}
      <View className="mb-4 mt-9">
        <Text className="mb-2 text-base">Current Password</Text>
        <View className="bg-white rounded-lg flex-row items-center py-2 border border-gray-200">
          <TextInput
            className="flex-1 px-6 h-full text-base"
            placeholder="Input your current password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <Pressable 
            className="px-6 h-full justify-center" 
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off" : "eye"}
              size={24}
              color="#6B7280"
            />
          </Pressable>
        </View>
      </View>

      {/* New Password */}
      <View className="mb-4">
        <Text className="mb-2 text-base">New Password</Text>
        <View className="bg-white rounded-lg flex-row items-center py-2 border border-gray-200">
          <TextInput
            className="flex-1 px-6 h-12 text-base"
            placeholder="*****"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Pressable 
            className="px-6 h-full justify-center" 
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={24}
              color="#6B7280"
            />
          </Pressable>
        </View>
      </View>

      {/* Confirm Password */}
      <View className="mb-6">
        <Text className="mb-2 text-base">Confirm Password</Text>
        <View className="bg-white rounded-lg flex-row items-center py-2 border border-gray-200">
          <TextInput
            className="flex-1 px-6 h-full text-base"
            placeholder="*****"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable 
            className="px-6 h-full justify-center" 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#6B7280"
            />
          </Pressable>
        </View>
      </View>


      {/* Save button */}
      <TouchableOpacity 
        className="bg-yellow-300 py-4 rounded-lg mt-4 border-2 border-gray-500"
        onPress={handleSaveChanges}
        >
        <Text className="text-center font-bold">Save changes</Text>
       </TouchableOpacity>

      

    </View>
    
  );
}