import { View, Text, Image, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangePassword from "@/components/ChangePassword";

export default function Profile() {
  const [modalVisible, setModalVisible] = useState(false);
  const [chosenProfileTab, setChosenProfileTab] = useState(null);

  const trophyCount = 5;
  const fireCount = 9;

  function handleModal(chosenComponent) {
    setModalVisible(true);
    setChosenProfileTab(chosenComponent);
  }



  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View className="flex-1 justify-end items-center">
          <View className="w-full bg-primary p-6 rounded-t-3xl shadow-lg h-[60%]">
            <Pressable
              className=" p-3 rounded-md"
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Ionicons
                className="flex justify-end"
                name="close"
                size={32}
                color="black"
              />
            </Pressable>

            {chosenProfileTab}
          </View>
        </View>
      </Modal>

      <SafeAreaView className="bg-primary flex flex-row justify-end gap-4 px-8">
        {/* Trophy Icon with Count */}

        <View className="flex flex-row items-center ">
          <Ionicons name="trophy" size={24} color="white" />
          <Text className="text-white ml-1">{trophyCount}</Text>
        </View>

        {/* Fire Icon with Count */}
        <View className="flex flex-row items-center">
          <Ionicons name="flame" size={24} color="white" />
          <Text className="text-white ml-1">{fireCount}</Text>
        </View>
      </SafeAreaView>

      <View className="flex flex-col items-center h-auto">
        {/* Profile Image and Name */}
        <View className="flex justify-center items-center mt-4">
          <Image
            source={require("../../../assets/images/Bee.png")}
            className="max-w-[150px] max-h-[150px] rounded-full object-contain bg-primary p-4"
          />
          <Text className="text-start mt-4 font-poppins text-lg">
            Zhazted Rhixin V. Valles
          </Text>
        </View>

        {/* Streak Section */}
        <View className="min-h-[140px] items-center justify-end max-w-[350px] mx-auto rounded-2xl bg-[#FFEFC1] relative pb-4 mt-8 gap-4">
          <Ionicons
            name="flame"
            size={98}
            color="#00BFAF"
            className="absolute top-[-30px] text-primary z-10"
          />
          <StreakSection />
        </View>

        {/* Account Section */}
        <View>
          <Text className="text-tertiary text-lg font-poppins-medium my-2 mt-4">
            Account
          </Text>

          <View className="h-auto justify-items-center max-w-[500px] mx-auto">
            <Pressable
              className="border rounded-t-2xl w-full p-4 min-w-[350px]"
              onPress={() => {
                handleModal(EditPersonalInformation);
              }}
            >
              <View className="flex flex-row items-center">
                <Ionicons name="person-outline" size={20} color="black" />
                <Text className="text-start text-sm ml-2">
                  Edit Personal Information
                </Text>
              </View>
            </Pressable>

            <Pressable
              className="border border-t-0 w-full p-4 min-w-[350px]"
              onPress={() => {
                handleModal(<ChangePassword></ChangePassword>);
              }}
            >
              
              <View className="flex flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="black" />
                <Text className="text-start text-sm ml-2 bg-transparent">
                  Change Password
                </Text>
              </View>
            </Pressable>


            

            <Pressable
              className="border border-t-0 rounded-b-2xl w-full p-4 min-w-[350px]"
              onPress={() => {
                handleModal(Settings);
              }}
            >
              <View className="flex flex-row items-center">
                <Ionicons name="settings-outline" size={20} color="black" />
                <Text className="text-start text-sm ml-2">Settings</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <SafeAreaView className="flex items-center">
        <View className="max-w-[350px]">
          <Pressable className="border rounded-lg w-full p-4 min-w-[350px]">
            <View className="flex flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="black" />
              <Text className="text-start text-sm ml-2">Logout</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

function StreakSection() {
  const streakData = [true, true, true, false, false, false, false];
  return (
    <View className="justify-center mt-20 items-center min-w-[350px] rounded-2xl bg-[#FFEFC1]">
      <Text className="text-lg font-bold mb-2 font-poppins-medium">
        Start Daily Streak
      </Text>
      <View className="flex flex-row justify-around w-full">
        {streakData.map((streak, index) => (
          <View key={index} className="flex items-center">
            <View
              className={`w-[26px] h-[26px] rounded-full ${
                streak ? "bg-primary" : "border-primary border-2"
              } flex justify-center items-center`}
            ></View>
            <Text className="text-black font-poppins text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EditPersonalInformation() {
  return <Text>Personal Info</Text>;
}


function Settings() {
  return <Text>Settings</Text>;
}
