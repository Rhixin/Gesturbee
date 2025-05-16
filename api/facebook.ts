// facebookAuth.ts
import api from "@/api/axios-config";
import TokenService from "@/api/axios-token";
import { AuthSessionResult } from "expo-auth-session";
import { Router } from "expo-router";

export const handleFacebookAuthResponse = async (
  facebookResponse: AuthSessionResult | null,
  setCurrentUser: (user: any) => void
) => {
  if (facebookResponse?.type === "success") {
    try {
      // 1. Get Facebook access token
      const facebookAccessToken = facebookResponse.params.access_token;

      // 2. Send Facebook token to backend
      const response = await api.post("/auth/external-login/facebook", {
        accessToken: facebookAccessToken,
      });

      // 3. Backend responds with app tokens
      const token = response.data.token;
      const user = response.data.response.data;

      // 4. Save the token to TokenService
      await TokenService.saveToken(token);

      // 5. Set Authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 6. Update the user in AuthContext
      setCurrentUser(user);
    } catch (error) {
      console.error("Error during Facebook authentication:", error);
    }
  } else if (facebookResponse?.type === "error") {
    console.error("Authentication error:", facebookResponse.error);
  }
};
