import Beehive from "@/components/Beehive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateQuizModal from "@/components/CreateMultipleChoice"; 
import CreateActionQuizModal from "@/components/CreateExecution";
import QuizDetails from "@/components/QuizDetails";


export default function Quizzes() {
  const progress = 70;

  const beehiveImage = () => {
    return require("@/assets/images/progress70.png");
  };

  type QuizQuestion = {
    id: number;
    question: string;
    choices: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
  };
  
  type Quiz = {
    id: number;
    title: string;
    type: string;
    questions: QuizQuestion[];
    description: string;
    createdAt: string;
    questionCount: number;
  };
  
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);


  const [nextQuizId, setNextQuizId] = useState(1);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [createMultipleChoiceVisible, setCreateMultipleChoiceVisible] = useState(false);
  const [createExecutionVisible, setCreateExecutionVisible] = useState(false);

  
  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  

  // Function to handle adding new quiz
  const addNewQuiz = (newQuiz) => {
    const quizWithId = {
      id: nextQuizId,
      title: newQuiz.title,
      type: newQuiz.type || "General", 
      progress: 0,
      questions: newQuiz.questions,
      description: newQuiz.description,
      createdAt: newQuiz.createdAt,
      questionCount: newQuiz.questions?.length || 0 // Track number of questions
    };
    setQuizzes([...quizzes, quizWithId]);
    setNextQuizId(prev => prev + 1);
  };

  // Close dropdown when clicking outside (you might want to add this functionality)
  const handleOutsidePress = () => {
    if (dropdownVisible) {
      setDropdownVisible(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="px-6 pt-10 flex-row justify-between items-center z-50 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-titlegray">
          Quizzes
        </Text>

        <View className="relative">
          <TouchableOpacity
            onPress={toggleDropdown}
            className="bg-secondary w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>

          {dropdownVisible && (
            <View className="absolute top-12 right-0 bg-white shadow-md min-w-[150px] rounded-md z-50 border border-gray-100">
              <TouchableOpacity
                className="px-4 py-3 flex-row items-center border-b border-gray-100"
                onPress={() => {
                  setCreateMultipleChoiceVisible(true);
                  setDropdownVisible(false);
                }}>
                <Ionicons name="list-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-medium">
                  Multiple Choice
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 flex-row items-center"
                onPress={() => {
                  setCreateExecutionVisible(true);
                  setDropdownVisible(false);
                }}
              >
                <Ionicons name="play-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-medium">
                  Execution Type
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        {quizzes.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-lg p-4 mx-4 mt-4 flex-row shadow-sm border border-gray-200"
            activeOpacity={0.9}
          >
            <View className="items-center justify-center">
              <Beehive percentage={item.progress || progress} isGeneral={false}></Beehive>
              <View className="items-center mt-2">
              </View>
            </View>

            <View className="flex-1 ml-4 justify-between">
              <View>
                <Text className="text-lg font-poppins-medium mb-1">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-700 font-poppins-medium mb-1">
                  Type: {item.type}
                </Text>
                {/* Show question count for newly created quizzes */}
                {item.questionCount && (
                  <Text className="text-xs text-gray-500 mb-2">
                    {item.questionCount} question{item.questionCount !== 1 ? 's' : ''}
                  </Text>
                )}
                {/* Show description if available */}
                {item.description && (
                  <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>

            <TouchableOpacity
              className="bg-yellow-400 py-2 px-6 rounded-full self-start mb-2 w-full"
              onPress={() => setSelectedQuiz(item)}
            >
              <Text className="font-poppins-medium text-white text-center text-sm">
                View Quiz
              </Text>
            </TouchableOpacity>

            </View>
            </TouchableOpacity>
                    ))}
      </ScrollView>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        modalVisible={createMultipleChoiceVisible}
        setModalVisible={setCreateMultipleChoiceVisible}
        addNewQuiz={addNewQuiz}
      />


      <CreateActionQuizModal
        modalVisible={createExecutionVisible}
        setModalVisible={setCreateExecutionVisible}
        addNewQuiz={addNewQuiz}
      />

      <QuizDetails
        visible={selectedQuiz !== null}
        quiz={selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
      />

    </View>
  );
}