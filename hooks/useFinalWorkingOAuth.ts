import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

WebBrowser.maybeCompleteAuthSession();

// Final working OAuth solution
export const useFinalWorkingOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Final Facebook Auth...');
      setIsLoading(true);
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}&` +
        `state=${Math.random().toString(36)}`;

      console.log('🔗 Facebook Auth URL:', authUrl);

      // Use WebBrowser with better options
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: false,
      });

      console.log('📱 WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        console.log('✅ Got redirect URL:', result.url);
        
        // Parse token from URL fragment
        if (result.url.includes('#access_token=')) {
          const fragment = result.url.split('#')[1];
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            console.log('🎉 Extracted Facebook token:', accessToken.substring(0, 20) + '...');
            
            // Call backend
            const authResult = await AuthService.facebookLogin(accessToken);
            console.log('✅ Facebook backend success:', authResult);
            
            await onSuccess(authResult.user, authResult.token);
          } else {
            console.error('❌ No access token in URL');
            onError('No access token found in redirect');
          }
        } else {
          console.error('❌ No access_token fragment in URL');
          onError('Invalid redirect URL format');
        }
      } else if (result.type === 'cancel') {
        console.log('📱 User cancelled Facebook auth');
        onError('Authentication cancelled');
      } else {
        console.error('❌ WebBrowser failed:', result);
        onError('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      onError('Facebook authentication failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const promptGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Final Google Auth...');
      setIsLoading(true);
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(' '))}&` +
        `state=${Math.random().toString(36)}`;

      console.log('🔗 Google Auth URL:', authUrl);

      // Use WebBrowser with better options
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: false,
      });

      console.log('📱 WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        console.log('✅ Got redirect URL:', result.url);
        
        // Parse token from URL fragment
        if (result.url.includes('#access_token=')) {
          const fragment = result.url.split('#')[1];
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            console.log('🎉 Extracted Google token:', accessToken.substring(0, 20) + '...');
            
            // Call backend
            const authResult = await AuthService.googleLogin(accessToken);
            console.log('✅ Google backend success:', authResult);
            
            await onSuccess(authResult.user, authResult.token);
          } else {
            console.error('❌ No access token in URL');
            onError('No access token found in redirect');
          }
        } else {
          console.error('❌ No access_token fragment in URL');
          onError('Invalid redirect URL format');
        }
      } else if (result.type === 'cancel') {
        console.log('📱 User cancelled Google auth');
        onError('Authentication cancelled');
      } else {
        console.error('❌ WebBrowser failed:', result);
        onError('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Google auth error:', error);
      onError('Google authentication failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promptFacebookAuth,
    promptGoogleAuth
  };
};