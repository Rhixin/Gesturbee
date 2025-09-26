import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { useState } from 'react';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// Simple OAuth that opens browser and asks for token
export const useSimpleOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [storedTokens, setStoredTokens] = useState<{[key: string]: {token: string, timestamp: number}}>({});
  
  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Simple Facebook Auth...');
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
      
      // Open browser without waiting for redirect
      await WebBrowser.openBrowserAsync(authUrl);
      
      // After browser opens, show prompt after delay
      setTimeout(() => {
        Alert.alert(
          'Facebook Authentication',
          'Complete the Facebook login in the browser, then come back here.',
          [
            {
              text: 'I completed login',
              onPress: () => promptForToken('facebook')
            },
            {
              text: 'Cancel',
              onPress: () => setIsLoading(false),
              style: 'cancel'
            }
          ]
        );
      }, 2000);
      
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      onError('Failed to start Facebook authentication');
      setIsLoading(false);
    }
  };

  const promptGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Simple Google Auth...');
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
      
      // Open browser without waiting for redirect
      await WebBrowser.openBrowserAsync(authUrl);
      
      // After browser opens, show prompt after delay
      setTimeout(() => {
        Alert.alert(
          'Google Authentication',
          'Complete the Google login in the browser, then come back here.',
          [
            {
              text: 'I completed login',
              onPress: () => promptForToken('google')
            },
            {
              text: 'Cancel',
              onPress: () => setIsLoading(false),
              style: 'cancel'
            }
          ]
        );
      }, 2000);
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      onError('Failed to start Google authentication');
      setIsLoading(false);
    }
  };

  const promptForToken = (provider: string) => {
    Alert.prompt(
      `Paste ${provider} Token`,
      `After completing login, you should see a redirect page with a URL like:\nhttps://auth.expo.io/@zian17/gesturbee#access_token=LONG_TOKEN...\n\nPaste the COMPLETE URL here:`,
      async (url) => {
        if (url && url.includes('access_token=')) {
          console.log(`📝 User provided ${provider} URL`);
          const token = extractTokenFromUrl(url);
          
          if (token && token.length > 10) { // Lowered threshold for debugging
            console.log(`🎉 Extracted ${provider} token (${token.length} chars)`);
            storeToken(provider, token);
            await handleToken(token, provider);
          } else {
            console.log(`❌ Token too short: ${token?.length || 0} chars`);
            console.log(`❌ Full extracted token:`, token);
            Alert.alert(
              'Invalid Token',
              `The token appears to be too short (${token?.length || 0} characters).\n\nExtracted: "${token}"\n\nMake sure you copied the COMPLETE URL from your browser address bar.`,
              [
                { text: 'Try Again', onPress: () => promptForToken(provider) },
                { text: 'Cancel', onPress: () => setIsLoading(false) }
              ]
            );
          }
        } else if (url && url.trim().length > 0) {
          Alert.alert(
            'Invalid URL',
            'The URL should contain "access_token=". Make sure you copied the complete redirect URL.',
            [
              { text: 'Try Again', onPress: () => promptForToken(provider) },
              { text: 'Cancel', onPress: () => setIsLoading(false) }
            ]
          );
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
      console.log('🔍 Extracting token from URL:', url.substring(0, 100) + '...');
      console.log('🔍 URL length:', url.length);
      
      // Try URL fragment first (#access_token=...)
      if (url.includes('#access_token=')) {
        console.log('✅ Found #access_token= in URL');
        const fragment = url.split('#')[1];
        console.log('📝 Fragment:', fragment.substring(0, 100) + '...');
        
        const params = new URLSearchParams(fragment);
        const token = params.get('access_token');
        console.log('📝 Extracted token:', token ? token.substring(0, 50) + '...' : 'null');
        console.log('📝 Token length:', token?.length || 0);
        
        if (token) {
          return token; // Return token regardless of length for debugging
        }
      }
      
      // Try regex as fallback
      console.log('🔍 Trying regex fallback...');
      const tokenMatch = url.match(/access_token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        console.log('📝 Regex found token:', tokenMatch[1].substring(0, 50) + '...');
        console.log('📝 Regex token length:', tokenMatch[1].length);
        return tokenMatch[1];
      }
      
      // Try alternative patterns
      console.log('🔍 Trying alternative patterns...');
      const patterns = [
        /access_token=([^&\s]+)/,
        /#access_token=([^&\s]+)/,
        /token=([^&\s]+)/
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        const match = url.match(patterns[i]);
        if (match && match[1]) {
          console.log(`📝 Pattern ${i} found:`, match[1].substring(0, 50) + '...');
          return match[1];
        }
      }
      
      console.log('❌ No token found with any pattern');
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