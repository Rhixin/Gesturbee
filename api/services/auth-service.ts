import api from "../axios-config";
import TokenService from "./token-service";
import RoadmapService from "./roadmap-service";

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        email: username,
        password: password,
      });

      return {
        success: true,
        data: response.data.response.data,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.responseType || "Error Logging In",
        data: null,
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.responseType || "Error Registering an Account",
        data: null,
      };
    }
  },

  changeProfile: async (userData) => {
    try {
      console.log('📤 Sending profile update to backend:', userData);
      const response = await api.post("/profile/edit-profile", userData);
      console.log('📥 Backend response:', response.data);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ Profile update API error:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.response?.data?.responseType || error.message);
      
      return {
        success: false,
        error:
          error.response?.data?.responseType || "Error Changing User Details",
        data: null,
      };
    }
  },

  logout: async () => {
    try {
      await TokenService.removeToken(); // This also removes user data now
      delete api.defaults.headers.common["Authorization"];

      return {
        success: true,
        data: null,
        message: "Successfully Logged Out",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error Logging Out",
        data: null,
      };
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

      // Set the authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Get stored user data from AsyncStorage
      const userData = await TokenService.getUser();

      if (userData) {
        return {
          data: userData
        };
      }

      // If no stored user data, return null to indicate user needs to login again
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      await TokenService.removeToken(); // Remove invalid token
      delete api.defaults.headers.common["Authorization"];
      return null;
    }
  },

  // Google OAuth login
  googleLogin: async (idToken) => {
    try {
      const response = await api.post("/auth/external-login/google", {
        idToken: idToken,
      });

      return {
        token: response.data.token,
        user: response.data.response.data,
      };
    } catch (error) {
      console.error("Google login API error:", error);
      throw error;
    }
  },

  // Facebook OAuth login
  facebookLogin: async (accessToken) => {
    try {
      const response = await api.post("/auth/external-login/facebook", {
        accessToken: accessToken,
      });

      return {
        token: response.data.token,
        user: response.data.response.data,
      };
    } catch (error) {
      console.error("Facebook login API error:", error);
      throw error;
    }
  },

  handleSuccessfulAuth: async (
    user,
    token,
    setCurrentUser,
    initializeLevel,
    router,
    showToast
  ) => {
    try {
      await TokenService.saveToken(token);
      await TokenService.saveUser(user); // Save user data to AsyncStorage
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setCurrentUser(user);

      const progressResponse = await RoadmapService.getLevel(user.id);

      // Only proceed if progress data was successfully fetched
      if (progressResponse.success) {
        initializeLevel(
          user.id,
          progressResponse.data.stage,
          progressResponse.data.level
        );
      } else {
        throw new Error("Failed to load user progress data");
      }

      // Navigate to home only after everything succeeds
      router.replace("/(auth)/home");
      showToast("Logged in successfully!", "success");
    } catch (error) {
      console.error("Error in authentication flow:", error);

      // Clear any saved data on failure
      await TokenService.removeToken();
      delete api.defaults.headers.common["Authorization"];
      setCurrentUser(null);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      showToast(errorMessage, "error");

      throw error;
    }
  },
};

export default AuthService;
