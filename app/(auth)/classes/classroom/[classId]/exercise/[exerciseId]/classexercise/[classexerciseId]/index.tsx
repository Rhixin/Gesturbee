import ExerciseService from "@/api/services/exercise-service";
import AnswerExecutionView from "@/components/exercises/AnswerExecutionView";
import AnswerMultipleChoiceView from "@/components/exercises/AnswerMultipleChoiceView";
import MultipleChoiceLesson from "@/components/lessons/MultipleChoiceLesson";
import ProgressBar from "@/components/Progressbar";
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
} from "react-native";

const ClassExercise = () => {
  const { exerciseId, classexercise } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [exercise, setExercise] = useState(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [answerForm, setAnswerForm] = useState(null);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  useEffect(() => {
    setAnswerForm(null);
  }, []);

  const setAnswerItem = (selectedAnswer) => {
    let newAnswerForm = answerForm;
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

        const signedUrls = await Promise.all(
          exerciseItems.map(async (item) => {
            // Check if presignedURL exists before using it
            if (!item?.presignedURL) {
              console.warn("Missing presignedURL for exercise item:", item);
              return null;
            }

            const signedUrlResponse = await ExerciseService.getVideoContent(
              item.presignedURL
            );

            if (!signedUrlResponse.success) {
              throw new Error("Failed fetching video content from AWS");
            }

            return signedUrlResponse.data;
          })
        );

        // Filter out null values
        setVideos(signedUrls.filter((url) => url !== null));
      }

      setExercise(response.data);
      console.log(response.data);
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
        </SafeAreaView>

        {isLoading && (
          <View className="flex-1 w-full p-4">
            <ExerciseSkeleton />
          </View>
        )}

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
              ></AnswerExecutionView>
            )}
          </View>
        )}

        {/* Navigation */}

        <View className="w-full flex-row items-center justify-center mb-8 px-6 space-x-4">
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
              onPress={() => {
                console.log(answerForm);
              }}
            >
              <Text className="text-white font-poppins-medium text-lg">
                Submit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

export default ClassExercise;
