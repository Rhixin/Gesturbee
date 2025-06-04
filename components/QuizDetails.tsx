// components/QuizDetails.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface QuizDetailsProps {
  visible: boolean;
  quiz: any;
  onClose: () => void;
}

const QuizDetails: React.FC<QuizDetailsProps> = ({
  visible,
  quiz,
  onClose,
}) => {
  if (!quiz) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
          {/* Header */}
          <View className="flex-row justify-between items-start p-6 border-b border-gray-200">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-semibold text-gray-800 mb-2">
                {quiz.exerciseTitle}
              </Text>
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                  <Text className="text-blue-700 font-medium text-sm">
                    {"Multiple Choice"}
                  </Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-medium text-sm">
                    {quiz.exerciseItems.length} Question
                    {quiz.exerciseItems.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
              {quiz.createdAt && (
                <Text className="text-gray-500 text-sm">
                  Created: {formatDate(quiz.createdAt)}
                </Text>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600 text-xl font-bold">×</Text>
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
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </Text>
                <View className="bg-gray-50 p-4 rounded-lg">
                  <Text className="text-gray-700 leading-6">
                    {quiz.exerciseDescription}
                  </Text>
                </View>
              </View>
            )}

            {/* Questions Section */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Questions
              </Text>

              {quiz.exerciseItems.map((q: any, index: number) => (
                <View
                  key={index}
                  className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200"
                >
                  {"Multiple Choice" === "Multiple Choice" ? (
                    <>
                      {/* Question Header */}
                      <View className="flex-row items-center mb-3">
                        <View className="bg-blue-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="text-white font-bold text-sm">
                            {index + 1}
                          </Text>
                        </View>
                        <Text
                          className="text-lg font-semibold text-gray-800 flex-1 mt"
                          style={{ marginTop: 12 }}
                        >
                          {q.question}
                        </Text>
                      </View>

                      {/* Video URL if present */}
                      {q.videoUrl && (
                        <View className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <Text className="text-purple-700 font-medium text-sm mb-1">
                            Video Attached
                          </Text>
                          <Text
                            className="text-purple-600 text-xs"
                            numberOfLines={1}
                          >
                            {q.videoUrl}
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
                              className="font-medium text-base"
                            >
                              {choice}: {"Dummy"}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Correct Answer Indicator */}
                      <View className="mt-3 bg-green-100 p-2 rounded-lg">
                        <Text className="text-green-800 font-medium text-center text-sm">
                          ✓ Correct Answer: {q.correctAnswer}
                        </Text>
                      </View>
                    </>
                  ) : (
                    // For other quiz types (like flashcards)
                    <View>
                      <View className="flex-row items-center mb-3">
                        <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="text-white font-bold text-sm">
                            {index + 1}
                          </Text>
                        </View>
                        <Text className="text-lg font-semibold text-gray-800">
                          Question {`${index + 1}`}
                        </Text>
                      </View>
                      <View className="bg-white p-4 rounded-lg border border-gray-200">
                        <Text className="text-gray-700 leading-6">
                          Letter: {q.selectedAction}
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
            <View className="flex-row space-x-4">
              <View className="bg-blue-50 px-4 py-2 rounded-lg">
                <Text className="text-blue-700 font-medium text-sm">
                  {quiz.exerciseItems.length} Questions
                </Text>
              </View>
              <View className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-gray-700 font-medium text-sm">
                  {"Multiple Choice"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="bg-primary px-6 py-3 rounded-lg shadow-sm"
            >
              <Text className="text-white font-semibold text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default QuizDetails;
