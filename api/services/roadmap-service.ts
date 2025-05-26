import api from "../axios-config";
import Level from "../../app/(auth)/home/stage/[stageId]/level/[levelId]";

const RoadmapService = {
  updateLevel: async (userId, stage, level) => {
    try {
      const response = await api.patch(
        `/roadmap/user/${userId}/edit-progress`,
        {
          stage: stage,
          level: level,
        }
      );
      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      throw error;
    }
  },
  getLevel: async (userId) => {
    try {
      const response = await api.get(`/roadmap/user/${userId}/progress`);
      const responseData = response.data.data;
      return {
        success: true,
        data: { stage: responseData.stage, level: responseData.level },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.responseType ||
          "Error fetching roadmap progress",
        data: null,
      };
    }
  },
};

export default RoadmapService;
