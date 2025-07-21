import ClassRoomService from "@/api/services/classroom-service";
import ExerciseService from "@/api/services/exercise-service";
import AnswerExecutionView from "@/components/exercise/exercises/AnswerExecutionView";
import AnswerMultipleChoiceView from "@/components/exercise/exercises/AnswerMultipleChoiceView";
import MultipleChoiceLesson from "@/components/lessons/MultipleChoiceLesson";
import ProgressBar from "@/components/common/Progressbar";
import ExerciseDetailsSkeleton from "@/components/skeletons/ExerciseDetailsSkeleton";
import ExerciseSkeleton from "@/components/skeletons/ExerciseSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import React, { useEffect, useState } from "react";
import {
  View,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";

const ClassExercise = () => {
  const { exerciseId, classexerciseId } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [exercise, setExercise] = useState(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [answerForm, setAnswerForm] = useState(null);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmitStudentAnswers = async () => {
    if (!answerForm) {
      showToast(`Please Answer All Items`, "warning");
      return;
    }

    // For multiple choice exercises, require all answers
    if (exercise?.exerciseType === "MultipleChoice") {
      for (let i = 0; i < answerForm.length; i++) {
        if (answerForm[i] === null) {
          showToast(`Please Answer All Items`, "warning");
          return;
        }
      }
    }

    setIsSubmitting(true);

    // For execution exercises, only send answered questions
    let answersToSubmit;
    if (exercise?.exerciseType === "Base") {
      // Filter out null answers and format for API
      // Execution exercises store answers as strings directly
      answersToSubmit = answerForm
        .map((answer, index) => ({
          itemNumber: index + 1,
          answer: answer
        }))
        .filter(item => item.answer !== null);
    } else {
      // For multiple choice, send all answers as before
      // Multiple choice stores answers as objects with .answer property
      answersToSubmit = answerForm.map((answerObj, index) => ({
        itemNumber: index + 1,
        answer: answerObj?.answer
      }));
    }

    const response = await ClassRoomService.submitStudentClassExerciseAnswers(
      currentUser.id,
      classexerciseId,
      answersToSubmit
    );

    if (response.success) {
      showToast(response.message, "success");
      goBack();
    } else {
      showToast(response.message, "error");
    }

    setIsSubmitting(false);

    return response.data;
  };

  const setAnswerItem = (selectedAnswer) => {
    const newAnswerForm = [...answerForm];
    newAnswerForm[currentViewIndex] = selectedAnswer;

    console.log(newAnswerForm);

    setAnswerForm(newAnswerForm);
  };

  const fetchExerciseDetails = async () => {
    setIsLoading(true);
    try {
      const response = await ExerciseService.getSpecificExercise(exerciseId);

      const nullArray = Array(response.data.exerciseItems.length).fill(null);
      setAnswerForm(nullArray);

      if (!response.success) {
        throw Error(response.message);
      }

      // Only process videos if exercise type is MultipleChoice and exerciseItems exist
      if (
        response.data?.exerciseType === "MultipleChoice" &&
        response.data?.exerciseItems
      ) {
        const exerciseItems = response.data.exerciseItems;

        setVideos(exerciseItems.map((item) => item.presignedURL));
      }

      setExercise(response.data);
    } catch (error) {
      showToast(error?.message || "An error occurred", "error");
      goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseDetails();
  }, []);

  return (
    <>
      <View className="bg-white h-[100vh] items-center">
        <StatusBar style="light" />
        <SafeAreaView className="bg-secondary rounded-b-3xl w-full">
          <TouchableOpacity className="px-8" onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color={"white"} />
          </TouchableOpacity>

          <View className="rounded-2xl w-full px-4 items-center">
            <View className="bg-white px-6 rounded-2xl">
              {isLoading ? (
                <Text className="font-poppins-medium text-black text-xl">
                  Loading...
                </Text>
              ) : (
                exercise?.exerciseTitle && (
                  <Text className="font-poppins-medium text-black text-xl">
                    {exercise.exerciseTitle}
                  </Text>
                )
              )}
            </View>
            <View className="my-4">
              {isLoading ? (
                <View className="h-8 bg-gray-300 rounded-md w-64" />
              ) : (
                exercise?.exerciseDescription && (
                  <Text className="text-white text-lg font-poppins-medium">
                    {exercise.exerciseDescription}
                  </Text>
                )
              )}
            </View>
          </View>

          {/* Progress Bar */}
          {!isLoading && exercise && (
            <View className="w-full flex items-center mb-4">
              <View className="items-center flex justify-center w-[70%]">
                <ProgressBar
                  percent={((currentViewIndex + 1) / exercise.exerciseItems.length) * 100}
                  backgroundColor="bg-white"
                  fillColor="bg-darkhoney"
                />
              </View>
            </View>
          )}
        </SafeAreaView>

        {isLoading && (
          <View className="flex-1 w-full p-4">
            <ExerciseSkeleton />
          </View>
        )}

        {/* Exercise content and navigation - adjust height to account for progress bar */}
        <View className="flex-1 w-full" style={{ maxHeight: '65%' }}>
          {/* Render exercise content only when loaded and not null */}
          {!isLoading && exercise && (
            <View className="flex-1 w-full p-4">
              {exercise.exerciseType == "MultipleChoice" ? (
                <AnswerMultipleChoiceView
                  item={{
                    ...exercise.exerciseItems[currentViewIndex],
                    video: videos[currentViewIndex],
                  }}
                  setAnswerItem={setAnswerItem}
                  answerForm={answerForm}
                  currentViewIndex={currentViewIndex}
                ></AnswerMultipleChoiceView>
              ) : (
                <AnswerExecutionView
                  item={exercise.exerciseItems[currentViewIndex]}
                  setAnswerItem={setAnswerItem}
                  answerForm={answerForm}
                  currentViewIndex={currentViewIndex}
                />
              )}
            </View>
          )}

          {/* Navigation - always at bottom */}
          <View className="w-full flex-row items-center justify-center mt-4 mb-8 px-6 space-x-4">
          {currentViewIndex !== 0 && (
            <TouchableOpacity
              className="bg-gray-300 px-6 py-3 rounded-full"
              onPress={() => {
                setCurrentViewIndex(currentViewIndex - 1);
              }}
            >
              <Text className="font-poppins-medium text-lg text-gray-500">
                Previous
              </Text>
            </TouchableOpacity>
          )}

          {!isLoading &&
          currentViewIndex !== exercise?.exerciseItems.length - 1 ? (
            <TouchableOpacity
              className={`px-6 py-3 rounded-full flex-row items-center justify-center space-x-2 bg-secondary`}
              onPress={() => {
                setCurrentViewIndex(currentViewIndex + 1);
              }}
            >
              <Text className="text-white font-poppins-medium text-lg">
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`px-6 py-3 rounded-full flex-row items-center justify-center space-x-2 bg-secondary`}
              onPress={fetchSubmitStudentAnswers}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#ef4444"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-poppins-medium text-lg">
                    Submitting
                  </Text>
                </>
              ) : (
                <Text className="text-white font-poppins-medium text-lg">
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        </View>
      </View>
    </>
  );
};

export default ClassExercise;
