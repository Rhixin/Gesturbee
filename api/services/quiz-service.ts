import api from "../axios-config";

const QuizService = {
  createQuiz: async () => {
    try {
      const response = await api.post("/roadmap/exercise/create-exercise", {
        teacherId: 1,
        exerciseTitle: "Basic ASL Greetings",
        exerciseDescription:
          "An introductory exercise to help students learn basic American Sign Language greetings.",
        exerciseItems: [],
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.responseType || "Error creating an Exercise",
        data: null,
      };
    }
  },
};

export default QuizService;
