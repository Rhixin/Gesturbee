import * as WebBrowser from "expo-web-browser";
import AuthService from "@/api/services/auth-service";
import { OAUTH_CONFIG } from "@/api/oauth-config";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Hook
export const useGoogleWebAuth = (
  onSuccess: any,
  onError: any,
  setIsLoading: any
) => {
  const promptGoogleAuth = async () => {
    try {
      setIsLoading(true);

      const redirectUri = "https://auth.expo.io/@zian17/gesturbee";

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` + // using `token` for implicit flow
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(" "))}&` +
        `include_granted_scopes=true&` +
        `state=${Math.random().toString(36)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
        {
          showInRecents: false,
        }
      );

      // Right after receiving result from openAuthSessionAsync
      console.log("Auth session result:", result);
      if (result.url) console.log("Redirect URL:", result.url);

      if (result.type === "success" && result.url) {
        console.log("✅ Success! URL received:", result.url);

        // Try different parsing methods
        let accessToken = null;

        // Method 1: Parse fragment
        if (result.url.includes("#")) {
          const fragment = result.url.split("#")[1];
          console.log("Fragment:", fragment);
          const params = new URLSearchParams(fragment);
          accessToken = params.get("access_token");
          console.log("Access token from fragment:", accessToken);
        }

        // Method 2: Parse query params
        if (!accessToken && result.url.includes("?")) {
          const query = result.url.split("?")[1];
          console.log("Query:", query);
          const params = new URLSearchParams(query);
          accessToken = params.get("access_token");
          console.log("Access token from query:", accessToken);
        }

        if (accessToken) {
          console.log("🎉 Got access token, calling backend...");
          try {
            const authResult = await AuthService.googleLogin(accessToken);
            console.log("Backend response:", authResult);
            await onSuccess(authResult.user, authResult.token);
          } catch (backendError) {
            console.error("Backend error:", backendError);
            onError("Backend authentication failed: " + backendError.message);
          }
        } else {
          console.error("❌ No access token found in URL");
          onError(
            "No access token returned from Google. Check console for details."
          );
        }
      } else {
        console.error("❌ Auth failed:", result);
        onError("Google login cancelled or failed.");
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      onError("Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { promptGoogleAuth };
};

// Facebook OAuth Hook
export const useFacebookWebAuth = (
  onSuccess: any,
  onError: any,
  setIsLoading: any
) => {
  const promptFacebookAuth = async () => {
    try {
      setIsLoading(true);

      const redirectUri = "https://auth.expo.io/@zian17/gesturbee";

      console.log(redirectUri);

      const authUrl =
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(","))}`;

      console.log(authUrl);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
        {
          showInRecents: false,
        }
      );

      // Right after receiving result from openAuthSessionAsync
      console.log("Auth session result:", result);
      if (result.url) console.log("Redirect URL:", result.url);

      if (result.type === "success" && result.url) {
        console.log("✅ Facebook Success! URL received:", result.url);

        // Try different parsing methods
        let accessToken = null;

        // Method 1: Parse fragment
        if (result.url.includes("#")) {
          const fragment = result.url.split("#")[1];
          console.log("Facebook Fragment:", fragment);
          const params = new URLSearchParams(fragment);
          accessToken = params.get("access_token");
          console.log("Facebook access token from fragment:", accessToken);
        }

        // Method 2: Parse query params
        if (!accessToken && result.url.includes("?")) {
          const query = result.url.split("?")[1];
          console.log("Facebook Query:", query);
          const params = new URLSearchParams(query);
          accessToken = params.get("access_token");
          console.log("Facebook access token from query:", accessToken);
        }

        if (accessToken) {
          console.log("🎉 Got Facebook access token, calling backend...");
          try {
            const authResult = await AuthService.facebookLogin(accessToken);
            console.log("Facebook Backend response:", authResult);
            await onSuccess(authResult.user, authResult.token);
          } catch (backendError) {
            console.error("Facebook Backend error:", backendError);
            onError(
              "Facebook backend authentication failed: " + backendError.message
            );
          }
        } else {
          console.error("❌ No Facebook access token found in URL");
          onError(
            "No access token returned from Facebook. Check console for details."
          );
        }
      } else {
        console.error("❌ Facebook Auth failed:", result);
        onError("Facebook login cancelled or failed.");
      }
    } catch (error) {
      console.error("Facebook OAuth error:", error);
      onError("Facebook login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { promptFacebookAuth };
};
