import api from "../axios-config";

const RoadmapService = {
  updateLevel: async (userId, stage, level) => {
    try {
      const response = await api.post(`/roadmap/user/${userId}/edit-progress`, {
        stage: stage,
        level: level,
      });
      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      throw error;
    }
  },
  getLevel: async (userId) => {
    try {
      const response = await api.get(`/roadmap/user/${userId}/progress`);
      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      throw message;
    }
  },
};

export default RoadmapService;
