import Beehive from "@/components/animations/Beehive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import CreateQuizModal from "@/components/exercise/CreateMultipleChoice";
import CreateActionQuizModal from "@/components/exercise/CreateExecution";
import ExerciseDetails from "@/components/exercise/ExerciseDetails";
import ExerciseService from "../../../api/services/exercise-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ExerciseSkeleton from "@/components/skeletons/ExerciseSkeleton";

export default function Quizzes() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const formatExerciseType = (type) => {
    switch (type) {
      case "MultipleChoice":
        return { label: "Multiple Choice", color: "bg-blue-100 text-blue-700", icon: "list" };
      case "Execution":
        return { label: "Execution Type", color: "bg-green-100 text-green-700", icon: "play" };
      default:
        // Default fallback
        return { label: "Multiple Choice", color: "bg-blue-100 text-blue-700", icon: "list" };
    }
  };

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
          Exercises
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8, flexGrow: 1 }}>
        {isLoading ? (
          <>
            {[...Array(4)].map((_, index) => (
              <ExerciseSkeleton key={index} />
            ))}
          </>
        ) : quizzes && quizzes.length > 0 ? (
          quizzes.map((item) => {
            const typeInfo = formatExerciseType(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                className="bg-white rounded-xl p-5 mx-4 mt-4 shadow-lg border border-gray-100"
                activeOpacity={0.95}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View className="flex-row">
                  {/* Left side - Beehive */}
                  <View className="items-center justify-center mr-4">
                    <Beehive percentage={100} isGeneral={true} />
                  </View>

                  {/* Right side - Content */}
                  <View className="flex-1">
                    {/* Header with title and type badge */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-xl font-poppins-bold text-gray-800 mb-2">
                          {item.exerciseTitle}
                        </Text>
                        
                        {/* Type badge */}
                        <View className="flex-row items-center mb-2">
                          <View className={`flex-row items-center px-3 py-1 rounded-full ${typeInfo.color}`}>
                            <Ionicons 
                              name={typeInfo.icon} 
                              size={14} 
                              color={typeInfo.color.includes('blue') ? '#1d4ed8' : 
                                     typeInfo.color.includes('green') ? '#047857' : '#374151'} 
                              style={{ marginRight: 4 }}
                            />
                            <Text className={`text-xs font-poppins-medium ${typeInfo.color.split(' ')[1]}`}>
                              {typeInfo.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Exercise details */}
                    <View className="mb-3">
                      {/* Question count */}
                      {item.exerciseItems && (
                        <View className="flex-row items-center mb-2">
                          <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
                          <Text className="text-sm text-gray-600 font-poppins ml-2">
                            {item.exerciseItems.length} question{item.exerciseItems.length !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      )}
                      
                      {/* Description */}
                      {item.exerciseDescription && (
                        <View className="flex-row items-start">
                          <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={{ marginTop: 2 }} />
                          <Text
                            className="text-sm text-gray-600 font-poppins ml-2 flex-1"
                            numberOfLines={2}
                          >
                            {item.exerciseDescription}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action button */}
                    <TouchableOpacity
                      className="py-3 px-6 rounded-xl flex-row items-center justify-center"
                      onPress={() => setSelectedQuiz(item.id)}
                      style={{
                        backgroundColor: '#FBBC05',
                        shadowColor: '#FBBC05',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <Text className="font-poppins-bold text-white text-center text-sm">
                        View Exercise
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 justify-center items-center px-6" style={{ minHeight: 400 }}>
            <Ionicons name="document-text-outline" size={48} color="#00BFAF" />
            <Text className="mt-4 text-gray-800 font-poppins-medium text-center text-lg">
              No exercises created yet
            </Text>
            <Text className="mt-2 text-gray-600 text-center">
              Create your first exercise to get started
            </Text>
          </View>
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
        isTeacher={true}
      />
    </View>
  );
}
