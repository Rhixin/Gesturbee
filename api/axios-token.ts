import AsyncStorage from "@react-native-async-storage/async-storage";

// Token storage using AsyncStorage for React Native
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

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem("refresh_token");
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  saveRefreshToken: async (refreshToken) => {
    try {
      await AsyncStorage.setItem("refresh_token", refreshToken);
    } catch (error) {
      console.error("Error saving refresh token:", error);
    }
  },

  removeRefreshToken: async () => {
    try {
      await AsyncStorage.removeItem("refresh_token");
    } catch (error) {
      console.error("Error removing refresh token:", error);
    }
  },
};

export default TokenService;
