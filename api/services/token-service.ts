// axios-token.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const TokenService = {
  getToken: async () => {
    try {
      return await AsyncStorage.getItem("access_token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  saveToken: async (token) => {
    try {
      await AsyncStorage.setItem("access_token", token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem("access_token");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },
};

export default TokenService;
