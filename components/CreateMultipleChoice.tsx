import { useAuth } from "@/context/AuthContext";
import React, { useState, useRef, useEffect } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import {
  Modal,
  View,
  Text,
  TextInput,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import ClassRoomService from "@/api/services/classroom-service";
import { useToast } from "@/context/ToastContext";

const { width: screenWidth } = Dimensions.get("window");

interface QuizQuestion {
  id: string;
  question: string;
  videoUrl?: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
}

interface CreateQuizModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  addNewQuiz: (quiz: any) => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  modalVisible,
  setModalVisible,
  addNewQuiz,
}) => {
  const { currentUser } = useAuth();

  const { showToast } = useToast();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
      correctAnswer: "A",
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadVideosList, setUploadVideosList] = useState([]);
  const [uriList, setUriList] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleFocus = (fieldId: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handleBlur = (fieldId: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldId]: false }));
  };

  const [nextId, setNextId] = useState<number>(2);
  const [sharedBatchId, setSharedBatchId] = useState<string>();

  useEffect(() => {
    setSharedBatchId(generateUUIDv4());
  }, [modalVisible]);

  const handleVideoUpload = async (questionId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const contentType = asset.mimeType || "video/mp4";
        const fileName = `class_materials/teacher/${
          currentUser.id
        }/content/${generateUUIDv4()}/content.mp4`;
        const itemNumber = questionId;

        let file;

        if (Platform.OS === "web") {
          if (!asset.file) {
            console.error("Missing file object on web platform");
            return;
          }
          file = asset.file;
        } else {
          // Native platform
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (!fileInfo.exists) {
            console.error("File does not exist at:", asset.uri);
            return;
          }
          file = asset.uri;
        }

        const newItem = {
          fileName: fileName,
          contentType: contentType,
          batchId: sharedBatchId,
          itemNumber: itemNumber,
        };

        // Update state
        setUploadVideosList((prev) => {
          const index = prev.findIndex(
            (item) => item.itemNumber === itemNumber
          );

          if (index !== -1) {
            const updatedList = [...prev];
            updatedList[index] = newItem;

            setUriList((prevUriList) => {
              const updatedUriList = [...prevUriList];
              updatedUriList[index] = file;
              return updatedUriList;
            });

            return updatedList;
          } else {
            setUriList((prevUriList) => [...prevUriList, file]);
            return [...prev, newItem];
          }
        });
      }
    } catch (error) {
      console.error("Video upload error locally:", error);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: nextId.toString(),
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
      correctAnswer: "A",
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);

    setNextId((prev) => prev + 1);

    // Navigate to the new question
    const newIndex = newQuestions.length - 1;
    setCurrentQuestionIndex(newIndex);

    // Scroll to the new question
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: newIndex * (screenWidth - 80),
        animated: true,
      });
    }, 100);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      const questionIndex = questions.findIndex((q) => q.id === questionId);
      const newQuestions = questions.filter((q) => q.id !== questionId);
      setQuestions(newQuestions);

      if (currentQuestionIndex >= newQuestions.length) {
        setCurrentQuestionIndex(newQuestions.length - 1);
      } else if (
        questionIndex <= currentQuestionIndex &&
        currentQuestionIndex > 0
      ) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  const updateChoice = (
    questionId: string,
    choice: "A" | "B" | "C" | "D",
    value: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, choices: { ...q.choices, [choice]: value } }
          : q
      )
    );
  };

  const updateCorrectAnswer = (
    questionId: string,
    answer: "A" | "B" | "C" | "D"
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswer: answer } : q
      )
    );
  };

  const updateVideoUrl = (
    questionId: string,
    url: string,
    contentType: string
  ) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, videoUrl: url } : q))
    );
  };

  const removeVideo = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, videoUrl: undefined } : q
      )
    );
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
    if (quizTitle.trim() === "") return false;

    return questions.every(
      (q) =>
        q.question.trim() !== "" &&
        Object.values(q.choices).every((choice) => choice.trim() !== "")
    );
  };

  const handleCreateQuiz = async () => {
    try {
      // STEP 1: GET THE SIGNED URLS
      const uploadPresignedUrlResponse =
        await ClassRoomService.uploadPresignedUrl(uploadVideosList);

      if (!uploadPresignedUrlResponse.success) {
        throw new Error("Error getting signed URLs");
      }

      // STEP 2: UPLOAD THE VIDS TO AWS USING THE SIGNED URLS
      const uploadSignedUrlResponse = await ClassRoomService.uploadSignedUrl(
        uriList,
        uploadPresignedUrlResponse.data,
        "video/mp4"
      );

      if (!uploadSignedUrlResponse.success) {
        throw new Error("Error uploading videos to AWS");
      }

      // STEP 3: CREATE EXERCISE
      const exerciseItems = questions.map((item) => ({
        itemNumber: Number(item.id),
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
        exerciseItems: exerciseItems,
      };

      const createQuizResponse = await ClassRoomService.createQuiz(newExercise);

      if (!createQuizResponse.success) {
        throw new Error("Error creating Exercise Content");
      }

      // STEP 4: Save the video content to our database
      let videoContentList = uploadVideosList.map((item) => ({
        contentS3Key: item.fileName,
        contentType: item.contentType,
        batchId: item.batchId,
        itemNumber: item.itemNumber,
      }));

      const createVideoContentResponse =
        await ClassRoomService.createVideoContent(videoContentList);

      if (createVideoContentResponse.success) {
        showToast(createVideoContentResponse.message, "success");
      } else {
        showToast(createVideoContentResponse.message, "error");
        throw new Error("Error creating Video Content");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }

    resetForm();
  };

  const resetForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([
      {
        id: "1",
        question: "",
        choices: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
      },
    ]);
    setCurrentQuestionIndex(0);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([
      {
        id: "1",
        question: "",
        choices: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
      },
    ]);
    setCurrentQuestionIndex(0);
    setNextId(2);
    setModalVisible(false);
  };

  const generateUUIDv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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
          <Text className="text-3xl font-semibold text-titlegray mb-2">
            Create Quiz
          </Text>
          <Text className="text-lg text-subtitlegray mb-4">
            Create a multiple choice quiz for your students!
          </Text>
          <View style={{ flex: 1 }}>
            {/* Quiz Title */}
            <TextInput
              placeholder="Quiz Title"
              value={quizTitle}
              onChangeText={setQuizTitle}
              onFocus={() => handleFocus("title")}
              onBlur={() => handleBlur("title")}
              multiline={false}
              className={`rounded-lg p-3 mb-4 border ${
                focusedFields["title"] ? "border-primary" : "border-gray-300"
              }`}
            />

            {/* Quiz Description */}
            <TextInput
              placeholder="Quiz Description (Optional)"
              value={quizDescription}
              onChangeText={setQuizDescription}
              numberOfLines={2}
              textAlignVertical="top"
              multiline={false}
              onFocus={() => handleFocus("description")}
              onBlur={() => handleBlur("description")}
              className={`rounded-lg p-3 mb-6 text-left text-base border ${
                focusedFields["description"]
                  ? "border-primary"
                  : "border-gray-300"
              }`}
            />

            {/* Question Navigation Slider */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-titlegray">
                  Questions ({questions.length})
                </Text>
                <TouchableOpacity
                  onPress={addQuestion}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                >
                  <Text className="text-blue-600 font-medium">
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
                        className={`text-sm font-medium ${
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
                            <Text className="text-lg font-semibold text-titlegray">
                              Question {index + 1}
                            </Text>
                            {questions.length > 1 && (
                              <TouchableOpacity
                                onPress={() => removeQuestion(question.id)}
                                className="bg-red-100 px-3 py-1 rounded"
                              >
                                <Text className="text-red-600 font-medium">
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
                            multiline={false}
                            textAlignVertical="top"
                            onFocus={() =>
                              handleFocus(`question-${question.id}`)
                            }
                            onBlur={() => handleBlur(`question-${question.id}`)}
                            className={`rounded-lg p-3 mb-3 text-left text-base border bg-white ${
                              focusedFields[`question-${question.id}`]
                                ? "border-primary"
                                : "border-gray-300"
                            }`}
                          />

                          {/* Video URL Input */}
                          <View className="mb-3">
                            <Text className="text-base font-medium text-gray-700 mb-2">
                              Upload Video (Optional)
                            </Text>

                            {/* Upload Button */}
                            <TouchableOpacity
                              onPress={() => handleVideoUpload(index + 1)}
                              className="border py-2 px-4 rounded-lg mb-2"
                            >
                              <Text className="text-black text-center font-medium">
                                Upload Video
                              </Text>
                            </TouchableOpacity>

                            {/* Display Uploaded Path */}
                            {question.videoUrl ? (
                              <View>
                                <Text className="text-sm text-gray-600 italic">
                                  Path: {question.videoUrl}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => removeVideo(question.id)}
                                  className="mt-2 self-end"
                                >
                                  <Text className="text-red-600 font-medium">
                                    Clear Video
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : null}
                          </View>

                          {/* Choices */}
                          <Text className="text-base font-medium text-gray-700 mb-2">
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
                              <Text className="font-medium text-gray-700 w-6">
                                {choice}.
                              </Text>
                              <TextInput
                                placeholder={`Choice ${choice}`}
                                value={question.choices[choice]}
                                onChangeText={(text) =>
                                  updateChoice(question.id, choice, text)
                                }
                                onFocus={() =>
                                  handleFocus(`choice-${question.id}-${choice}`)
                                }
                                onBlur={() =>
                                  handleBlur(`choice-${question.id}-${choice}`)
                                }
                                className={`flex-1 ml-2 rounded-lg p-2 border bg-white ${
                                  focusedFields[
                                    `choice-${question.id}-${choice}`
                                  ]
                                    ? "border-primary"
                                    : "border-gray-300"
                                }`}
                              />
                            </View>
                          ))}

                          <Text className="text-sm text-gray-500 mt-2">
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
            <TouchableOpacity
              onPress={handleCancel}
              style={{ marginRight: 10 }}
            >
              <Text className="text-black font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!isFormValid()}
              onPress={handleCreateQuiz}
            >
              <Text
                className={`font-semibold text-base ${
                  isFormValid() ? "text-primary" : "text-gray-500"
                }`}
              >
                Create Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateQuizModal;
