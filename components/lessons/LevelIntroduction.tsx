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
    } else if (isManilaTheme) {
      const manilaMessages = [
        `Kumusta! Welcome to the bustling capital! Ready to count through ${letterList} in the heart of Manila?`,
        `Mabuhay from Metro Manila! Let's explore ${letterCount} numbers: ${letterList} in the city that never sleeps!`,
        `Welcome to the urban jungle! Today we'll master ${letterList} with the energy of Manila's streets.`,
        `Hello from the Pearl of the Orient! Ready to learn ${letterList} in the Philippines' vibrant capital?`,
        `Greetings from Maynila! Let's navigate through numbers ${letterList} like traversing the city's busy roads.`,
        `Welcome to the capital city! Time to discover ${letterCount} numbers: ${letterList} in metropolitan Manila!`,
        `Kamusta from the big city! In Level ${levelId}, we'll master ${letterList} with Manila's urban spirit.`,
        `Welcome, city learner! Today we explore ${letterList} in the dynamic atmosphere of Manila.`,
        `Mabuhay! Ready for a metropolitan learning adventure? We'll count through ${letterList} together!`
      ];
      return manilaMessages[levelId % manilaMessages.length];
    } else if (isSiargaoTheme) {
      const siargaoMessages = [
        `Surf's up! Welcome to Siargao's colorful paradise! Ready to ride the waves of learning with ${letterList}?`,
        `Aloha from the surfing capital! Let's catch some knowledge waves with ${letterCount} vibrant colors: ${letterList}!`,
        `Welcome to island life! Today we'll paint the sky with colors ${letterList} in beautiful Siargao.`,
        `Hang ten, color explorer! In Level ${levelId}, we'll master ${letterList} like a true island surfer.`,
        `Greetings from paradise! Ready to dive into the colorful world of ${letterList} in Siargao?`,
        `Welcome to the Cloud 9 of learning! Let's surf through colors ${letterList} together!`,
        `Island vibes activated! Time to discover ${letterCount} amazing colors: ${letterList} in tropical Siargao.`,
        `Aloha, beach learner! Today we explore ${letterList} with the spirit of Siargao's waves.`,
        `Welcome to our island classroom! Ready for a colorful adventure with ${letterList}?`
      ];
      return siargaoMessages[levelId % siargaoMessages.length];
    } else if (isBoracayTheme) {
      const boracayMessages = [
        `Kamusta from White Beach! Welcome to Boracay's greeting paradise! Ready to learn ${letterList} by the crystal clear waters?`,
        `Mabuhay from the world's best beach! Let's master ${letterCount} beautiful greetings: ${letterList} in tropical Boracay!`,
        `Welcome to island hospitality! Today we'll spread warmth with greetings ${letterList} in stunning Boracay.`,
        `Greetings from paradise! In Level ${levelId}, we'll learn ${letterList} like a true Boracay local.`,
        `Hello from the sunset capital! Ready to welcome the world with ${letterList} in beautiful Boracay?`,
        `Welcome to the friendliest island! Let's master greetings ${letterList} together by the white sand!`,
        `Beach vibes activated! Time to discover ${letterCount} warm greetings: ${letterList} in tropical Boracay.`,
        `Kumusta, beach lover! Today we explore ${letterList} with the hospitality of Boracay's shores.`,
        `Welcome to our beachside classroom! Ready for a greeting adventure with ${letterList}?`
      ];
      return boracayMessages[levelId % boracayMessages.length];
    } else if (isPalawanTheme) {
      const palawanMessages = [
        `Kamusta from the pristine islands! Welcome to Palawan's family paradise! Ready to learn about ${letterList} in the Philippines' last frontier?`,
        `Mabuhay from the underground river! Let's explore ${letterCount} beautiful family words: ${letterList} in stunning Palawan!`,
        `Welcome to nature's sanctuary! Today we'll bond with family words ${letterList} in breathtaking Palawan.`,
        `Greetings from paradise! In Level ${levelId}, we'll learn about ${letterList} like a true Palawan family.`,
        `Hello from the island province! Ready to sail through family connections with ${letterList} in beautiful Palawan?`,
        `Welcome to the wildlife haven! Let's discover family bonds with ${letterList} together by the crystal waters!`,
        `Island family vibes activated! Time to explore ${letterCount} loving family words: ${letterList} in tropical Palawan.`,
        `Kumusta, nature lover! Today we explore ${letterList} with the warmth of Palawan's families.`,
        `Welcome to our island family classroom! Ready for a family adventure with ${letterList}?`
      ];
      return palawanMessages[levelId % palawanMessages.length];
    } else if (isCebuTheme) {
      const cebuMessages = [
        `Kamusta from the Queen City! Welcome to Cebu's days adventure! Ready to learn ${letterList} in the heart of the Visayas?`,
        `Mabuhay from Cebu! Let's explore ${letterCount} days of the week: ${letterList} in the mango capital!`,
        `Welcome to the heritage city! Today we'll master ${letterList} with the warmth of Cebu's culture.`,
        `Greetings from Cebu! In Level ${levelId}, we'll learn ${letterList} like a true Cebuano.`,
        `Hello from the gateway to the south! Ready to discover the days with ${letterList} in beautiful Cebu?`,
        `Welcome to the cradle of Christianity! Let's learn ${letterList} together in historic Cebu!`,
        `Cebu vibes activated! Time to explore ${letterCount} important days: ${letterList} in tropical Cebu.`,
        `Kumusta, island learner! Today we explore ${letterList} with the spirit of Cebu's hospitality.`,
        `Welcome to our Cebu classroom! Ready for a days adventure with ${letterList}?`
      ];
      return cebuMessages[levelId % cebuMessages.length];
    } else if (isBoholTheme) {
      const boholMessages = [
        `Kamusta from the Chocolate Hills! Welcome to Bohol's months adventure! Ready to learn ${letterList} in the land of tarsiers?`,
        `Mabuhay from Bohol! Let's explore ${letterCount} months of the year: ${letterList} in this natural wonder!`,
        `Welcome to the tarsier sanctuary! Today we'll master ${letterList} with the charm of Bohol's nature.`,
        `Greetings from Bohol! In Level ${levelId}, we'll learn ${letterList} like a true Boholano.`,
        `Hello from the land of natural wonders! Ready to discover the months with ${letterList} in beautiful Bohol?`,
        `Welcome to the biodiversity paradise! Let's learn ${letterList} together in historic Bohol!`,
        `Bohol vibes activated! Time to explore ${letterCount} months: ${letterList} in this tropical wonderland.`,
        `Kumusta, nature explorer! Today we explore ${letterList} with the spirit of Bohol's wildlife.`,
        `Welcome to our Bohol classroom! Ready for a months adventure with ${letterList}?`
      ];
      return boholMessages[levelId % boholMessages.length];
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
