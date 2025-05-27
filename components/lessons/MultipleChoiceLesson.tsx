import { useRef, useState, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SuccessModal from "@/components/SuccessModal";
import { useLocalSearchParams } from "expo-router";
import { useLevel } from "@/context/LevelContext";
import { useAuth } from "@/context/AuthContext";

export default function MultipleChoiceLesson({
  title,
  videoSource,
  choices,
  correctAnswer,
  videoRef,
  setStatus,
  currentLessonIndex,
}: {
  title: string;
  videoSource: any;
  choices: string[];
  correctAnswer: string;
  videoRef: React.MutableRefObject<any>;
  setStatus: React.Dispatch<React.SetStateAction<any>>;
  currentLessonIndex: number;
}) {
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    updateLevel,
    setShowLevelCompleteModal,
  } = useLevel();
  const { stageId, levelId } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    if (
      Number(stageId) == userSavedStage &&
      Number(levelId) == userSavedLevel &&
      currentLessonIndex == userSavedLesson
    ) {
      return false;
    }

    return true;
  };

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);

    if (option === correctAnswer) {
      if (!isThisLessonAlreadyDone()) {
        // Update Database
        if (userSavedLesson === userSavedTotalLesson) {
          updateLevel(
            currentUser.id,
            userSavedStage,
            userSavedLevel + 1,
            1,
            12,
            true
          );
          setShowLevelCompleteModal(true);
        } else {
          updateLevel(
            currentUser.id,
            userSavedStage,
            userSavedLevel,
            userSavedLesson + 1,
            userSavedTotalLesson,
            false
          );
        }
      } else {
        // Show modal u did it
      }

      setShowSuccessModal(true);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <Video
        ref={videoRef}
        source={videoSource}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(status)}
        onEnd={async () => {
          if (videoRef?.current) {
            await videoRef.current.setStatusAsync({
              shouldPlay: true,
              positionMillis: 0,
            });
          }
        }}
        style={{
          marginTop: 30,
          width: "40%",
          height: "25%",
          aspectRatio: 16 / 9,
        }}
      />

      <View className="my-4">
        <Text className="text-2xl text-gray-800 font-semibold text-center">
          {title}
        </Text>
      </View>

      <View className="space-y-4 items-center mb-4 w-full">
        {choices.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === correctAnswer;

          return (
            <TouchableOpacity
              key={index}
              className={`border rounded-full w-[250px] py-2 mb-3 px-6 items-center flex-row justify-between ${
                isSelected
                  ? isCorrect
                    ? "bg-teal-500 border-teal-500"
                    : "bg-white border-teal-500"
                  : "bg-white border-gray-300"
              }`}
              onPress={() => handleSelectAnswer(option)}
            >
              <Text
                className={`text-xl font-medium ${
                  isSelected && isCorrect ? "text-white" : "text-teal-500"
                }`}
              >
                {option}
              </Text>

              {isSelected && isCorrect && (
                <View className="bg-yellow-400 h-6 w-6 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={18} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <SuccessModal
          isVisible={showSuccessModal}
          onContinue={handleContinueAndReset}
          message={"Your answer is correct!"}
        />
      </View>
    </>
  );
}
