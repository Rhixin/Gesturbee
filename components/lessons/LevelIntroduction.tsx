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
}

export default function LevelIntroduction({
  levelId,
  letters,
  currentLessonIndex,
  onContinue,
  goToPreviousLesson,
  isViganTheme = false,
}: LevelIntroductionProps) {
  const getDynamicMessage = () => {
    const letterCount = letters.length;
    const letterList = letters.join(", ");

    if (isViganTheme) {
      const viganMessages = [
        `¡Maayong aga! Ready to explore the colonial letters ${letterList}? Let's journey through Vigan's cobblestone paths of learning!`,
        `Welcome, young explorer! In this heritage level, we'll master the letters ${letterList} like the scholars of old Vigan.`,
        `¡Hola, amigo! Time to discover ${letterCount} beautiful letters: ${letterList}. Let's make history together in Vigan!`,
        `Greetings from the UNESCO city! Today's adventure features the letters ${letterList}. Ready to sign like a true Ilocano?`,
        `Welcome to our Spanish colonial classroom! We'll learn ${letterList} while walking through Vigan's historic streets.`,
        `¡Buenos días! Let's explore ${letterCount} letters in this heritage level: ${letterList}. Vigan's wisdom awaits!`,
        `Step into history! In Level ${levelId}, we'll master ${letterList} with the spirit of Vigan's ancestors.`,
        `Welcome, heritage learner! Today we discover ${letterList} in the beautiful setting of historic Vigan.`,
        `¡Kamusta! Ready for a colonial learning adventure? We'll explore letters ${letterList} together!`
      ];
      return viganMessages[levelId % viganMessages.length];
    } else {
      const regularMessages = [
        `Welcome to Level ${levelId}! Ready to master ${letterCount} amazing letters: ${letterList}? Let's begin this exciting journey!`,
        `Hello there, learner! In Level ${levelId}, we'll explore the letters ${letterList}. Are you ready to sign your way to success?`,
        `Great to see you again! This level focuses on ${letterList}. Let's make these ${letterCount} letters your new best friends!`,
        `Welcome back, champion! Level ${levelId} brings us ${letterList}. Time to show these letters what you're made of!`,
        `Hey there, sign language star! Ready to tackle ${letterList} in Level ${levelId}? Let's make some magic happen!`,
        `Welcome to your next adventure! We'll be learning ${letterList} today. Are you excited to expand your signing skills?`,
        `Hello, future signing expert! Level ${levelId} is all about mastering ${letterList}. Let's dive right in!`,
        `Welcome to the learning zone! Today's mission: conquer the letters ${letterList}. Ready to accept the challenge?`,
        `Hey there, dedicated learner! In Level ${levelId}, we'll perfect our skills with ${letterList}. Let's get started!`
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
            source={require("@/assets/images/Bee/bee3.png")}
            style={{ width: 150, height: 200 }}
            resizeMode="contain"
          />
        </View>

        {/* Speech Bubble - Right Side */}
        <View className="flex-1 relative">
          <View
            style={{
              backgroundColor: isViganTheme ? "#8B4513" : "#374151",
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
