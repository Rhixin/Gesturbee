import React, { useState, useRef, useEffect } from "react";
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
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import QuizService from "@/api/services/quiz-service";

const { width: screenWidth } = Dimensions.get("window");

interface QuizQuestion {
  id: string;
  itemNumber: number;
  question: string;
  videoUrl?: string;
  videoFileName?: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
}

const CreateQuizModal = ({ modalVisible, setModalVisible, loadData }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const scrollViewRef = useRef<ScrollView>(null);

  // Basic form state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      itemNumber: 1,
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
      correctAnswer: "A",
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Video handling
  const [uploadVideosList, setUploadVideosList] = useState([]);
  const [uriList, setUriList] = useState([]);
  const [sharedBatchId, setSharedBatchId] = useState<string>();

  // Simple utilities
  const generateId = () => (questions.length + 1).toString();
  const generateUUIDv4 = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  useEffect(() => {
    setSharedBatchId(generateUUIDv4());
  }, [modalVisible]);

  // Question management
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      itemNumber: questions.length + 1,
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
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

    // Update itemNumbers after removal
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

  const updateQuestion = (id: string, field: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateChoice = (
    id: string,
    choice: "A" | "B" | "C" | "D",
    value: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, choices: { ...q.choices, [choice]: value } } : q
      )
    );
  };

  const updateCorrectAnswer = (id: string, answer: "A" | "B" | "C" | "D") => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, correctAnswer: answer } : q))
    );
  };

  // Video handling
  const handleVideoUpload = async (questionId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const fileName = `class_materials/teacher/${
          currentUser.id
        }/content/${generateUUIDv4()}/content.mp4`;
        const itemNumber = questionId;

        let file = Platform.OS === "web" ? asset.file : asset.uri;

        if (Platform.OS !== "web") {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (!fileInfo.exists) return;
        }

        const newItem = {
          fileName,
          contentType: asset.mimeType || "video/mp4",
          batchId: sharedBatchId,
          itemNumber,
        };

        // Update the question with video file name
        setQuestions(
          questions.map((q) =>
            q.itemNumber === itemNumber
              ? { ...q, videoFileName: asset.name }
              : q
          )
        );

        setUploadVideosList((prev) => {
          const index = prev.findIndex(
            (item) => item.itemNumber === itemNumber
          );
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newItem;
            setUriList((prevUri) => {
              const updatedUri = [...prevUri];
              updatedUri[index] = file;
              return updatedUri;
            });
            return updated;
          } else {
            setUriList((prevUri) => [...prevUri, file]);
            return [...prev, newItem];
          }
        });
      }
    } catch (error) {
      console.error("Video upload error:", error);
    }
  };

  const removeVideo = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    // Remove from questions
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, videoUrl: undefined, videoFileName: undefined }
          : q
      )
    );

    // Remove from upload lists
    setUploadVideosList((prev) =>
      prev.filter((item) => item.itemNumber !== question.itemNumber)
    );
    setUriList((prev) => {
      const index = uploadVideosList.findIndex(
        (item) => item.itemNumber === question.itemNumber
      );
      if (index !== -1) {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      }
      return prev;
    });
  };

  // Navigation
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

  // Form validation and submission
  const isFormValid = () => {
    return (
      quizTitle.trim() &&
      questions.every(
        (q) =>
          q.question.trim() &&
          Object.values(q.choices).every((choice) => choice.trim())
      )
    );
  };

  const handleCreateQuiz = async () => {
    try {
      // Upload videos if any
      if (uploadVideosList.length > 0) {
        const uploadPresignedUrlResponse = await QuizService.uploadPresignedUrl(
          uploadVideosList
        );

        if (!uploadPresignedUrlResponse.success) {
          throw new Error("Error getting signed URLs");
        }

        const uploadSignedUrlResponse = await QuizService.uploadSignedUrl(
          uriList,
          uploadPresignedUrlResponse.data,
          "video/mp4"
        );

        if (!uploadSignedUrlResponse.success) {
          throw new Error(uploadSignedUrlResponse.message);
        }
      }

      // Create exercise
      const exerciseItems = questions.map((item) => ({
        itemNumber: item.itemNumber,
        question: item.question,
        correctAnswer: item.correctAnswer,
        choiceA: item.choices.A,
        choiceB: item.choices.B,
        choiceC: item.choices.C,
        choiceD: item.choices.D,
      }));

      const newExercise = {
        teacherId: currentUser.id,
        exerciseTitle: quizTitle,
        exerciseDescription: quizDescription,
        type: "MultipleChoice",
        batchId: sharedBatchId,
        exerciseItems,
      };

      const createQuizResponse = await QuizService.createQuiz(newExercise);
      if (!createQuizResponse.success) throw new Error("Error creating quiz");

      // Save video content if any
      if (uploadVideosList.length > 0) {
        const videoContentList = uploadVideosList.map((item) => ({
          contentS3Key: item.fileName,
          contentType: item.contentType,
          batchId: item.batchId,
          itemNumber: item.itemNumber,
        }));

        const createVideoContentResponse = await QuizService.createVideoContent(
          videoContentList
        );
        if (!createVideoContentResponse.success)
          throw new Error("Error creating video content");
      }

      showToast("Quiz created successfully!", "success");
      resetForm();
      loadData();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const resetForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([
      {
        id: "1",
        itemNumber: 1,
        question: "",
        choices: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
      },
    ]);
    setCurrentQuestionIndex(0);
    setUploadVideosList([]);
    setUriList([]);
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
            Create Muiltiple Choice Exercise
          </Text>
          <Text className="text-lg text-subtitlegray mb-4 font-poppins">
            Create a multiple choice exercise for your students!
          </Text>

          <View style={{ flex: 1 }}>
            {/* Quiz Title */}
            <TextInput
              placeholder="Exercise Title"
              value={quizTitle}
              onChangeText={setQuizTitle}
              className="rounded-lg p-3 mb-4 border border-gray-300"
            />

            {/* Quiz Description */}
            <TextInput
              placeholder="Exercise Description"
              value={quizDescription}
              onChangeText={setQuizDescription}
              numberOfLines={2}
              textAlignVertical="top"
              className="rounded-lg p-3 mb-6 text-left text-base border border-gray-300"
            />

            {/* Question Navigation */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-poppins-bold text-titlegray">
                  Questions ({questions.length})
                </Text>
                <TouchableOpacity
                  onPress={addQuestion}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                >
                  <Text className="text-blue-600 font-poppins-medium">
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
                        className={`text-sm font-poppins-medium ${
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
              <View style={{ height: 500 }}>
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
                      <View style={{ maxHeight: 500 }}>
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
                                <Text className="text-red-600 font-poppins-medium">
                                  Remove
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Question Text */}
                          <TextInput
                            placeholder="Enter your question"
                            value={question.question}
                            onChangeText={(text) =>
                              updateQuestion(question.id, "question", text)
                            }
                            textAlignVertical="top"
                            className="rounded-lg p-3 mb-3 text-left text-base border bg-white border-gray-300"
                          />

                          {/* Video Upload */}
                          <View className="mb-3">
                            <Text className="text-base font-poppins-medium text-gray-700 mb-2">
                              Upload Video (Optional)
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                handleVideoUpload(question.itemNumber)
                              }
                              className="border py-2 px-4 rounded-lg mb-2"
                            >
                              <Text className="text-black text-center font-poppins-medium">
                                {question.videoFileName
                                  ? "Change Video"
                                  : "Upload Video"}
                              </Text>
                            </TouchableOpacity>
                            {question.videoFileName && (
                              <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <View className="flex-row items-center justify-between">
                                  <View className="flex-1">
                                    <Text className="text-sm font-poppins-medium text-green-800 mb-1">
                                      ✓ Video uploaded
                                    </Text>
                                    <Text
                                      className="text-xs text-green-600 font-poppins"
                                      numberOfLines={1}
                                    >
                                      {question.videoFileName}
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => removeVideo(question.id)}
                                    className="ml-2 bg-red-100 px-2 py-1 rounded"
                                  >
                                    <Text className="text-red-600 font-poppins-medium text-xs">
                                      Clear
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>

                          {/* Choices */}
                          <Text className="text-base font-poppins-medium text-gray-700 mb-2">
                            Answer Choices
                          </Text>
                          {(["A", "B", "C", "D"] as const).map((choice) => (
                            <View
                              key={choice}
                              className="flex-row items-center mb-2"
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  updateCorrectAnswer(question.id, choice)
                                }
                                className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                                  question.correctAnswer === choice
                                    ? "border-primary bg-primary"
                                    : "border-gray-300"
                                }`}
                              >
                                {question.correctAnswer === choice && (
                                  <View className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </TouchableOpacity>
                              <Text className="font-poppins-medium text-gray-700 w-6">
                                {choice}.
                              </Text>
                              <TextInput
                                placeholder={`Choice ${choice}`}
                                value={question.choices[choice]}
                                onChangeText={(text) =>
                                  updateChoice(question.id, choice, text)
                                }
                                className="flex-1 ml-2 rounded-lg p-2 border bg-white border-gray-300"
                              />
                            </View>
                          ))}
                          <Text className="text-sm text-gray-500 mt-2 font-poppins">
                            Tap the circle to select the correct answer
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
              disabled={!isFormValid()}
              onPress={handleCreateQuiz}
            >
              <Text
                className={`font-poppins-medium text-base ${
                  isFormValid() ? "text-primary" : "text-gray-500"
                }`}
              >
                Create Exercise
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateQuizModal;
