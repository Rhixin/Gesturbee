import { Picker } from "@react-native-picker/picker";
import React, { useState, useRef } from "react";
import DropDownPicker from 'react-native-dropdown-picker';

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
    TouchableOpacity,
    Alert
  } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ActionQuizQuestion {
  id: string;
  questionNumber: number;
  selectedAction: string; // A-Z
  description?: string; // Optional description of what the action means
}

interface CreateActionQuizModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  addNewQuiz: (quiz: any) => void;
}

const CreateActionQuizModal: React.FC<CreateActionQuizModalProps> = ({ 
  modalVisible, 
  setModalVisible, 
  addNewQuiz 
}) => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState<string>("5");
  const [questions, setQuestions] = useState<ActionQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});
  const [isQuestionsGenerated, setIsQuestionsGenerated] = useState(false);

  // Separate dropdown states for each question
  const [dropdownStates, setDropdownStates] = useState<{[key: string]: boolean}>({});
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate alphabet options A-Z
  const alphabetOptions = Array.from({ length: 26 }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  const items = alphabetOptions.map(letter => ({ label: letter, value: letter }));

  const handleFocus = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: true }));
  };

  const handleBlur = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: false }));
  };

  const generateQuestions = () => {
    const numQuestions = parseInt(numberOfQuestions);
    if (numQuestions < 1 || numQuestions > 50) {
      Alert.alert("Invalid Number", "Please enter a number between 1 and 50");
      return;
    }

    const newQuestions: ActionQuizQuestion[] = Array.from({ length: numQuestions }, (_, index) => ({
      id: (index + 1).toString(),
      questionNumber: index + 1,
      selectedAction: 'A', // Default to A
      description: ''
    }));

    setQuestions(newQuestions);
    setIsQuestionsGenerated(true);
    setCurrentQuestionIndex(0);
    
    // Initialize dropdown states for each question
    const initialDropdownStates: {[key: string]: boolean} = {};
    newQuestions.forEach(q => {
      initialDropdownStates[q.id] = false;
    });
    setDropdownStates(initialDropdownStates);
  };

  const updateSelectedAction = (questionId: string, action: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, selectedAction: action } : q
    ));
  };

  const updateDescription = (questionId: string, description: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, description: description } : q
    ));
  };

  const setDropdownOpen = (questionId: string, isOpen: boolean) => {
    setDropdownStates(prev => ({ ...prev, [questionId]: isOpen }));
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
    if (!isQuestionsGenerated) return false;
    
    return questions.every(q => q.selectedAction !== "");
  };

  const handleCreateQuiz = () => {
    const newQuiz = {
      title: quizTitle,
      description: quizDescription,
      type: "Execution Quiz",
      numberOfQuestions: questions.length,
      questions: questions,
      createdAt: new Date().toISOString(),
      instructions: "Students will hear an AI announce a letter (A-Z) and must perform the corresponding action."
    };
    
    addNewQuiz(newQuiz);

    // Reset form
    setQuizTitle("");
    setQuizDescription("");
    setNumberOfQuestions("5");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setIsQuestionsGenerated(false);
    setDropdownStates({});
    setModalVisible(false);
  };

  const handleCancel = () => {
    setQuizTitle("");
    setQuizDescription("");
    setNumberOfQuestions("5");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setIsQuestionsGenerated(false);
    setDropdownStates({});
    setModalVisible(false);
  };

  const regenerateQuestions = () => {
    setIsQuestionsGenerated(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setDropdownStates({});
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }} className="justify-center items-center px-4">
        <View className="bg-white w-[85%] rounded-2xl p-6" style={{ maxHeight: '90%', minHeight: '80%' }}>
          <Text className="text-3xl font-semibold text-titlegray mb-2">Create Execution Quiz</Text>
          <Text className="text-lg text-subtitlegray mb-4">
            Create an interactive quiz where AI announces letters and students perform actions!
          </Text>
          
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
              multiline={true}
              onFocus={() => handleFocus('description')}
              onBlur={() => handleBlur('description')}
              className={`rounded-lg p-3 mb-4 text-left text-base border ${
                focusedFields['description'] ? "border-primary" : "border-gray-300"
              }`}
            />

            {/* Number of Questions Input */}
            {!isQuestionsGenerated && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-titlegray mb-2">
                  Number of Questions
                </Text>
                <View className="flex-row items-center mb-4">
                  <TextInput
                    placeholder="Enter number (1-50)"
                    value={numberOfQuestions}
                    onChangeText={setNumberOfQuestions}
                    keyboardType="numeric"
                    onFocus={() => handleFocus('numQuestions')}
                    onBlur={() => handleBlur('numQuestions')}
                    className={`flex-1 rounded-lg p-3 mr-3 border ${
                      focusedFields['numQuestions'] ? "border-primary" : "border-gray-300"
                    }`}
                  />
                  <TouchableOpacity
                    onPress={generateQuestions}
                    className="bg-primary rounded-lg px-6 py-3"
                  >
                    <Text className="text-white font-semibold">Generate</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-gray-500">
                  AI will randomly announce letters for each question during the quiz
                </Text>
              </View>
            )}

            {/* Questions Configuration */}
            {isQuestionsGenerated && (
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-titlegray">
                    Questions ({questions.length} questions)
                  </Text>
                  <TouchableOpacity
                    onPress={regenerateQuestions}
                    className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <Text className="text-gray-600 font-medium">Regenerate</Text>
                  </TouchableOpacity>
                </View>

                {/* Question Navigation Dots */}
                <View className="flex-row justify-center mb-4">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {questions.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => navigateToQuestion(index)}
                        className={`w-10 h-10 rounded-full mx-1 items-center justify-center ${
                          index === currentQuestionIndex ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <Text className={`text-sm font-medium ${
                          index === currentQuestionIndex ? 'text-white' : 'text-gray-600'
                        }`}>
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
                    style={{ flex: 1 }}
                  >
                    {questions.map((question, index) => (
                      <View key={question.id} style={{ width: screenWidth-50}}>
                        <View className="p-4 border border-gray-200 rounded-lg bg-gray-50" style={{ minHeight: 300 }}>
                          <Text className="text-xl font-semibold text-titlegray mb-4">
                            Question {question.questionNumber}
                          </Text>
                          
                          <Text className="text-base font-medium text-gray-700 mb-3">
                            Select Letter
                          </Text>
                          
                          {/* Letter Selection Dropdown */}
                          <View style={{ zIndex: 1000 - index, marginBottom: 20 }}>
                            <DropDownPicker
                              open={dropdownStates[question.id] || false}
                              value={question.selectedAction}
                              items={items}
                              setOpen={(open) => setDropdownOpen(question.id, open)}
                              setValue={(callback) => {
                                const value = typeof callback === 'function' ? callback(question.selectedAction) : callback;
                                updateSelectedAction(question.id, value);
                              }}
                              setItems={() => {}}
                              style={{ borderColor: '#d1d5db', borderRadius: 8 }}
                              dropDownContainerStyle={{ borderColor: '#d1d5db', borderRadius: 8 }}
                              listMode="SCROLLVIEW"
                            />
                          </View>

                          <Text className="text-sm text-gray-600 mb-3">
                            Selected: <Text className="font-semibold text-primary text-lg">{question.selectedAction}</Text>
                          </Text>

                          {/* Optional Action Description */}
                          <Text className="text-base font-medium text-gray-700 mb-2">
                            Action Description (Optional)
                          </Text>
                          <TextInput
                            placeholder={`Execute "${question.selectedAction}"`}
                            value={question.description}
                            onChangeText={(text) => updateDescription(question.id, text)}
                            multiline={true}
                            numberOfLines={3}
                            textAlignVertical="top"
                            onFocus={() => handleFocus(`desc-${question.id}`)}
                            onBlur={() => handleBlur(`desc-${question.id}`)}
                            className={`rounded-lg p-3 border bg-white ${
                              focusedFields[`desc-${question.id}`] ? "border-primary" : "border-gray-300"
                            }`}
                          />
                          
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </ScrollView>

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

export default CreateActionQuizModal;