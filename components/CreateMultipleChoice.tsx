import React, { useState, useRef } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Dimensions,
    SafeAreaView,
    ScrollView,
    Keyboard,
    TouchableOpacity
  } from 'react-native';


const { width: screenWidth } = Dimensions.get('window');

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
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface CreateQuizModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  addNewQuiz: (quiz: any) => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ 
  modalVisible, 
  setModalVisible, 
  addNewQuiz 
}) => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: '1',
      question: '',
      choices: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A'
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});
  
  const scrollViewRef = useRef<ScrollView>(null);

  const handleFocus = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: true }));
  };

  const handleBlur = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: false }));
  };

  const [nextId, setNextId] = useState<number>(2);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: nextId.toString(),
      question: '',
      choices: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A'
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);

    setNextId(prev => prev + 1);
    
    // Navigate to the new question
    const newIndex = newQuestions.length - 1;
    setCurrentQuestionIndex(newIndex);
    
    // Scroll to the new question
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: newIndex * (screenWidth - 80),
        animated: true
      });
    }, 100);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      const questionIndex = questions.findIndex(q => q.id === questionId);
      const newQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(newQuestions);
      
      if (currentQuestionIndex >= newQuestions.length) {
        setCurrentQuestionIndex(newQuestions.length - 1);
      } else if (questionIndex <= currentQuestionIndex && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateChoice = (questionId: string, choice: 'A' | 'B' | 'C' | 'D', value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, choices: { ...q.choices, [choice]: value } }
        : q
    ));
  };

  const updateCorrectAnswer = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, correctAnswer: answer } : q
    ));
  };

  const updateVideoUrl = (questionId: string, url: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, videoUrl: url } : q
    ));
  };

  const removeVideo = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, videoUrl: undefined } : q
    ));
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * (screenWidth - 80),
      animated: true
    });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / (screenWidth - 80));
    setCurrentQuestionIndex(currentIndex);
  };

  const isFormValid = () => {
    if (quizTitle.trim() === "") return false;
    
    return questions.every(q => 
      q.question.trim() !== "" &&
      Object.values(q.choices).every(choice => choice.trim() !== "")
    );
  };

  const handleCreateQuiz = () => {
    const newQuiz = {
      title: quizTitle,
      description: quizDescription,
      questions: questions,
      type: "Multiple Choice",
      createdAt: new Date().toISOString(),

    };
    
    addNewQuiz(newQuiz);
    setNextId(2); 

    // Reset form
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([{
      id: '1',
      question: '',
      choices: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A'
    }]);
    setCurrentQuestionIndex(0);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([{
      id: '1',
      question: '',
      choices: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A'
    }]);
    setCurrentQuestionIndex(0);
    setNextId(2); 
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }} className="justify-center items-center px-4">
        <View className="bg-white w-[80%] rounded-2xl p-6" style={{ maxHeight: '90%', minHeight: '80%' }}>
          <Text className="text-3xl font-semibold text-titlegray mb-2">Create Quiz</Text>
          <Text className="text-lg text-subtitlegray mb-4">Create a multiple choice quiz for your students!</Text>
          <View style={{ flex: 1 }}>
            {/* Quiz Title */}
            <TextInput
              placeholder="Quiz Title"
              value={quizTitle}
              onChangeText={setQuizTitle}
              onFocus={() => handleFocus('title')}
              onBlur={() => handleBlur('title')}
              multiline={false}
              className={`rounded-lg p-3 mb-4 border ${
                focusedFields['title'] ? "border-primary" : "border-gray-300"
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
              onFocus={() => handleFocus('description')}
              onBlur={() => handleBlur('description')}
              className={`rounded-lg p-3 mb-6 text-left text-base border ${
                focusedFields['description'] ? "border-primary" : "border-gray-300"
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
                  <Text className="text-blue-600 font-medium">+ Add Question</Text>
                </TouchableOpacity>
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
                    <View key={question.id} style={{ width: screenWidth - 60}} className="pr-2">
                      <View style={{ maxHeight: 500 }} >
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
                                <Text className="text-red-600 font-medium">Remove</Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Question Text */}
                          <TextInput
                            placeholder="Enter your question"
                            value={question.question}
                            onChangeText={(text) => updateQuestion(question.id, 'question', text)}
                            multiline={false}
                            textAlignVertical="top"
                            onFocus={() => handleFocus(`question-${question.id}`)}
                            onBlur={() => handleBlur(`question-${question.id}`)}
                            className={`rounded-lg p-3 mb-3 text-left text-base border bg-white ${
                              focusedFields[`question-${question.id}`] ? "border-primary" : "border-gray-300"
                            }`}
                          />

                          {/* Video URL Input */}
                          <View className="mb-3">
                            <Text className="text-base font-medium text-gray-700 mb-2">Video URL (Optional)</Text>
                            <TextInput
                              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                              value={question.videoUrl || ''}
                              multiline={false}
                              onChangeText={(text) => updateVideoUrl(question.id, text)}
                              onFocus={() => handleFocus(`video-${question.id}`)}
                              onBlur={() => handleBlur(`video-${question.id}`)}
                              className={`rounded-lg p-3 border bg-white ${
                                focusedFields[`video-${question.id}`] ? "border-primary" : "border-gray-300"
                              }`}
                            />
                            {question.videoUrl && (
                              <TouchableOpacity 
                                onPress={() => removeVideo(question.id)}
                                className="mt-2 self-end"
                              >
                                <Text className="text-red-600 font-medium">Clear Video</Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Choices */}
                          <Text className="text-base font-medium text-gray-700 mb-2">Answer Choices</Text>
                          {(['A', 'B', 'C', 'D'] as const).map((choice) => (
                            <View key={choice} className="flex-row items-center mb-2">
                              <TouchableOpacity
                                onPress={() => updateCorrectAnswer(question.id, choice)}
                                className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                                  question.correctAnswer === choice 
                                    ? 'border-primary bg-primary' 
                                    : 'border-gray-300'
                                }`}
                              >
                                {question.correctAnswer === choice && (
                                  <View className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </TouchableOpacity>
                              <Text className="font-medium text-gray-700 w-6">{choice}.</Text>
                              <TextInput
                                placeholder={`Choice ${choice}`}
                                value={question.choices[choice]}
                                onChangeText={(text) => updateChoice(question.id, choice, text)}
                                onFocus={() => handleFocus(`choice-${question.id}-${choice}`)}
                                onBlur={() => handleBlur(`choice-${question.id}-${choice}`)}
                                className={`flex-1 ml-2 rounded-lg p-2 border bg-white ${
                                  focusedFields[`choice-${question.id}-${choice}`] ? "border-primary" : "border-gray-300"
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
              <Text className={`font-semibold text-base ${isFormValid() ? "text-primary" : "text-gray-500"}`}>
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