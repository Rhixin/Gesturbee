// axios-auth.js

import api from "./axios-config";
import TokenService from "./axios-token";

const AuthService = {
  login: async (username, password, showToast, navigate) => {
    try {
      // const response = await api.post("/auth/login", {
      //   email: username,
      //   password: password,
      // });

      // console.log(response);

      showToast("Logged in successfully!", "success");
      navigate("/(auth)/home");
    } catch (error) {
      const message = error.response.data.responseType;
      showToast(message, "error");
    }
  },

  register: async (userData, showToast, navigate) => {
    try {
      const response = await api.post("/auth/register", userData);

      showToast("Registered an account successfully!", "success");
      navigate("/");
    } catch (error) {
      showToast(error, "error");
      throw error;
    }
  },

  logout: async (showToast, navigate) => {
    try {
      // Remove token
      await TokenService.removeToken();

      // Remove auth header
      delete api.defaults.headers.common["Authorization"];

      showToast("Logged out successfully!", "success");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  isAuthenticated: async () => {
    const token = await TokenService.getToken();
    return !!token;
  },

  getCurrentUser: async () => {
    try {
      const token = await TokenService.getToken();

      if (!token) {
        return null;
      }

      // Make sure the authorization header is set
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // TODO: getCurrent User api ni joshua
      const response = await api.get("/user/profile");
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
};

export default AuthService;
