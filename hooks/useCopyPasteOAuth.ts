import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// Simple copy-paste OAuth solution that actually works
export const useCopyPasteOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Facebook Copy-Paste Auth...');
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      // Open browser
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show simple alert asking user to copy the token
      setTimeout(() => {
        Alert.alert(
          "Copy Facebook Token",
          "1. After logging in, you'll see a page with a long URL\n" +
          "2. Find 'access_token=' in the URL\n" +
          "3. Copy EVERYTHING after the = until the next & (should be 200+ characters)\n" +
          "4. The token starts with 'EAA' and is very long",
          [
            {
              text: "I have the token",
              onPress: () => promptForToken('facebook')
            },
            {
              text: "Cancel",
              onPress: () => setIsLoading(false),
              style: "cancel"
            }
          ]
        );
      }, 2000);
      
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      onError('Failed to start Facebook authentication');
    }
  };

  const promptGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Google Copy-Paste Auth...');
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(' '))}`;

      // Open browser
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show simple alert asking user to copy the token
      setTimeout(() => {
        Alert.alert(
          "Copy Google Token",
          "1. After logging in, you'll see a page with a long URL\n" +
          "2. Find 'access_token=' in the URL\n" +
          "3. Copy EVERYTHING after the = until the next & (should be 200+ characters)\n" +
          "4. The token starts with 'ya29' and is very long",
          [
            {
              text: "I have the token",
              onPress: () => promptForToken('google')
            },
            {
              text: "Cancel",
              onPress: () => setIsLoading(false),
              style: "cancel"
            }
          ]
        );
      }, 2000);
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      onError('Failed to start Google authentication');
    }
  };

  const promptForToken = (provider: 'facebook' | 'google') => {
    Alert.prompt(
      `Paste ${provider} Token`,
      `Paste the access token (the long string after 'access_token='):`,
      async (token) => {
        if (token && token.trim().length > 50) {
          console.log(`📝 User pasted ${provider} token with length:`, token.trim().length);
          await handleToken(token.trim(), provider);
        } else {
          setIsLoading(false);
          console.log(`❌ Invalid token length:`, token?.length || 0);
          onError('Invalid token - please copy the full access token (should be very long)');
        }
      },
      'plain-text',
      'EAAOaQbOgfSE...'
    );
  };

  const handleToken = async (accessToken: string, provider: string) => {
    try {
      setIsLoading(true);
      console.log(`🎉 Got ${provider} token (length: ${accessToken.length}):`, accessToken.substring(0, 30) + '...');
      console.log(`📤 Sending full token to backend...`);
      
      let authResult;
      if (provider === 'facebook') {
        authResult = await AuthService.facebookLogin(accessToken);
      } else {
        authResult = await AuthService.googleLogin(accessToken);
      }
      
      console.log(`✅ ${provider} backend success:`, authResult);
      await onSuccess(authResult.user, authResult.token);
      
    } catch (error) {
      console.error(`❌ ${provider} auth error:`, error);
      console.error(`❌ Full error details:`, error.response?.data || error.message);
      onError(`${provider} authentication failed: ` + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promptFacebookAuth,
    promptGoogleAuth
  };
};