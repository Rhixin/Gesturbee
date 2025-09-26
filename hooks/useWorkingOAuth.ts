import React from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AuthService from '@/api/services/auth-service';
import { OAUTH_CONFIG } from '@/api/oauth-config';

WebBrowser.maybeCompleteAuthSession();

// Working Facebook OAuth
export const useWorkingFacebookAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
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

  React.useEffect(() => {
    console.log('🔍 Facebook Auth Response:', response);
    
    if (response?.type === 'success') {
      console.log('✅ Facebook Success! Params:', response.params);
      
      const { access_token } = response.params;
      if (access_token) {
        console.log('🎉 Got Facebook token:', access_token);
        setIsLoading(true);
        
        AuthService.facebookLogin(access_token)
          .then(authResult => {
            console.log('Facebook Backend Success:', authResult);
            onSuccess(authResult.user, authResult.token);
          })
          .catch(error => {
            console.error('Facebook Backend Error:', error);
            onError('Facebook login failed: ' + (error.message || 'Unknown error'));
          })
          .finally(() => setIsLoading(false));
      } else {
        console.error('❌ No Facebook access token in response');
        onError('No access token received from Facebook');
      }
    } else if (response?.type === 'error') {
      console.error('❌ Facebook Auth Error:', response.error);
      onError('Facebook authentication failed: ' + (response.error?.message || 'Unknown error'));
    }
  }, [response]);

  const promptFacebookAuth = async () => {
    console.log('🚀 Starting Facebook Auth...');
    console.log('Request:', request);
    
    if (request) {
      try {
        await promptAsync();
      } catch (error) {
        console.error('Error prompting Facebook auth:', error);
        onError('Failed to start Facebook authentication');
      }
    } else {
      console.error('Facebook auth request not ready');
      onError('Facebook authentication not ready, please try again');
    }
  };

  return { 
    promptFacebookAuth, 
    request,
    isReady: !!request 
  };
};

// Working Google OAuth
export const useWorkingGoogleAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
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

  React.useEffect(() => {
    console.log('🔍 Google Auth Response:', response);
    
    if (response?.type === 'success') {
      console.log('✅ Google Success! Params:', response.params);
      
      const { access_token } = response.params;
      if (access_token) {
        console.log('🎉 Got Google token:', access_token);
        setIsLoading(true);
        
        AuthService.googleLogin(access_token)
          .then(authResult => {
            console.log('Google Backend Success:', authResult);
            onSuccess(authResult.user, authResult.token);
          })
          .catch(error => {
            console.error('Google Backend Error:', error);
            onError('Google login failed: ' + (error.message || 'Unknown error'));
          })
          .finally(() => setIsLoading(false));
      } else {
        console.error('❌ No Google access token in response');
        onError('No access token received from Google');
      }
    } else if (response?.type === 'error') {
      console.error('❌ Google Auth Error:', response.error);
      onError('Google authentication failed: ' + (response.error?.message || 'Unknown error'));
    }
  }, [response]);

  const promptGoogleAuth = async () => {
    console.log('🚀 Starting Google Auth...');
    console.log('Request:', request);
    
    if (request) {
      try {
        await promptAsync();
      } catch (error) {
        console.error('Error prompting Google auth:', error);
        onError('Failed to start Google authentication');
      }
    } else {
      console.error('Google auth request not ready');
      onError('Google authentication not ready, please try again');
    }
  };

  return { 
    promptGoogleAuth, 
    request,
    isReady: !!request 
  };
};