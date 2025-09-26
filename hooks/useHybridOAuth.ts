import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AuthService from '@/api/services/auth-service';
import { OAUTH_CONFIG } from '@/api/oauth-config';

WebBrowser.maybeCompleteAuthSession();

// Hybrid Facebook OAuth - combines web browser with deep link handling
export const useHybridFacebookAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Hybrid Facebook Auth...');
      setIsLoading(true);
      
      // Use the working redirect URI
      const redirectUri = "https://auth.expo.io/@zian17/gesturbee";
      
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      console.log('🔗 Facebook Auth URL:', authUrl);
      console.log('🔗 Redirect URI:', redirectUri);
      
      // Open browser
      const result = await WebBrowser.openBrowserAsync(authUrl);
      console.log('📱 Browser result:', result);
      
      // The user will be redirected to https://auth.expo.io/@zian17/gesturbee#access_token=...
      // We need to handle this manually since the browser redirect won't come back to our app automatically
      
      // Listen for when the app comes back into focus (user returns from browser)
      const handleAppStateChange = async () => {
        console.log('📱 App came back into focus - checking for auth success');
        
        // You could implement a polling mechanism or ask user to confirm they completed auth
        // For now, let's show a simple prompt
        setTimeout(() => {
          onError('Please complete authentication in the browser and return to the app');
          setIsLoading(false);
        }, 1000);
      };
      
      // Handle when browser is dismissed
      if (result.type === 'dismiss') {
        handleAppStateChange();
      } else {
        setIsLoading(false);
        onError('Browser closed unexpectedly');
      }
      
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      setIsLoading(false);
      onError('Failed to start Facebook authentication');
    }
  };

  return { promptFacebookAuth };
};

// Let's also create a simple manual token input for testing
export const useManualTokenAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const testWithManualToken = async (accessToken: string) => {
    try {
      console.log('🧪 Testing with manual token:', accessToken);
      setIsLoading(true);
      
      const authResult = await AuthService.facebookLogin(accessToken);
      console.log('✅ Manual token success:', authResult);
      
      await onSuccess(authResult.user, authResult.token);
    } catch (error) {
      console.error('❌ Manual token error:', error);
      onError('Manual token failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { testWithManualToken };
};