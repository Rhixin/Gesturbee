import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import AuthService from '@/api/services/auth-service';
import { OAUTH_CONFIG } from '@/api/oauth-config';

WebBrowser.maybeCompleteAuthSession();

// Facebook OAuth using Authorization Code Flow (more reliable)
export const useCodeFlowOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const promptFacebookAuthCode = async () => {
    try {
      console.log('🚀 Starting Facebook Auth with Code Flow...');
      setIsLoading(true);
      
      const redirectUri = "https://auth.expo.io/@zian17/gesturbee";
      
      // Use authorization code flow instead of implicit token flow
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +  // Use 'code' instead of 'token'
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}&` +
        `state=${Math.random().toString(36)}`;

      console.log('🔗 Facebook Code Flow URL:', authUrl);

      // Open browser
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show instructions
      Alert.alert(
        "Complete Facebook Login",
        "1. Complete login in the browser\n" +
        "2. You'll be redirected to a page\n" + 
        "3. Copy the entire URL (contains 'code=')\n" +
        "4. Come back and paste it here",
        [
          {
            text: "I got the code, paste URL",
            onPress: () => promptForCodeUrl()
          },
          {
            text: "Cancel",
            onPress: () => setIsLoading(false),
            style: "cancel"
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Facebook code flow error:', error);
      setIsLoading(false);
      onError('Failed to start Facebook authentication');
    }
  };

  const promptForCodeUrl = () => {
    Alert.prompt(
      "Paste the URL with Code",
      "Paste the URL from browser (should contain 'code=' parameter)",
      (url) => {
        if (url && url.includes('code=')) {
          handleCodeUrl(url);
        } else {
          setIsLoading(false);
          onError('Invalid URL - no authorization code found');
        }
      },
      'plain-text',
      'https://auth.expo.io/@zian17/gesturbee?code=...'
    );
  };

  const handleCodeUrl = async (url: string) => {
    try {
      console.log('🔍 Processing code URL:', url.substring(0, 100) + '...');
      
      // Extract code from URL
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      
      if (!code) {
        throw new Error('No authorization code found in URL');
      }
      
      console.log('🎉 Got authorization code:', code.substring(0, 20) + '...');
      
      // Send the authorization code to your backend
      // Your backend should exchange this code for an access token
      console.log('🔗 Sending authorization code to backend...');
      
      const authResult = await AuthService.facebookLoginWithCode(code);
      console.log('✅ Facebook code flow success:', authResult);
      
      await onSuccess(authResult.user, authResult.token);
      
    } catch (error) {
      console.error('❌ Error processing code URL:', error);
      onError('Failed to process authorization code: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { promptFacebookAuthCode };
};