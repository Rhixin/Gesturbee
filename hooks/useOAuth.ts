import { useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import AuthService from "@/api/services/auth-service";
import { OAUTH_CONFIG } from "@/api/oauth-config";

// Custom hook for Google OAuth
export const useGoogleAuth = (onSuccess, onError, setIsLoading) => {
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      clientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
      iosClientId: OAUTH_CONFIG.GOOGLE.IOS_CLIENT_ID,
      androidClientId: OAUTH_CONFIG.GOOGLE.ANDROID_CLIENT_ID,
      webClientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
      scopes: OAUTH_CONFIG.GOOGLE.SCOPES,
      responseType: OAUTH_CONFIG.GOOGLE.RESPONSE_TYPE,
    });

  useEffect(() => {
    const handleGoogleAuthResponse = async () => {
      if (googleResponse?.type === "success") {
        try {
          setIsLoading(true);

          // Get Google ID token
          const googleToken = googleResponse.params.id_token;

          // Send Google token to backend
          const authResult = await AuthService.googleLogin(googleToken);

          // Handle successful authentication
          await onSuccess(authResult.user, authResult.token);
        } catch (error) {
          console.error("Error during Google authentication:", error);
          onError("Google login failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else if (googleResponse?.type === "error") {
        console.error("Authentication error:", googleResponse.error);
        setIsLoading(false);
        onError("Authentication cancelled or failed.");
      }
    };

    handleGoogleAuthResponse();
  }, [googleResponse]);

  const promptGoogleAuth = async () => {
    try {
      setIsLoading(true);
      await googlePromptAsync();
    } catch (error) {
      setIsLoading(false);
      onError("Google login failed!");
    }
  };

  return {
    googleRequest,
    promptGoogleAuth,
  };
};

export const useFacebookAuth = (onSuccess, onError, setIsLoading) => {
  const REDIRECT_URI = makeRedirectUri();

  const [facebookRequest, facebookResponse, facebookPromptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: OAUTH_CONFIG.FACEBOOK.APP_ID,
        scopes: OAUTH_CONFIG.FACEBOOK.SCOPES,
        responseType: AuthSession.ResponseType.Token,
        redirectUri: REDIRECT_URI,
      },
      {
        authorizationEndpoint: OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT,
      }
    );

  useEffect(() => {
    const handleFacebookResponse = async () => {
      if (facebookResponse?.type === "success") {
        try {
          setIsLoading(true);

          const facebookAccessToken = facebookResponse.params.access_token;

          const authResult = await AuthService.facebookLogin(
            facebookAccessToken
          );

          await onSuccess(authResult.user, authResult.token);
        } catch (error) {
          console.error("Error during Facebook authentication:", error);
          onError("Facebook login failed!");
        } finally {
          setIsLoading(false);
        }
      } else if (facebookResponse?.type === "error") {
        console.error("Authentication error:", facebookResponse.error);
        setIsLoading(false);
        onError("Facebook authentication failed!");
      }
    };

    handleFacebookResponse();
  }, [facebookResponse]);

  const promptFacebookAuth = async () => {
    try {
      setIsLoading(true);
      await facebookPromptAsync();
    } catch (error) {
      setIsLoading(false);
      onError("Facebook login failed!");
    }
  };

  return {
    facebookRequest,
    promptFacebookAuth,
  };
};
