import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ExerciseService from "@/api/services/exercise-service";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import Dropdown from "./Dropdown";

const { width: screenWidth } = Dimensions.get("window");

interface ActionQuestion {
  id: string;
  itemNumber: number;
  question: string;
  correctAnswer: string;
}

const CreateActionQuizModal = ({ modalVisible, setModalVisible, loadData }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const scrollViewRef = useRef<ScrollView>(null);
  const [sharedBatchId, setSharedBatchId] = useState<string>();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<ActionQuestion[]>([
    {
      id: "1",
      itemNumber: 1,
      question: "",
      correctAnswer: "A",
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const letterOptions = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  useEffect(() => {
    setSharedBatchId(generateUUIDv4());
  }, [modalVisible]);

  const generateId = () => (questions.length + 1).toString();

  const generateUUIDv4 = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const addQuestion = () => {
    const newQuestion: ActionQuestion = {
      id: generateId(),
      itemNumber: questions.length + 1,
      question: "",
      correctAnswer: "A",
    };
    setQuestions([...questions, newQuestion]);
    const newIndex = questions.length;
    setCurrentQuestionIndex(newIndex);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: newIndex * (screenWidth - 80),
        animated: true,
      });
    }, 100);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length <= 1) return;

    const questionIndex = questions.findIndex((q) => q.id === questionId);
    const newQuestions = questions.filter((q) => q.id !== questionId);
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      itemNumber: index + 1,
    }));
    setQuestions(updatedQuestions);

    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(updatedQuestions.length - 1);
    } else if (
      questionIndex <= currentQuestionIndex &&
      currentQuestionIndex > 0
    ) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const updateQuestion = (
    id: string,
    field: keyof ActionQuestion,
    value: string
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
    setError("");
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * (screenWidth - 80),
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / (screenWidth - 80));
    setCurrentQuestionIndex(currentIndex);
  };

  const isFormValid = () => {
    return quizTitle.trim() && questions.every((q) => q.correctAnswer);
  };

  const handleCreateQuiz = useCallback(async () => {
    if (!quizTitle.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (!questions.every((q) => q.correctAnswer)) {
      setError("Please select a letter for all questions.");
      return;
    }

    setIsLoading(true);

    try {
      const exerciseItems = questions.map((item) => ({
        itemNumber: item.itemNumber,
        question: item.question,
        correctAnswer: item.correctAnswer,
      }));

      const newExercise = {
        teacherId: currentUser.id,
        exerciseTitle: quizTitle,
        exerciseDescription: quizDescription,
        type: "Base",
        batchId: sharedBatchId,
        exerciseItems,
      };

      console.log(newExercise);

      const createQuizResponse = await ExerciseService.createExercise(
        newExercise
      );

      if (createQuizResponse.success) {
        showToast(createQuizResponse.message, "success");
        resetForm();
        loadData();
      } else {
        showToast(createQuizResponse.message, "error");
      }
    } catch (error) {
      console.error("Error:", error.message);
      showToast("Failed to create action quiz", "error");
    } finally {
      setIsLoading(false);
    }

    setError("");
  }, [quizTitle, quizDescription, questions, currentUser.id]);

  const resetForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([
      {
        id: "1",
        itemNumber: 1,
        question: "",
        correctAnswer: "A",
      },
    ]);
    setCurrentQuestionIndex(0);
    setError("");
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }}
        className="justify-center items-center px-4"
      >
        <View
          className="bg-white w-[80%] rounded-2xl p-6"
          style={{ maxHeight: "90%", minHeight: "85%" }}
        >
          <Text className="text-3xl font-poppins-bold text-titlegray mb-2">
            Create Action Exercise
          </Text>
          <Text className="text-lg text-subtitlegray mb-4 font-poppins">
            Create an interactive Exercise where AI checks the execution of the
            students
          </Text>

          {error ? (
            <Text className="text-red-500 text-center mb-4 font-poppins font-medium">
              {error}
            </Text>
          ) : null}

          <View style={{ flex: 1 }}>
            {/* Quiz Title */}
            <TextInput
              placeholder="Exercise Title"
              value={quizTitle}
              onChangeText={(text) => {
                setQuizTitle(text);
                setError("");
              }}
              className="rounded-lg p-3 mb-4 border border-gray-300"
            />
            {!quizTitle && error && (
              <Text className="text-red-500 text-sm mb-2 font-poppins">
                Exercise title is required
              </Text>
            )}

            {/* Quiz Description */}
            <TextInput
              placeholder="Exercise Description"
              value={quizDescription}
              onChangeText={setQuizDescription}
              numberOfLines={2}
              textAlignVertical="top"
              multiline={false}
              className="rounded-lg p-3 mb-6 text-left text-base border border-gray-300"
            />

            {/* Question Navigation */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-poppins font-semibold text-titlegray">
                  Questions ({questions.length})
                </Text>
                <TouchableOpacity
                  onPress={addQuestion}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                >
                  <Text className="text-blue-600 font-poppins font-medium">
                    + Add Question
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {questions.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => navigateToQuestion(index)}
                      className={`w-10 h-10 rounded-full mx-1 items-center justify-center ${
                        index === currentQuestionIndex
                          ? "bg-primary"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-poppins font-medium ${
                          index === currentQuestionIndex
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Horizontal Question Slider */}
              <View style={{ height: 400 }}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  style={{ flex: 1 }}
                >
                  {questions.map((question, index) => (
                    <View
                      key={question.id}
                      style={{ width: screenWidth - 60 }}
                      className="pr-2"
                    >
                      <View style={{ maxHeight: 400 }}>
                        <View className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-poppins-bold text-titlegray">
                              Question {index + 1}
                            </Text>
                            {questions.length > 1 && (
                              <TouchableOpacity
                                onPress={() => removeQuestion(question.id)}
                                className="bg-red-100 px-3 py-1 rounded"
                              >
                                <Text className="text-red-600 font-poppins font-medium">
                                  Remove
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          <TextInput
                            placeholder="Enter question title"
                            value={question.question}
                            onChangeText={(text) =>
                              updateQuestion(question.id, "question", text)
                            }
                            multiline={true}
                            numberOfLines={1}
                            className="rounded-lg p-3 border bg-white border-gray-300 mb-4"
                          />

                          <Text className="text-base font-poppins font-medium text-gray-700 mb-3">
                            Select Letter
                          </Text>

                          {/* Letter Selection Dropdown */}
                          <View className="mb-4">
                            <Dropdown
                              selectedValue={question.correctAnswer}
                              onValueChange={(value) =>
                                updateQuestion(
                                  question.id,
                                  "correctAnswer",
                                  value
                                )
                              }
                              options={letterOptions}
                            />
                          </View>

                          <Text className="text-sm font-poppins text-gray-600 mb-3">
                            Selected:{" "}
                            <Text className="font-poppins font-semibold text-primary text-lg">
                              {question.correctAnswer}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-end px-5 py-2 border-t border-gray-200">
            <TouchableOpacity onPress={resetForm} style={{ marginRight: 10 }}>
              <Text className="text-black font-poppins-medium text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`py-2 px-4 rounded-lg ${
                !isFormValid() || isLoading ? "opacity-50" : ""
              }`}
              disabled={!isFormValid() || isLoading}
              onPress={handleCreateQuiz}
            >
              <Text
                className={`font-poppins-medium text-base ${
                  isFormValid() && !isLoading ? "text-primary" : "text-gray-500"
                }`}
              >
                {isLoading ? "Creating..." : "Create Exercise"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateActionQuizModal;
