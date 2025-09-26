import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { useState } from 'react';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// Smart OAuth that automatically captures tokens
export const useSmartOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [storedTokens, setStoredTokens] = useState<{[key: string]: {token: string, timestamp: number}}>({});
  
  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Smart Facebook Auth...');
      setIsLoading(true);
      
      // Check for stored token first
      const storedToken = getStoredToken('facebook');
      if (storedToken) {
        console.log('✅ Using stored Facebook token');
        await handleToken(storedToken, 'facebook');
        return;
      }
      
      // Use HTTPS redirect URI that's already accepted
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      console.log('🔗 Using HTTPS redirect URI:', redirectUri);
      
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      // Use WebBrowser with better result handling
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        console.log('✅ Got Facebook redirect URL');
        const token = extractTokenFromUrl(result.url);
        
        if (token && token.length > 50) {
          console.log(`🎉 Auto-extracted Facebook token (${token.length} chars)`);
          storeToken('facebook', token);
          await handleToken(token, 'facebook');
        } else {
          console.log('❌ Token extraction failed, showing manual option');
          showManualTokenInput(result.url, 'facebook');
        }
      } else if (result.type === 'cancel') {
        console.log('📱 User cancelled Facebook auth');
        setIsLoading(false);
      } else {
        console.error('❌ WebBrowser failed:', result);
        onError('Facebook authentication failed');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      onError('Failed to start Facebook authentication');
      setIsLoading(false);
    }
  };

  const promptGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Smart Google Auth...');
      setIsLoading(true);
      
      // Check for stored token first
      const storedToken = getStoredToken('google');
      if (storedToken) {
        console.log('✅ Using stored Google token');
        await handleToken(storedToken, 'google');
        return;
      }
      
      // Use HTTPS redirect URI that's already accepted
      const redirectUri = 'https://auth.expo.io/@zian17/gesturbee';
      console.log('🔗 Using HTTPS redirect URI:', redirectUri);
      
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(' '))}`;

      // Use WebBrowser with better result handling
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        console.log('✅ Got Google redirect URL');
        const token = extractTokenFromUrl(result.url);
        
        if (token && token.length > 50) {
          console.log(`🎉 Auto-extracted Google token (${token.length} chars)`);
          storeToken('google', token);
          await handleToken(token, 'google');
        } else {
          console.log('❌ Token extraction failed, showing manual option');
          showManualTokenInput(result.url, 'google');
        }
      } else if (result.type === 'cancel') {
        console.log('📱 User cancelled Google auth');
        setIsLoading(false);
      } else {
        console.error('❌ WebBrowser failed:', result);
        onError('Google authentication failed');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      onError('Failed to start Google authentication');
      setIsLoading(false);
    }
  };

  const showManualTokenInput = (url: string, provider: string) => {
    const token = extractTokenFromUrl(url);
    const tokenPreview = token ? token.substring(0, 50) + '...' : 'Not found';
    
    Alert.alert(
      `${provider} Token Found`,
      `I found this token: ${tokenPreview}\n\nLength: ${token?.length || 0} characters\n\nUse this token?`,
      [
        {
          text: "Yes, use it",
          onPress: async () => {
            if (token && token.length > 50) {
              storeToken(provider, token);
              await handleToken(token, provider);
            } else {
              onError('Token too short or invalid');
              setIsLoading(false);
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

  const extractTokenFromUrl = (url: string): string | null => {
    try {
      // Try different patterns to extract the token
      const patterns = [
        /access_token=([^&]+)/,
        /token=([^&]+)/,
        /#access_token=([^&]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Token extraction error:', error);
      return null;
    }
  };

  const storeToken = (provider: string, token: string) => {
    try {
      setStoredTokens(prev => ({
        ...prev,
        [provider]: {
          token,
          timestamp: Date.now()
        }
      }));
      console.log(`✅ Stored ${provider} token in memory`);
    } catch (error) {
      console.error(`❌ Failed to store ${provider} token:`, error);
    }
  };

  const getStoredToken = (provider: string): string | null => {
    try {
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
    } catch (error) {
      console.error(`❌ Failed to get stored ${provider} token:`, error);
      return null;
    }
  };

  const clearStoredToken = (provider: string) => {
    try {
      setStoredTokens(prev => {
        const newTokens = { ...prev };
        delete newTokens[provider];
        return newTokens;
      });
      console.log(`🗑️ Cleared stored ${provider} token`);
    } catch (error) {
      console.error(`❌ Failed to clear ${provider} token:`, error);
    }
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