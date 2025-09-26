import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// Auto token extraction OAuth solution
export const useAutoTokenOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Auto Facebook Token Auth...');
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      // Open browser - don't wait for redirect, just open
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show instructions for user
      setTimeout(() => {
        Alert.alert(
          "Facebook Authentication",
          "1. Complete Facebook login in the browser\n2. You'll see the GesturBee redirect page\n3. I'll automatically detect and use your token",
          [
            {
              text: "I completed login",
              onPress: () => promptForUrlCheck('facebook')
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
      console.log('🚀 Starting Auto Google Token Auth...');
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(' '))}`;

      // Open browser - don't wait for redirect, just open
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show instructions for user
      setTimeout(() => {
        Alert.alert(
          "Google Authentication",
          "1. Complete Google login in the browser\n2. You'll see the GesturBee redirect page\n3. I'll automatically detect and use your token",
          [
            {
              text: "I completed login",
              onPress: () => promptForUrlCheck('google')
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

  const promptForUrlCheck = (provider: string) => {
    Alert.prompt(
      `Paste ${provider} Redirect URL`,
      `After completing login, you should see a page starting with:\nhttps://auth.expo.io/@zian17/gesturbee#access_token=LONG_TOKEN_HERE\n\nIMPORTANT: Copy the COMPLETE URL (not the shortened one with ...)`,
      async (url) => {
        if (url && url.includes('access_token=')) {
          console.log(`📝 User provided ${provider} URL length:`, url.length);
          console.log(`📝 URL preview:`, url.substring(0, 60) + '...');
          
          const token = extractTokenFromUrl(url);
          if (token && token.length > 50) {
            await handleToken(token, provider);
          } else {
            console.log('❌ Extracted token too short:', token?.length || 0);
            Alert.alert(
              'Token Too Short',
              `The extracted token is only ${token?.length || 0} characters. Facebook tokens should be 200+ characters.\n\nMake sure you copied the COMPLETE URL from your browser address bar, not a shortened version.`,
              [
                { text: 'Try Again', onPress: () => promptForUrlCheck(provider) },
                { text: 'Cancel', onPress: () => setIsLoading(false) }
              ]
            );
          }
        } else if (url && url.trim().length > 0) {
          onError('Invalid URL - should contain access_token');
        } else {
          setIsLoading(false);
        }
      },
      'plain-text',
      'https://auth.expo.io/@zian17/gesturbee#access_token='
    );
  };

  const extractTokenFromUrl = (url: string): string | null => {
    try {
      console.log('🔍 Extracting token from URL:', url);
      
      // Try URL fragment first (#access_token=...)
      if (url.includes('#access_token=')) {
        const fragment = url.split('#')[1];
        const params = new URLSearchParams(fragment);
        const token = params.get('access_token');
        if (token) {
          console.log('✅ Found token in URL fragment');
          return token;
        }
      }
      
      // Try query parameters (?access_token=...)
      if (url.includes('?access_token=') || url.includes('&access_token=')) {
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('access_token');
        if (token) {
          console.log('✅ Found token in URL params');
          return token;
        }
      }
      
      // Try manual regex extraction
      const tokenMatch = url.match(/access_token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        console.log('✅ Found token via regex');
        return tokenMatch[1];
      }
      
      console.log('❌ No token found in URL');
      return null;
    } catch (error) {
      console.error('❌ Error extracting token:', error);
      return null;
    }
  };

  const showTokenExtractionAlert = (url: string, provider: string) => {
    // Extract just the token part for display
    const tokenStart = url.indexOf('access_token=');
    const tokenPart = tokenStart !== -1 ? url.substring(tokenStart + 13).split('&')[0] : '';
    
    Alert.alert(
      `Auto-Extract ${provider} Token`,
      `Found this URL: ${url.substring(0, 100)}...\n\nFound token: ${tokenPart.substring(0, 50)}...\n\nShould I use this token?`,
      [
        {
          text: "Use This Token",
          onPress: () => {
            if (tokenPart && tokenPart.length > 50) {
              handleToken(tokenPart, provider);
            } else {
              onError('Could not extract valid token');
            }
          }
        },
        {
          text: "Cancel",
          onPress: () => setIsLoading(false),
          style: "cancel"
        }
      ]
    );
  };

  const handleToken = async (accessToken: string, provider: string) => {
    try {
      setIsLoading(true);
      console.log(`🎉 Processing ${provider} token (length: ${accessToken.length}):`, accessToken.substring(0, 30) + '...');
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