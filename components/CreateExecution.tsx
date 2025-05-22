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
  selectedAction: string; 
  description?: string; 
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
  const [questions, setQuestions] = useState<ActionQuizQuestion[]>([
    {
      id: '1',
      questionNumber: 1,
      selectedAction: 'A',
      description: ''
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});
  const [nextId, setNextId] = useState<number>(2);

  const [dropdownStates, setDropdownStates] = useState<{[key: string]: boolean}>({ '1': false });
  
  const scrollViewRef = useRef<ScrollView>(null);

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

  const addQuestion = () => {
    const newQuestion: ActionQuizQuestion = {
      id: nextId.toString(),
      questionNumber: questions.length + 1,
      selectedAction: 'A',
      description: ''
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);

    // Update question numbers
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      questionNumber: index + 1
    }));
    setQuestions(updatedQuestions);

    setNextId(prev => prev + 1);
    
    // Initialize dropdown state for new question
    setDropdownStates(prev => ({ ...prev, [nextId.toString()]: false }));
    
    // Navigate to the new question
    const newIndex = updatedQuestions.length - 1;
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
      
      // Update question numbers after removal
      const updatedQuestions = newQuestions.map((q, index) => ({
        ...q,
        questionNumber: index + 1
      }));
      setQuestions(updatedQuestions);
      
      // Remove dropdown state for removed question
      setDropdownStates(prev => {
        const newStates = { ...prev };
        delete newStates[questionId];
        return newStates;
      });
      
      if (currentQuestionIndex >= updatedQuestions.length) {
        setCurrentQuestionIndex(updatedQuestions.length - 1);
      } else if (questionIndex <= currentQuestionIndex && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
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
      instructions: "Students will see a letter (A-Z) and must execute the corresponding sign language."
    };
    
    addNewQuiz(newQuiz);

    // Reset form
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([{
      id: '1',
      questionNumber: 1,
      selectedAction: 'A',
      description: ''
    }]);
    setCurrentQuestionIndex(0);
    setNextId(2);
    setDropdownStates({ '1': false });
    setModalVisible(false);
  };

  const handleCancel = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuestions([{
      id: '1',
      questionNumber: 1,
      selectedAction: 'A',
      description: ''
    }]);
    setCurrentQuestionIndex(0);
    setNextId(2);
    setDropdownStates({ '1': false });
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

          <Text className="text-3xl font-semibold text-titlegray mb-2">Create Execution Quiz</Text>
          <Text className="text-lg text-subtitlegray mb-4">
            Create an interactive quiz where AI announces letters and students perform actions!
          </Text>
          
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
                      <View style={{ maxHeight: 500 }}>
                        <View className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-semibold text-titlegray">
                              Question {question.questionNumber}
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
                          
                          <Text className="text-base font-medium text-gray-700 mb-3 mt-4">
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
                            placeholder={`Please execeute "${question.selectedAction}"`}
                            value={question.description}
                            onChangeText={(text) => updateDescription(question.id, text)}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            onFocus={() => handleFocus(`desc-${question.id}`)}
                            onBlur={() => handleBlur(`desc-${question.id}`)}
                            className={`rounded-lg p-3 border bg-white ${
                              focusedFields[`desc-${question.id}`] ? "border-primary" : "border-gray-300"
                            }`}
                          />
                          
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

export default CreateActionQuizModal;