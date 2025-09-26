import * as WebBrowser from 'expo-web-browser';
import { Alert, AppState, Clipboard } from 'react-native';
import { useState, useEffect } from 'react';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// Automated OAuth using clipboard monitoring
export const useClipboardOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [storedTokens, setStoredTokens] = useState<{[key: string]: {token: string, timestamp: number}}>({});
  const [isWaitingForAuth, setIsWaitingForAuth] = useState<string | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isWaitingForAuth]);

  const handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active' && isWaitingForAuth) {
      console.log('📱 App became active, checking clipboard...');
      
      // Small delay to ensure clipboard is updated
      setTimeout(async () => {
        await checkClipboardForToken();
      }, 1000);
    }
  };

  const checkClipboardForToken = async () => {
    try {
      const clipboardText = await Clipboard.getString();
      console.log('📋 Clipboard content:', clipboardText.substring(0, 100) + '...');
      
      if (clipboardText.includes('auth.expo.io') && clipboardText.includes('access_token=')) {
        console.log('✅ Found OAuth URL in clipboard!');
        
        const token = extractTokenFromUrl(clipboardText);
        if (token && token.length > 50) {
          console.log(`🎉 Auto-extracted token from clipboard (${token.length} chars)`);
          
          Alert.alert(
            'Token Found in Clipboard!',
            `Found a ${isWaitingForAuth} token in your clipboard. Use it to log in?`,
            [
              {
                text: 'Yes, use it',
                onPress: async () => {
                  storeToken(isWaitingForAuth!, token);
                  await handleToken(token, isWaitingForAuth!);
                  setIsWaitingForAuth(null);
                }
              },
              {
                text: 'No, try again',
                onPress: () => {
                  setIsWaitingForAuth(null);
                  setIsLoading(false);
                }
              }
            ]
          );
        } else {
          console.log('❌ Token extraction failed from clipboard');
          showManualInstructions();
        }
      } else if (isWaitingForAuth) {
        console.log('❌ No OAuth URL found in clipboard');
        showManualInstructions();
      }
    } catch (error) {
      console.error('❌ Clipboard check error:', error);
      if (isWaitingForAuth) {
        showManualInstructions();
      }
    }
  };

  const showManualInstructions = () => {
    Alert.alert(
      'Copy the URL',
      `1. Complete ${isWaitingForAuth} login in browser\n2. Copy the COMPLETE redirect URL from address bar\n3. Return to this app\n\nThe URL should start with: https://auth.expo.io/@zian17/gesturbee#access_token=...`,
      [
        {
          text: 'I copied it',
          onPress: () => checkClipboardForToken()
        },
        {
          text: 'Cancel',
          onPress: () => {
            setIsWaitingForAuth(null);
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Clipboard Facebook Auth...');
      setIsLoading(true);
      
      // Check for stored token first
      const storedToken = getStoredToken('facebook');
      if (storedToken) {
        console.log('✅ Using stored Facebook token');
        await handleToken(storedToken, 'facebook');
        return;
      }
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      console.log('🔗 Opening Facebook auth in browser...');
      
      // Set waiting state
      setIsWaitingForAuth('facebook');
      
      // Open browser
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show initial instructions
      Alert.alert(
        'Facebook Authentication',
        'Complete the Facebook login in the browser, then:\n\n1. Copy the COMPLETE URL from the address bar\n2. Return to this app\n\nI\'ll automatically detect the URL in your clipboard!',
        [
          {
            text: 'OK, got it',
            onPress: () => {
              // Start monitoring for app state changes
              console.log('👂 Started monitoring for clipboard token...');
            }
          },
          {
            text: 'Cancel',
            onPress: () => {
              setIsWaitingForAuth(null);
              setIsLoading(false);
            },
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      setIsWaitingForAuth(null);
      onError('Failed to start Facebook authentication');
      setIsLoading(false);
    }
  };

  const promptGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Clipboard Google Auth...');
      setIsLoading(true);
      
      // Check for stored token first
      const storedToken = getStoredToken('google');
      if (storedToken) {
        console.log('✅ Using stored Google token');
        await handleToken(storedToken, 'google');
        return;
      }
      
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(' '))}`;

      console.log('🔗 Opening Google auth in browser...');
      
      // Set waiting state
      setIsWaitingForAuth('google');
      
      // Open browser
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Show initial instructions
      Alert.alert(
        'Google Authentication',
        'Complete the Google login in the browser, then:\n\n1. Copy the COMPLETE URL from the address bar\n2. Return to this app\n\nI\'ll automatically detect the URL in your clipboard!',
        [
          {
            text: 'OK, got it',
            onPress: () => {
              // Start monitoring for app state changes
              console.log('👂 Started monitoring for clipboard token...');
            }
          },
          {
            text: 'Cancel',
            onPress: () => {
              setIsWaitingForAuth(null);
              setIsLoading(false);
            },
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      setIsWaitingForAuth(null);
      onError('Failed to start Google authentication');
      setIsLoading(false);
    }
  };

  const extractTokenFromUrl = (url: string): string | null => {
    try {
      console.log('🔍 Extracting token from URL...');
      
      // Try multiple extraction patterns
      const patterns = [
        /access_token=([^&\s#]+)/,
        /#access_token=([^&\s]+)/,
        /access_token%3D([^&\s%]+)/  // URL encoded
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          if (token.length > 50) {
            console.log(`✅ Extracted token (${token.length} chars)`);
            return token;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Token extraction error:', error);
      return null;
    }
  };

  const storeToken = (provider: string, token: string) => {
    setStoredTokens(prev => ({
      ...prev,
      [provider]: {
        token,
        timestamp: Date.now()
      }
    }));
    console.log(`✅ Stored ${provider} token in memory`);
  };

  const getStoredToken = (provider: string): string | null => {
    const tokenData = storedTokens[provider];
    
    if (tokenData) {
      // Check if token is less than 1 hour old
      const tokenAge = Date.now() - tokenData.timestamp;
      const oneHour = 60 * 60 * 1000;
      
      if (tokenAge < oneHour) {
        console.log(`✅ Found valid stored ${provider} token`);
        return tokenData.token;
      } else {
        console.log(`⏰ Stored ${provider} token expired`);
        clearStoredToken(provider);
      }
    }
    
    return null;
  };

  const clearStoredToken = (provider: string) => {
    setStoredTokens(prev => {
      const newTokens = { ...prev };
      delete newTokens[provider];
      return newTokens;
    });
    console.log(`🗑️ Cleared stored ${provider} token`);
  };

  const handleToken = async (accessToken: string, provider: string) => {
    try {
      console.log(`🎉 Processing ${provider} token (length: ${accessToken.length})`);
      
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
      onError(`${provider} authentication failed: ` + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promptFacebookAuth,
    promptGoogleAuth,
    clearStoredToken
  };
};