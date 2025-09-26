import { useRef, useState, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SuccessModal from "@/components/modals/SuccessModal";
import WrongAnswerModal from "@/components/modals/WrongAnswerModal";
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
  isViganTheme = false,
}: {
  title: string;
  videoSource: any;
  choices: string[];
  correctAnswer: string;
  videoRef: React.MutableRefObject<any>;
  setStatus: React.Dispatch<React.SetStateAction<any>>;
  currentLessonIndex: number;
  isViganTheme?: boolean;
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
  const [showWrongAnswerModal, setShowWrongAnswerModal] = useState(false);

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    const currentStageId = Number(stageId);
    const currentLevelId = Number(levelId);

    // If we're on a higher stage or level, this is new content
    if (currentStageId > userSavedStage || currentLevelId > userSavedLevel) {
      return false;
    }

    // If we're on the same stage and level, check lesson progress
    if (currentStageId == userSavedStage && currentLevelId == userSavedLevel) {
      // If current lesson is beyond saved progress, it's not done yet
      return currentLessonIndex <= userSavedLesson;
    }

    // If we're on a lower stage/level, it's already done
    return true;
  };

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);

    if (option === correctAnswer) {
      console.log("Correct multiple choice answer selected!");
      const lessonAlreadyDone = isThisLessonAlreadyDone();
      console.log("Is lesson already done?", lessonAlreadyDone);
      console.log("Current lesson index:", currentLessonIndex);
      console.log("User saved lesson:", userSavedLesson);
      console.log(
        "User saved stage:",
        userSavedStage,
        "Stage ID:",
        Number(stageId)
      );
      console.log(
        "User saved level:",
        userSavedLevel,
        "Level ID:",
        Number(levelId)
      );

      // Always update progress if this lesson is at or beyond current progress
      if (!lessonAlreadyDone) {
        // Update Database
        if (userSavedLesson === userSavedTotalLesson) {
          console.log("Level complete! Updating to next level");
          updateLevel(
            currentUser.id,
            userSavedStage,
            userSavedLevel + 1,
            1,
            userSavedTotalLesson, // Use the same total lessons for next level
            true
          );
          setShowLevelCompleteModal(true);
        } else {
          console.log("Moving to next lesson:", userSavedLesson + 1);
          updateLevel(
            currentUser.id,
            userSavedStage,
            userSavedLevel,
            userSavedLesson + 1,
            userSavedTotalLesson,
            false
          );
        }
      }

      // Always show success modal regardless of lesson lock status
      setShowSuccessModal(true);
    } else {
      // Wrong answer selected
      setShowWrongAnswerModal(true);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
  };

  const handleTryAgain = () => {
    setShowWrongAnswerModal(false);
    setSelectedAnswer(""); // Reset selection to allow user to try again
  };

  return (
    <>
      {/* Title */}
      <View className="mt-4 w-full items-center">
        <Text
          className="text-3xl font-poppins-bold text-center"
          style={{
            color: isViganTheme ? "#6E6D6D" : "#374151",
            marginTop: 20,
          }}
        >
          What sign is this?
        </Text>
      </View>

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
          aspectRatio: 13 / 9,
          backgroundColor: "transparent",
        }}
      />

      <View className="items-center mb-4 w-full">
        {/* First Row - Options 0 and 1 */}
        <View className="flex-row justify-center my-8 w-full mt-10">
          {choices.slice(0, 2).map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === correctAnswer;

            return (
              <TouchableOpacity
                key={index}
                className="rounded-full py-3 px-4 items-center flex-row justify-center mx-6"
                style={{
                  width: 120,
                  height: 50,
                  backgroundColor: isSelected
                    ? isCorrect
                      ? isViganTheme
                        ? "#875C35"
                        : "#01D3C1"
                      : "#FFE9C3"
                    : "#FFE9C3",
                }}
                onPress={() => handleSelectAnswer(option)}
              >
                <Text
                  className="text-xl font-medium"
                  style={{
                    color:
                      isSelected && isCorrect
                        ? "white"
                        : isViganTheme
                        ? "#875C35"
                        : "#01D3C1",
                  }}
                >
                  {option}
                </Text>

                {isSelected && isCorrect && (
                  <View className="bg-yellow-400 h-4 w-4 rounded-full items-center justify-center ml-2">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Second Row - Options 2 and 3 */}
        <View className="flex-row justify-center mb-4 w-full">
          {choices.slice(2, 4).map((option, index) => {
            const actualIndex = index + 2;
            const isSelected = selectedAnswer === option;
            const isCorrect = option === correctAnswer;

            return (
              <TouchableOpacity
                key={actualIndex}
                className="rounded-full py-3 px-4 items-center flex-row justify-center mx-6"
                style={{
                  width: 120,
                  height: 50,
                  backgroundColor: isSelected
                    ? isCorrect
                      ? isViganTheme
                        ? "#875C35"
                        : "#01D3C1"
                      : "#FFE9C3"
                    : "#FFE9C3",
                }}
                onPress={() => handleSelectAnswer(option)}
              >
                <Text
                  className="text-xl font-medium"
                  style={{
                    color:
                      isSelected && isCorrect
                        ? "white"
                        : isViganTheme
                        ? "#875C35"
                        : "#01D3C1",
                  }}
                >
                  {option}
                </Text>

                {isSelected && isCorrect && (
                  <View className="bg-yellow-400 h-4 w-4 rounded-full items-center justify-center ml-2">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <SuccessModal
          isVisible={showSuccessModal}
          onContinue={handleContinueAndReset}
          message={"Your answer is correct!"}
        />

        <WrongAnswerModal
          isVisible={showWrongAnswerModal}
          onContinue={handleTryAgain}
        />
      </View>
    </>
  );
}
