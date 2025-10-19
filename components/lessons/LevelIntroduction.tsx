import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LevelIntroductionProps {
  levelId: number;
  letters: string[];
  currentLessonIndex: number;
  onContinue?: () => void;
  goToPreviousLesson?: () => void;
  isViganTheme?: boolean;
  isSiargaoTheme?: boolean;
  isManilaTheme?: boolean;
  isBoracayTheme?: boolean;
  isPalawanTheme?: boolean;
  isCebuTheme?: boolean;
  isBoholTheme?: boolean;
}

export default function LevelIntroduction({
  levelId,
  letters,
  currentLessonIndex,
  onContinue,
  goToPreviousLesson,
  isViganTheme = false,
  isSiargaoTheme = false,
  isManilaTheme = false,
  isBoracayTheme = false,
  isPalawanTheme = false,
  isCebuTheme = false,
  isBoholTheme = false,
}: LevelIntroductionProps) {
  const getDynamicMessage = () => {
    const letterCount = letters.length;
    const letterList = letters.join(", ");

    if (isViganTheme) {
      const viganMessages = [
        `Welcome to Vigan! Let's learn ${letterList} together!`,
        `Maayong aga! Ready to master ${letterList} in historic Vigan?`,
        `Let's discover ${letterList} in beautiful Vigan!`,
        `Welcome! Time to learn ${letterList} like a true Ilocano.`,
        `Ready to explore ${letterList} in Vigan?`,
        `Heritage vibes! Let's master ${letterList} together!`,
        `Kumusta! Let's learn ${letterList} with Vigan's wisdom.`,
        `Welcome! Ready for a heritage adventure with ${letterList}?`
      ];
      return viganMessages[levelId % viganMessages.length];
    } else if (isManilaTheme) {
      const manilaMessages = [
        `Welcome to Manila! Let's learn ${letterList} together!`,
        `Mabuhay! Ready to master the numbers: ${letterList}?`,
        `Let's explore ${letterList} in the capital city!`,
        `Welcome! Time to learn ${letterList} in Manila.`,
        `Ready to discover ${letterList} in the big city?`,
        `City vibes! Let's master ${letterList} together!`,
        `Kumusta! Let's learn ${letterList} with Manila's energy.`,
        `Welcome! Ready for a number adventure with ${letterList}?`
      ];
      return manilaMessages[levelId % manilaMessages.length];
    } else if (isSiargaoTheme) {
      const siargaoMessages = [
        `Welcome to Siargao! Let's learn ${letterList} together!`,
        `Surf's up! Ready to master the colors: ${letterList}?`,
        `Let's paint the sky with ${letterList} in Siargao!`,
        `Welcome! Time to learn ${letterList} like an island surfer.`,
        `Ready to discover ${letterList} in paradise?`,
        `Island vibes! Let's explore ${letterList} together!`,
        `Aloha! Let's learn ${letterList} with Siargao's waves.`,
        `Welcome! Ready for a colorful adventure with ${letterList}?`
      ];
      return siargaoMessages[levelId % siargaoMessages.length];
    } else if (isBoracayTheme) {
      const boracayMessages = [
        `Welcome to Boracay! Let's learn ${letterList} by the beach!`,
        `Mabuhay! Ready to master ${letterList} in paradise?`,
        `Let's spread warmth with ${letterList} in beautiful Boracay!`,
        `Welcome! Time to learn ${letterList} like a Boracay local.`,
        `Ready to learn ${letterList} by the white sand?`,
        `Beach vibes! Let's discover ${letterList} together!`,
        `Kumusta! Let's explore ${letterList} with island hospitality.`,
        `Welcome to paradise! Ready to learn ${letterList}?`
      ];
      return boracayMessages[levelId % boracayMessages.length];
    } else if (isPalawanTheme) {
      const palawanMessages = [
        `Welcome to Palawan! Let's learn about ${letterList} together!`,
        `Mabuhay! Ready to explore family words: ${letterList}?`,
        `Let's discover ${letterList} in beautiful Palawan!`,
        `Welcome! Time to learn ${letterList} like a Palawan family.`,
        `Ready to learn family connections with ${letterList}?`,
        `Nature vibes! Let's explore ${letterList} together!`,
        `Kumusta! Let's learn ${letterList} with family warmth.`,
        `Welcome! Ready for a family adventure with ${letterList}?`
      ];
      return palawanMessages[levelId % palawanMessages.length];
    } else if (isCebuTheme) {
      const cebuMessages = [
        `Welcome to Cebu! Let's learn ${letterList} together!`,
        `Mabuhay! Ready to explore the days: ${letterList}?`,
        `Let's master ${letterList} in beautiful Cebu!`,
        `Welcome! Time to learn ${letterList} like a Cebuano.`,
        `Ready to discover ${letterList} in Cebu?`,
        `Cebu vibes! Let's explore ${letterList} together!`,
        `Kumusta! Let's learn ${letterList} with Cebu's hospitality.`,
        `Welcome! Ready for an adventure with ${letterList}?`
      ];
      return cebuMessages[levelId % cebuMessages.length];
    } else if (isBoholTheme) {
      const boholMessages = [
        `Welcome to Bohol! Let's learn ${letterList} together!`,
        `Mabuhay! Ready to explore the months: ${letterList}?`,
        `Let's master ${letterList} in beautiful Bohol!`,
        `Welcome! Time to learn ${letterList} like a Boholano.`,
        `Ready to discover ${letterList} in Bohol?`,
        `Bohol vibes! Let's explore ${letterList} together!`,
        `Kumusta! Let's learn ${letterList} with Bohol's nature.`,
        `Welcome! Ready for a months adventure with ${letterList}?`
      ];
      return boholMessages[levelId % boholMessages.length];
    } else {
      const regularMessages = [
        `Welcome to Level ${levelId}! Let's learn ${letterList} together!`,
        `Hello! Ready to master ${letterList}?`,
        `Let's explore ${letterList} in this level!`,
        `Welcome! Time to learn ${letterList}.`,
        `Ready to discover ${letterList}?`,
        `Let's master ${letterList} together!`,
        `Welcome! Let's learn ${letterList}!`,
        `Ready for an adventure with ${letterList}?`
      ];
      return regularMessages[levelId % regularMessages.length];
    }
  };

  return (
    <View
      className="w-full items-center justify-center px-6"
      style={{ paddingTop: 150, paddingBottom: 50 }}
    >
      {/* Bee and Message Container */}
      <View className="flex-row items-center justify-center w-full">
        {/* Bee Avatar - Left Side */}
        <View className="mr-4">
          <Image
            source={
              isSiargaoTheme
                ? require("@/assets/images/Bee/bee_palmtree.png")
                : isManilaTheme
                ? require("@/assets/images/Bee/bee1.png")
                : isBoracayTheme
                ? require("@/assets/images/Bee/bee1.png")
                : isPalawanTheme
                ? require("@/assets/images/Bee/bee1.png")
                : isCebuTheme
                ? require("@/assets/images/Bee/bee1.png")
                : isBoholTheme
                ? require("@/assets/images/Bee/bee1.png")
                : require("@/assets/images/Bee/bee3.png")
            }
            style={{ width: 150, height: 200 }}
            resizeMode="contain"
          />
        </View>

        {/* Speech Bubble - Right Side */}
        <View className="flex-1 relative">
          <View
            style={{
              backgroundColor: isViganTheme ? "#8B4513" : isSiargaoTheme ? "#B8A869" : isManilaTheme ? "#87A248" : isBoracayTheme ? "#488DA2" : isPalawanTheme ? "#6A645C" : isCebuTheme ? "#B65828" : isBoholTheme ? "#6D825A" : "#374151",
              borderRadius: 24,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text className="text-white font-poppins-medium text-center text-lg leading-6 mb-8">
              Buzz buzz!
            </Text>

            <Text className="text-white text-center font-poppins-medium text-base leading-6">
              {getDynamicMessage()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
