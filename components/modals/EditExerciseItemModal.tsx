import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useToast } from "@/context/ToastContext";
import ExerciseService from "@/api/services/exercise-service";

interface EditExerciseItemModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  exerciseItem: any;
  onItemUpdated: () => void;
}

const EditExerciseItemModal: React.FC<EditExerciseItemModalProps> = ({
  modalVisible,
  setModalVisible,
  exerciseItem,
  onItemUpdated,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ExerciseItemId: 0,
    ItemNumber: 0,
    Question: "",
    ChoiceA: "",
    ChoiceB: "",
    ChoiceC: "",
    ChoiceD: "",
    CorrectAnswer: "",
  });

  useEffect(() => {
    if (modalVisible && exerciseItem && typeof exerciseItem === 'object') {
      console.log("Exercise item data:", exerciseItem);
      console.log("Available properties:", Object.keys(exerciseItem));
      
      // Reset form data to ensure we start fresh - try multiple possible property names
      const itemId = exerciseItem?.id || exerciseItem?.Id || exerciseItem?.exerciseItemId || exerciseItem?.ExerciseItemId || 0;
      const itemNumber = exerciseItem?.itemNumber || exerciseItem?.ItemNumber || 0;
      const question = exerciseItem?.question || exerciseItem?.Question || "";
      const choiceA = exerciseItem?.choiceA || exerciseItem?.ChoiceA || "";
      const choiceB = exerciseItem?.choiceB || exerciseItem?.ChoiceB || "";
      const choiceC = exerciseItem?.choiceC || exerciseItem?.ChoiceC || "";
      const choiceD = exerciseItem?.choiceD || exerciseItem?.ChoiceD || "";
      const correctAnswer = exerciseItem?.correctAnswer || exerciseItem?.CorrectAnswer || "";
      
      console.log("Mapped values:", {
        itemId, itemNumber, question, choiceA, choiceB, choiceC, choiceD, correctAnswer
      });
      
      setFormData({
        ExerciseItemId: itemId,
        ItemNumber: itemNumber,
        Question: question,
        ChoiceA: choiceA,
        ChoiceB: choiceB,
        ChoiceC: choiceC,
        ChoiceD: choiceD,
        CorrectAnswer: correctAnswer,
      });
    } else if (modalVisible) {
      console.log("Modal visible but exerciseItem is:", exerciseItem);
    }
  }, [exerciseItem, modalVisible]);

  const handleSave = async () => {
    if (!formData?.ExerciseItemId || formData.ExerciseItemId === 0) {
      showToast("Cannot edit: Exercise item ID is missing", "error");
      console.error("ExerciseItemId is missing or 0:", formData.ExerciseItemId);
      return;
    }

    if (!formData?.Question?.trim()) {
      showToast("Please enter a question", "error");
      return;
    }

    if (
      !formData?.ChoiceA?.trim() ||
      !formData?.ChoiceB?.trim() ||
      !formData?.ChoiceC?.trim() ||
      !formData?.ChoiceD?.trim()
    ) {
      showToast("Please fill in all answer choices", "error");
      return;
    }

    if (!formData?.CorrectAnswer?.trim()) {
      showToast("Please select the correct answer", "error");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending form data:", formData);
      const response = await ExerciseService.editExerciseItem(formData);

      if (response?.success) {
        showToast("Exercise item updated successfully", "success");
        setModalVisible(false);
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        showToast(response?.message || "Failed to update item", "error");
      }
    } catch (error) {
      showToast("Failed to update exercise item", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  if (!modalVisible) {
    return null;
  }

  if (!exerciseItem) {
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
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg text-center">No exercise item data available</Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-lg mt-4"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCancel}
    >
      <SafeAreaView
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }}
        className="justify-center items-center px-4"
      >
        <View
          className="bg-white w-full rounded-2xl p-6"
          style={{ maxHeight: "90%" }}
        >
          <Text className="text-2xl font-poppins-bold text-gray-800 mb-6">
            Edit Exercise Item
          </Text>

          {/* Question */}
          <View className="mb-4">
            <Text className="text-base font-poppins-medium text-gray-700 mb-2">
              Question
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base font-poppins"
              placeholder="Enter the question"
              value={formData.Question}
              onChangeText={(text) =>
                setFormData({ ...formData, Question: text })
              }
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Answer Choices */}
          <View className="mb-4">
            <Text className="text-base font-poppins-medium text-gray-700 mb-2">
              Answer Choices
            </Text>
            
            <View className="mb-2">
              <Text className="text-sm text-gray-600 mb-1">A.</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base font-poppins"
                placeholder="Choice A"
                value={formData.ChoiceA}
                onChangeText={(text) =>
                  setFormData({ ...formData, ChoiceA: text })
                }
              />
            </View>

            <View className="mb-2">
              <Text className="text-sm text-gray-600 mb-1">B.</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base font-poppins"
                placeholder="Choice B"
                value={formData.ChoiceB}
                onChangeText={(text) =>
                  setFormData({ ...formData, ChoiceB: text })
                }
              />
            </View>

            <View className="mb-2">
              <Text className="text-sm text-gray-600 mb-1">C.</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base font-poppins"
                placeholder="Choice C"
                value={formData.ChoiceC}
                onChangeText={(text) =>
                  setFormData({ ...formData, ChoiceC: text })
                }
              />
            </View>

            <View className="mb-2">
              <Text className="text-sm text-gray-600 mb-1">D.</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base font-poppins"
                placeholder="Choice D"
                value={formData.ChoiceD || ""}
                onChangeText={(text) =>
                  setFormData({ ...formData, ChoiceD: text })
                }
              />
            </View>
          </View>

          {/* Correct Answer */}
          <View className="mb-6">
            <Text className="text-base font-poppins-medium text-gray-700 mb-2">
              Correct Answer
            </Text>
            <View className="flex-row flex-wrap">
              {["A", "B", "C", "D"].map((choice) => (
                <TouchableOpacity
                  key={choice}
                  className={`border rounded-lg p-3 mr-2 mb-2 ${
                    formData.CorrectAnswer === choice
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                  onPress={() =>
                    setFormData({ ...formData, CorrectAnswer: choice })
                  }
                >
                  <Text
                    className={`font-poppins-medium ${
                      formData.CorrectAnswer === choice
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-end">
            <TouchableOpacity
              className="px-6 py-3 mr-3"
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text className="text-gray-600 font-poppins-medium text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading && (
                <ActivityIndicator size="small" color="white" className="mr-2" />
              )}
              <Text className="text-white font-poppins-medium text-base">
                {isLoading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default EditExerciseItemModal;