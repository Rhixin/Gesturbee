import api from "./axios-config";
import TokenService from "./axios-token";

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { token, refreshToken, user } = response.data;

      // Save tokens
      await TokenService.saveToken(token);
      await TokenService.saveRefreshToken(refreshToken);

      // Set auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Optional: Call logout endpoint if your API has one
      // await api.post('/auth/logout');

      // Remove tokens
      await TokenService.removeToken();
      await TokenService.removeRefreshToken();

      // Remove auth header
      delete api.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  register: async (userData) => {
    return api.post("/auth/register", userData);
  },

  getCurrentUser: async () => {
    try {
      const token = await TokenService.getToken();
      if (!token) {
        return null;
      }

      return api.get("/auth/user");
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  isAuthenticated: async () => {
    const token = await TokenService.getToken();
    return !!token;
  },
};

export default AuthService;
