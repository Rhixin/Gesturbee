// axios-auth.js

import api from "./axios-config";
import TokenService from "./axios-token";

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      console.log(response);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Remove token
      await TokenService.removeToken();

      // Remove auth header
      delete api.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  register: async (userData) => {
    try {
      // Make the API call to register endpoint
      const response = await api.post("/auth/register", userData);

      console.log("Succesful registration");
    } catch (error) {
      console.error("Registration error:", error);
      throw error; // Re-throw the error so the component can handle it
    }
  },

  // Other auth methods...
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
