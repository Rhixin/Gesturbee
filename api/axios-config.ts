import axios from "axios";
import TokenService from "./axios-token";
import AuthService from "./axios-auth";

// Create axios instance with custom config
const api = axios.create({
  baseURL: "https://api.example.com",
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

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshToken = await TokenService.getRefreshToken();
        if (!refreshToken) {
          // No refresh token, redirect to login
          await AuthService.logout();
          return Promise.reject(error);
        }

        // TODO: Backend ni Joshua diri para mokuha balik ug token
        const response = await axios.post(
          "https://api.example.com/auth/refresh",
          {
            refreshToken,
          }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        // Save the new tokens
        await TokenService.saveToken(token);
        await TokenService.saveRefreshToken(newRefreshToken);

        // Update the authorization header and retry the original request
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout the user
        await AuthService.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
