import axios from "axios";
import TokenService from "./axios-token";
import AuthService from "./axios-auth";

// Create axios instance with custom config
const api = axios.create({
  baseURL: "https://localhost:7152/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenService.getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If error is 401 (Unauthorized), redirect to login
    if (error.response?.status === 401) {
      // Log the user out when token is invalid or expired
      await AuthService.logout();

      // You might want to add navigation to login page here
      // This depends on your navigation setup
      // If using expo-router, you might need to import and use the router here

      // Or set a global auth state that triggers navigation elsewhere
    }

    return Promise.reject(error);
  }
);

export default api;
