import ExerciseService from "@/api/services/exercise-service";
import { useToast } from "@/context/ToastContext";
import { Video } from "expo-av";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import ExerciseDetailsSkeleton from "@/components/skeletons/ExerciseDetailsSkeleton";
import VideoPlayer from "@/components/common/VideoPlayer";
import { Ionicons } from "@expo/vector-icons";

interface AnswerExerciseModalProps {
  visible: boolean;
  exerciseId: any;
  onClose: () => void;
  studentAnswers: [];
}

const AnswerExerciseModal: React.FC<AnswerExerciseModalProps> = ({
  visible,
  exerciseId,
  onClose,
  studentAnswers,
}) => {
  console.log("here");
  console.log(studentAnswers);
  const { showToast } = useToast();
  const [exercise, setExercise] = useState(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExerciseDetails = async () => {
    setIsLoading(true);
    try {
      const response = await ExerciseService.getSpecificExercise(exerciseId);

      if (!response.success) {
        throw Error(response.message);
      }

      if (response.data.exerciseType == "MultipleChoice") {
        const exerciseItems = response.data.exerciseItems;

        const signedUrls = await Promise.all(
          exerciseItems.map(async (item) => {
            const signedUrlResponse = await ExerciseService.getVideoContent(
              item.presignedURL
            );

            if (!signedUrlResponse.success) {
              throw new Error("Failed fetching video content from AWS");
            }

            return signedUrlResponse.data;
          })
        );

        setVideos(signedUrls);
      }

      setExercise(response.data);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (visible && exerciseId) {
      fetchExerciseDetails();
    }
  }, [visible, exerciseId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }}
        className="justify-center items-center px-4"
      >
        <View
          className="bg-white w-[90%] rounded-2xl"
          style={{ maxHeight: "90%", minHeight: "70%" }}
        >
          {isLoading || !exercise ? (
            <ExerciseDetailsSkeleton></ExerciseDetailsSkeleton>
          ) : (
            <>
              {/* Header */}
              <View className="flex-row justify-between items-start p-6 border-b border-gray-200">
                <View className="flex-1 mr-4">
                  <Text className="text-3xl text-gray-800 mb-2 font-poppins-medium">
                    {exercise.exerciseTitle}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                      <Text className="text-blue-700 font-medium text-sm">
                        {exercise.exerciseType === "Base"
                          ? "Execution"
                          : "Multiple Choice"}
                      </Text>
                    </View>
                    <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                      <Text className="text-blue-700 font-poppins-medium text-sm">
                        {exercise.exerciseItems.length} Question
                        {exercise.exerciseItems.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  {exercise.createdAt && (
                    <Text className="text-gray-500 text-sm font-poppins">
                      Created: {formatDate(exercise.createdAt)}
                    </Text>
                  )}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-600 text-xl font-poppins-bold">
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Description */}
                {exercise.exerciseDescription && (
                  <View className="mb-6">
                    <View className="bg-secondary  p-4 rounded-lg mb-4">
                      <View className="flex-col items-center justify-center text-center">
                        <Text className="text-sm text-white font-poppins mb-2">
                          Your Score
                        </Text>
                        <Text className="text-2xl font-medium text-white font-poppins">
                          {studentAnswers.score} /{" "}
                          {exercise.exerciseItems.length}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-lg font-poppins text-gray-800 mb-2">
                      Description
                    </Text>
                    <View className="bg-gray-50 p-4 rounded-lg">
                      <Text className="text-gray-700 leading-6 font-poppins">
                        {exercise.exerciseDescription}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Questions Section */}
                <View className="mb-4">
                  <Text className="text-lg font-poppins text-gray-800 mb-4">
                    Questions
                  </Text>

                  {exercise.exerciseItems.map((q: any, index: number) => (
                    <View
                      key={index}
                      className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200"
                    >
                      {exercise.exerciseType === "MultipleChoice" ? (
                        <>
                          <View className="flex-1 items-center justify-center bg-black">
                            <Video
                              source={{ uri: q.presignedURL }}
                              rate={1.0}
                              volume={1.0}
                              isMuted={false}
                              shouldPlay
                              useNativeControls
                              className="w-full h-80 rounded-xl"
                            />
                          </View>
                          {/* Question Header */}
                          <View className="flex-row items-center mb-3">
                            <Text
                              className="text-lg font-semibold text-gray-800 flex-1 mt ml-2"
                              style={{ marginTop: 12 }}
                            >
                              {q.itemNumber}. {q.question}
                            </Text>
                          </View>

                          {/* Video URL if present */}
                          {videos[index] && (
                            <VideoPlayer videoUrl={videos[index]}></VideoPlayer>
                          )}

                          {/* Answer Choices */}
                          <View className="space-y-2">
                            {(["A", "B", "C", "D"] as const).map((choice) => (
                              <View
                                key={choice}
                                className={`flex-row items-center p-5 rounded-md mb-2 ${
                                  studentAnswers[index]?.answer === choice &&
                                  choice !== q.correctAnswer
                                    ? "bg-primary"
                                    : choice === q.correctAnswer
                                    ? "bg-secondary"
                                    : "bg-white border border-gray-200"
                                }`}
                                style={{ margin: 12, paddingLeft: 12 }}
                              >
                                <Text
                                  style={
                                    choice === q.correctAnswer ||
                                    (studentAnswers[index]?.answer === choice &&
                                      choice !== q.correctAnswer)
                                      ? { color: "white" }
                                      : { color: "black" }
                                  }
                                  className="font-poppins text-base flex-1"
                                >
                                  {choice}.{"  "}
                                  {q[`choice${choice}`] || "No answer provided"}
                                </Text>

                                {/* Correct Answer Icon */}
                                {choice === q.correctAnswer && (
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color="white"
                                  />
                                )}

                                {/* Wrong Answer Icon */}
                                {studentAnswers[index]?.answer === choice &&
                                  choice !== q.correctAnswer && (
                                    <Ionicons
                                      name="close-circle"
                                      size={18}
                                      color="white"
                                    />
                                  )}
                              </View>
                            ))}
                          </View>
                        </>
                      ) : (
                        <View>
                          <View className="flex-row items-center mb-3">
                            <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                              <Text className="text-white font-poppins-bold text-sm">
                                {index + 1}
                              </Text>
                            </View>
                            <Text className="text-lg font-poppins-medium text-gray-800 flex-1">
                              {q.itemNumber}. {q.question}
                            </Text>
                            
                            {/* Status Indicator */}
                            {(() => {
                              const studentAnswer = studentAnswers[index]?.answer || studentAnswers[index];
                              const isCorrect = studentAnswer === q.correctAnswer;
                              const hasAnswer = studentAnswer != null;
                              
                              if (hasAnswer && isCorrect) {
                                return (
                                  <View className="bg-green-500 w-8 h-8 rounded-full items-center justify-center">
                                    <Ionicons name="checkmark" size={16} color="white" />
                                  </View>
                                );
                              } else {
                                return null;
                              }
                            })()}
                          </View>
                          
                          {/* Answer Details */}
                          <View className="space-y-3">
                            {(() => {
                              const studentAnswer = studentAnswers[index]?.answer || studentAnswers[index];
                              const hasAnswer = studentAnswer != null;
                              
                              return (
                                <>
                                  {/* Student Answer */}
                                  {hasAnswer ? (
                                    <View className={`flex-row items-center p-3 rounded-lg ${
                                      studentAnswer === q.correctAnswer ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                      <Text className="text-gray-600 font-poppins text-sm mr-2">Your answer:</Text>
                                      <Text className={`font-poppins-bold text-lg ${
                                        studentAnswer === q.correctAnswer ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                        {studentAnswer}
                                      </Text>
                                      <View className="ml-2">
                                        <Ionicons 
                                          name={studentAnswer === q.correctAnswer ? "checkmark-circle" : "close-circle"} 
                                          size={18} 
                                          color={studentAnswer === q.correctAnswer ? "#16a34a" : "#dc2626"} 
                                        />
                                      </View>
                                    </View>
                                  ) : (
                                    <View className="flex-row items-center p-3 rounded-lg bg-gray-100">
                                      <Text className="text-gray-600 font-poppins text-sm mr-2">Your answer:</Text>
                                      <Text className="text-gray-500 font-poppins">Not answered</Text>
                                    </View>
                                  )}
                                  
                                  {/* Correct Answer */}
                                  <View className="flex-row items-center p-3 rounded-lg bg-yellow-100">
                                    <Text className="text-gray-600 font-poppins text-sm mr-2">Correct answer:</Text>
                                    <Text className="text-yellow-700 font-poppins-bold text-lg">
                                      {q.correctAnswer}
                                    </Text>
                                    <View className="ml-2">
                                      <Ionicons name="checkmark-circle" size={18} color="#a16207" />
                                    </View>
                                  </View>
                                </>
                              );
                            })()}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Footer */}
              <View className="flex-row justify-between items-center p-6 border-t border-gray-200">
                <View className="flex-row space-x-4"></View>

                <TouchableOpacity
                  onPress={onClose}
                  className="bg-primary px-6 py-3 rounded-lg shadow-sm"
                >
                  <Text className="text-white font-poppins-medium text-base">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AnswerExerciseModal;
