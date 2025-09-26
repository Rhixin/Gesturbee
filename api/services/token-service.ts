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
      await AsyncStorage.removeItem("current_user");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  // User data storage methods
  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem("current_user", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
    }
  },

  getUser: async () => {
    try {
      const userData = await AsyncStorage.getItem("current_user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem("current_user");
    } catch (error) {
      console.error("Error removing user:", error);
    }
  },
};

export default TokenService;
