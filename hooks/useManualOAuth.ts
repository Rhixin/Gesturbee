import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import AuthService from '@/api/services/auth-service';
import { OAUTH_CONFIG } from '@/api/oauth-config';

WebBrowser.maybeCompleteAuthSession();

// Manual OAuth - user copies token from browser
export const useManualOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const promptFacebookAuthManual = async () => {
    try {
      console.log('🚀 Starting Manual Facebook Auth...');
      setIsLoading(true);
      
      const redirectUri = "https://auth.expo.io/@zian17/gesturbee";
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      // Open browser - user will authenticate
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show instructions to user
      Alert.alert(
        "Complete Facebook Login",
        "1. Complete login in the browser\n" +
        "2. You'll see a page with your token\n" + 
        "3. Copy the entire URL from browser\n" +
        "4. Come back to this app\n" +
        "5. Paste the URL when prompted",
        [
          {
            text: "I completed login, paste URL",
            onPress: () => promptForUrl()
          },
          {
            text: "Cancel",
            onPress: () => setIsLoading(false),
            style: "cancel"
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Manual Facebook auth error:', error);
      setIsLoading(false);
      onError('Failed to start Facebook authentication');
    }
  };

  const promptForUrl = () => {
    Alert.prompt(
      "Paste the URL",
      "Paste the full URL from your browser (starts with https://auth.expo.io and contains access_token)",
      (url) => {
        if (url && url.includes('access_token=')) {
          handleUrlWithToken(url);
        } else {
          setIsLoading(false);
          onError('Invalid URL - no access token found');
        }
      },
      'plain-text',
      'https://auth.expo.io/@zian17/gesturbee#access_token=...'
    );
  };

  const handleUrlWithToken = async (url: string) => {
    try {
      console.log('🔍 Processing URL:', url.substring(0, 100) + '...');
      
      // Extract token from URL
      const fragment = url.split('#')[1];
      if (!fragment) {
        throw new Error('No fragment found in URL');
      }
      
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      
      if (!accessToken) {
        throw new Error('No access_token found in URL');
      }
      
      console.log('🎉 Got access token:', accessToken.substring(0, 20) + '...');
      
      // Call backend
      console.log('🔗 Calling backend with token:', accessToken.substring(0, 30) + '...');
      const authResult = await AuthService.facebookLogin(accessToken);
      console.log('✅ Facebook backend success:', authResult);
      
      await onSuccess(authResult.user, authResult.token);
      
    } catch (error) {
      console.error('❌ Error processing URL:', error);
      onError('Failed to process authentication: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { promptFacebookAuthManual };
};