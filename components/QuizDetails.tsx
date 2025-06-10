// components/QuizDetails.tsx
import QuizService from "@/api/services/quiz-service";
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
  Dimensions,
  ActivityIndicator,
} from "react-native";
import QuizDetailsSkeleton from "./skeletons/QuizDetailsSkeleton";

interface QuizDetailsProps {
  visible: boolean;
  quizId: any;
  onClose: () => void;
}

const QuizDetails: React.FC<QuizDetailsProps> = ({
  visible,
  quizId,
  onClose,
}) => {
  const { showToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuizDetails = async () => {
    setIsLoading(true);
    try {
      const response = await QuizService.getSpecificExercise(quizId);

      if (!response.success) {
        throw Error(response.message);
      }

      const exerciseItems = response.data.exerciseItems;

      // const signedUrls = await Promise.all(
      //   exerciseItems.map(async (item) => {
      //     const signedUrlResponse = await QuizService.getVideoContent(
      //       item.videoPath
      //     );

      //     if (!signedUrlResponse.success) {
      //       throw new Error("Failed fetching video content from AWS");
      //     }

      //     return signedUrlResponse.url;
      //   })
      // );

      //setVideos(signedUrls);
      setQuiz(response.data);
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
    if (visible && quizId) {
      fetchQuizDetails();
    }
  }, [visible, quizId]);

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
          {isLoading || !quiz ? (
            <QuizDetailsSkeleton></QuizDetailsSkeleton>
          ) : (
            <>
              {/* Header */}
              <View className="flex-row justify-between items-start p-6 border-b border-gray-200">
                <View className="flex-1 mr-4">
                  <Text className="text-3xl text-gray-800 mb-2 font-poppins-medium">
                    {quiz.exerciseTitle}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                      <Text className="text-blue-700 font-medium text-sm">
                        {quiz.exerciseType === "Base"
                          ? "Execution"
                          : "Multiple Choice"}
                      </Text>
                    </View>
                    <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                      <Text className="text-blue-700 font-poppins-medium text-sm">
                        {quiz.exerciseItems.length} Question
                        {quiz.exerciseItems.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  {quiz.createdAt && (
                    <Text className="text-gray-500 text-sm font-poppins">
                      Created: {formatDate(quiz.createdAt)}
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
                {quiz.exerciseDescription && (
                  <View className="mb-6">
                    <Text className="text-lg font-poppins text-gray-800 mb-2">
                      Description
                    </Text>
                    <View className="bg-gray-50 p-4 rounded-lg">
                      <Text className="text-gray-700 leading-6 font-poppins">
                        {quiz.exerciseDescription}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Questions Section */}
                <View className="mb-4">
                  <Text className="text-lg font-poppins text-gray-800 mb-4">
                    Questions
                  </Text>

                  {quiz.exerciseItems.map((q: any, index: number) => (
                    <View
                      key={index}
                      className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200"
                    >
                      {quiz.exerciseType === "MultipleChoice" ? (
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
                          {q.presignedURL && (
                            <View className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <Text className="text-purple-700 font-poppins-medium text-sm mb-1">
                                Video Attached
                              </Text>
                              <Text
                                className="text-purple-600 text-xs"
                                numberOfLines={1}
                              >
                                {q.presignedURL}
                              </Text>
                            </View>
                          )}

                          {/* Answer Choices */}
                          <View className="space-y-2">
                            {(["A", "B", "C", "D"] as const).map((choice) => (
                              <View
                                key={choice}
                                className={`flex-row items-center p-5 rounded-md mb-2 ${
                                  q.correctAnswer === choice
                                    ? "bg-primary"
                                    : "bg-white border border-gray-200"
                                }`}
                                style={{ margin: 12, paddingLeft: 12 }}
                              >
                                <Text
                                  style={
                                    q.correctAnswer === choice
                                      ? { color: "white" }
                                      : { color: "black" }
                                  }
                                  className="font-poppins text-base"
                                >
                                  {choice}.{"  "}
                                  {q[`choice${choice}`] || "No answer provided"}
                                </Text>
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
                            <Text className="text-lg font-poppins-medium text-gray-800">
                              {q.itemNumber}. {q.question}
                            </Text>
                          </View>
                          <View className="bg-white p-4 rounded-lg border border-gray-200">
                            <Text className="text-gray-700 leading-6">
                              Letter: {q.correctAnswer}
                            </Text>
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

export default QuizDetails;
