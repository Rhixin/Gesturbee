import React from 'react';
import * as AuthSession from 'expo-auth-session';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// OAuth that actually works with Expo Go using the proxy
export const useWorkingExpoGoAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  // Facebook Auth
  const [facebookRequest, facebookResponse, facebookPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: OAUTH_CONFIG.FACEBOOK.APP_ID,
      scopes: OAUTH_CONFIG.FACEBOOK.SCOPES,
      responseType: AuthSession.ResponseType.Token,
      redirectUri: 'https://auth.expo.io/@zian17/gesturbee',
    },
    {
      authorizationEndpoint: OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT,
    }
  );

  // Google Auth
  const [googleRequest, googleResponse, googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
      scopes: OAUTH_CONFIG.GOOGLE.SCOPES,
      responseType: AuthSession.ResponseType.Token,
      redirectUri: 'https://auth.expo.io/@zian17/gesturbee',
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  // Handle Facebook response
  React.useEffect(() => {
    if (facebookResponse?.type === 'success') {
      console.log('✅ Facebook Success!', facebookResponse.params);
      const { access_token } = facebookResponse.params;
      
      if (access_token) {
        setIsLoading(true);
        AuthService.facebookLogin(access_token)
          .then(authResult => onSuccess(authResult.user, authResult.token))
          .catch(error => onError('Facebook login failed: ' + error.message))
          .finally(() => setIsLoading(false));
      }
    } else if (facebookResponse?.type === 'error') {
      console.error('❌ Facebook Error:', facebookResponse.error);
      onError('Facebook authentication failed');
    }
  }, [facebookResponse]);

  // Handle Google response
  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      console.log('✅ Google Success!', googleResponse.params);
      const { access_token } = googleResponse.params;
      
      if (access_token) {
        setIsLoading(true);
        AuthService.googleLogin(access_token)
          .then(authResult => onSuccess(authResult.user, authResult.token))
          .catch(error => onError('Google login failed: ' + error.message))
          .finally(() => setIsLoading(false));
      }
    } else if (googleResponse?.type === 'error') {
      console.error('❌ Google Error:', googleResponse.error);
      onError('Google authentication failed');
    }
  }, [googleResponse]);

  const promptFacebookAuth = async () => {
    console.log('🚀 Facebook Auth with Fixed Proxy...');
    console.log('🔗 Facebook Proxy URI: https://auth.expo.io/@zian17/gesturbee');
    
    if (facebookRequest) {
      await facebookPromptAsync();
    }
  };

  const promptGoogleAuth = async () => {
    console.log('🚀 Google Auth with Fixed Proxy...');
    console.log('🔗 Google Proxy URI: https://auth.expo.io/@zian17/gesturbee');
    
    if (googleRequest) {
      await googlePromptAsync();
    }
  };

  return { 
    promptFacebookAuth,
    promptGoogleAuth,
    proxyUri: 'https://auth.expo.io/@zian17/gesturbee'
  };
};