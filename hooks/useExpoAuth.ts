import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';
import AuthService from '@/api/services/auth-service';
import { OAUTH_CONFIG } from '@/api/oauth-config';

// Google Auth with Expo's built-in provider
export const useExpoGoogleAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
    scopes: OAUTH_CONFIG.GOOGLE.SCOPES,
    redirectUri: makeRedirectUri({
      native: 'com.softeng.gesturbee://auth/google',
      useProxy: true
    }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('✅ Expo Google Success:', access_token);
      
      setIsLoading(true);
      AuthService.googleLogin(access_token)
        .then(authResult => {
          onSuccess(authResult.user, authResult.token);
        })
        .catch(error => {
          console.error('Backend error:', error);
          onError('Google login failed: ' + error.message);
        })
        .finally(() => setIsLoading(false));
    } else if (response?.type === 'error') {
      console.error('❌ Expo Google Error:', response.error);
      onError('Google authentication failed');
    }
  }, [response]);

  const promptGoogleAuth = () => {
    console.log('🚀 Starting Expo Google Auth...');
    promptAsync();
  };

  return { promptGoogleAuth, request };
};

// Facebook Auth with Expo's built-in provider  
export const useExpoFacebookAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: OAUTH_CONFIG.FACEBOOK.APP_ID,
    scopes: OAUTH_CONFIG.FACEBOOK.SCOPES,
    redirectUri: makeRedirectUri({
      native: 'com.softeng.gesturbee://auth/facebook',
      useProxy: true
    }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('✅ Expo Facebook Success:', access_token);
      
      setIsLoading(true);
      AuthService.facebookLogin(access_token)
        .then(authResult => {
          onSuccess(authResult.user, authResult.token);
        })
        .catch(error => {
          console.error('Backend error:', error);
          onError('Facebook login failed: ' + error.message);
        })
        .finally(() => setIsLoading(false));
    } else if (response?.type === 'error') {
      console.error('❌ Expo Facebook Error:', response.error);
      onError('Facebook authentication failed');
    }
  }, [response]);

  const promptFacebookAuth = () => {
    console.log('🚀 Starting Expo Facebook Auth...');
    promptAsync();
  };

  return { promptFacebookAuth, request };
};