import { useRef, useState, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SuccessModal from "@/components/SuccessModal";

export default function MultipleChoiceLesson({
  title,
  videoSource,
  choices,
  correctAnswer,
  handleContinue,
  videoRef,
  setStatus,
}: {
  title: string;
  videoSource: any;
  choices: string[];
  correctAnswer: string;
  handleContinue: () => void;
  videoRef: React.MutableRefObject<any>;
  setStatus: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
    if (option === correctAnswer) {
      setShowSuccessModal(true);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
    setSelectedAnswer("");
    handleContinue();
  };

  return (
    <>
      <View className="mx-4 my-4">
        <View className="w-full bg-gray-300 rounded-lg overflow-hidden aspect-video items-center justify-center">
          <Video
            ref={videoRef}
            source={videoSource}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            onEnd={async () => {
              if (videoRef.current) {
                await videoRef.current.setStatusAsync({
                  shouldPlay: true,
                  positionMillis: 0,
                });
              }
            }}
            style={{ width: "100%", height: "100%", aspectRatio: 16 / 9 }}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-2xl text-gray-800 font-semibold text-center">
          {title}
        </Text>
      </View>

      <View className="space-y-4 items-center">
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
        />
      </View>
    </>
  );
}
