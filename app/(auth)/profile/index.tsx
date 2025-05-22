import { View, Text, Image, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangePassword from "@/components/ChangePassword";
import EditPersonalInformation from "@/components/EditPersonalInformation";
import Settings from "@/components/Settings";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "expo-router";
import AuthService from "@/api/services/auth-service";

export default function Profile() {
  const { currentUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [chosenProfileTab, setChosenProfileTab] = useState(null);
  const trophyCount = 5;
  const fireCount = 9;
  const router = useRouter();
  const { showToast } = useToast();
  const navigate = (path) => {
    router.push(path);
  };

  function handleModal(component) {
    setChosenProfileTab(component);
    setModalVisible(true);
  }

  function handleEditProfilePicture() {
    alert("Edit Profile Picture pressed!");
    // upload functionality here.
  }

  // TODO: Normal Login Logic -------------------------------------------
  const normalLogOutListener = async () => {
    await AuthService.logout(showToast, navigate);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-primary rounded-t-3xl px-6 pt-4 pb-8 h-[60%] shadow-lg">
            <Pressable
              onPress={() => setModalVisible(false)}
              className="self-end mb-2"
            >
              <Ionicons name="close" size={28} color="gray" />
            </Pressable>
            {chosenProfileTab}
          </View>
        </View>
      </Modal>

      {/* Fixed Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-20 bg-primary shadow px-6 pt-6">
        <View className="flex-row justify-between items-center">
          {[
            { icon: "trophy", count: trophyCount },
            { icon: "flame", count: fireCount },
          ].map((item, index) => (
            <View
              key={index}
              className="flex-row items-center px-3 rounded-full"
            >
              <Ionicons name={item.icon} size={20} color="white" />
              <Text className="text-white ml-1 font-semibold">
                {item.count}
              </Text>
            </View>
          ))}
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 120, paddingBottom: 30 }}
      >
        <View className="items-center mt-6">
          <View className="relative">
            <Image
              source={require("../../../assets/images/Bee.png")}
              className="w-[120px] h-[120px] rounded-full object-cover bg-primary p-2"
            />
            <Pressable
              onPress={handleEditProfilePicture}
              className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow"
            >
              <Ionicons name="pencil" size={16} color="#333" />
            </Pressable>
          </View>
          <Text className="mt-4 text-lg font-poppins-semibold text-center text-black">
            {currentUser.firstName + " " + currentUser.lastName}
          </Text>
          <Text className="mt-4 text-lg font-poppins-semibold text-center text-black">
            {currentUser.roles}
          </Text>
        </View>

        <View className="bg-[#fff0c2] rounded-2xl p-4 mt-6 w-[90%] self-center items-center shadow-md">
          <Ionicons name="flame" size={64} color="#00BFAF" />
          <Text className="text-lg font-bold mt-2 mb-3 text-black">
            Daily Streak
          </Text>
          <View className="flex-row justify-between w-full px-4">
            <StreakSection />
          </View>
        </View>

        <View className="w-[90%] mt-10 self-center">
          <Text className="text-lg font-poppins-bold mb-4 text-black">
            Account
          </Text>

          <View className="space-y-3 ">
            {[
              {
                icon: "person-outline",
                label: "Edit Personal Information",
                component: <EditPersonalInformation />,
              },
              {
                icon: "lock-closed-outline",
                label: "Change Password",
                component: <ChangePassword />,
              },
              {
                icon: "settings-outline",
                label: "Settings",
                component: <Settings />,
              },
            ].map((item, index) => (
              <Pressable
                key={index}
                className="bg-white p-4 rounded-xl shadow flex-row items-center mb-6"
                onPress={() => handleModal(item.component)}
              >
                <View className="bg-primary/20 p-2 rounded-full">
                  <Ionicons name={item.icon} size={20} color="black" />
                </View>
                <Text className="ml-4 text-medium font-poppins-medium  text-black">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="w-[90%] mt-10 self-center">
          <Pressable
            className="bg-red-500 rounded-xl py-4 px-4 shadow"
            onPress={normalLogOutListener}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="ml-2 text-white font-semibold">Logout</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function StreakSection() {
  const streakData = [true, true, true, false, false, false, false];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      {streakData.map((active, idx) => (
        <View key={idx} className="items-center">
          <View
            className={`w-6 h-6 rounded-full ${
              active ? "bg-primary" : "border-2 border-primary"
            }`}
          />
          <Text className="text-xs mt-1 text-primary">{days[idx]}</Text>
        </View>
      ))}
    </>
  );
}
