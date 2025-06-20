import Beehive from "@/components/Beehive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import CreateQuizModal from "@/components/CreateMultipleChoice";
import CreateActionQuizModal from "@/components/CreateExecution";
import ExerciseDetails from "@/components/ExerciseDetails";
import ExerciseService from "../../../api/services/exercise-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ExerciseSkeleton from "@/components/skeletons/ExerciseSkeleton";

export default function Quizzes() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [createMultipleChoiceVisible, setCreateMultipleChoiceVisible] =
    useState(false);
  const [createExecutionVisible, setCreateExecutionVisible] = useState(false);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);
  const loadData = React.useCallback(() => {
    fetchExercises();
  }, []);

  useFocusEffect(loadData);

  const fetchExercises = async () => {
    setIsLoading(true);
    const response = await ExerciseService.getAllExercise(currentUser.id);

    if (response.success) {
      console.log(response.data);
      setQuizzes(response.data);
    } else {
      showToast(response.message, "error");
    }

    setIsLoading(false);
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
                }}
              >
                <Ionicons name="list-outline" size={20} color="#00BFAF" />
                <Text className="ml-2 text-gray-700 font-poppins-medium">
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
                <Text className="ml-2 text-gray-700 font-medium font-poppins">
                  Execution Type
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        {isLoading ? (
          <>
            {[...Array(4)].map((_, index) => (
              <ExerciseSkeleton key={index} />
            ))}
          </>
        ) : (
          quizzes.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-lg p-4 mx-4 mt-4 flex-row shadow-sm border border-gray-200"
              activeOpacity={0.9}
            >
              <View className="items-center justify-center">
                <Beehive percentage={100} isGeneral={true}></Beehive>
                <View className="items-center mt-2"></View>
              </View>

              <View className="flex-1 ml-4 justify-between">
                <View>
                  <Text className="text-lg font-poppins-medium mb-1">
                    {item.exerciseTitle}
                  </Text>
                  <Text className="text-sm text-gray-700 font-poppins-medium mb-1">
                    Type: {"null"}
                  </Text>
                  {/* Show question count for newly created quizzes */}
                  {item.exerciseItems && (
                    <Text className="text-xs text-gray-500 mb-2 font-poppins">
                      {item.exerciseItems.length} question
                      {item.exerciseItems.length !== 1 ? "s" : ""}
                    </Text>
                  )}
                  {/* Show description if available */}
                  {item.exerciseDescription && (
                    <Text
                      className="text-xs text-gray-600 mb-2 font-poppins"
                      numberOfLines={2}
                    >
                      {item.exerciseDescription}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-yellow-400 py-2 px-6 rounded-full self-start mb-2 w-full"
                  onPress={() => setSelectedQuiz(item.id)}
                >
                  <Text className="font-poppins-medium text-white text-center text-sm">
                    View Quiz
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        modalVisible={createMultipleChoiceVisible}
        setModalVisible={setCreateMultipleChoiceVisible}
        loadData={loadData}
      />

      <CreateActionQuizModal
        modalVisible={createExecutionVisible}
        setModalVisible={setCreateExecutionVisible}
        loadData={loadData}
      />

      <ExerciseDetails
        visible={selectedQuiz !== null}
        exerciseId={selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
      />
    </View>
  );
}
