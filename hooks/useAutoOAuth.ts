import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useState, useEffect } from 'react';
import { OAUTH_CONFIG } from '@/api/oauth-config';
import AuthService from '@/api/services/auth-service';

// Fully automated OAuth - no manual copying needed
export const useAutoOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  const [storedTokens, setStoredTokens] = useState<{[key: string]: {token: string, timestamp: number}}>({});
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Set up URL listener for automatic token capture
    const subscription = Linking.addEventListener('url', handleIncomingURL);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const handleIncomingURL = async (event: { url: string }) => {
    if (!isListening) return;
    
    console.log('📡 Received URL:', event.url);
    
    try {
      // Check if it's an OAuth redirect
      if (event.url.includes('oauth') || event.url.includes('access_token')) {
        setIsListening(false);
        
        // Extract provider and token
        const provider = event.url.includes('facebook') ? 'facebook' : 'google';
        const token = extractTokenFromUrl(event.url);
        
        if (token && token.length > 50) {
          console.log(`🎉 Auto-captured ${provider} token (${token.length} chars)`);
          storeToken(provider, token);
          await handleToken(token, provider);
        } else {
          console.log('❌ Could not extract valid token from URL');
          onError('Failed to extract authentication token');
        }
      }
    } catch (error) {
      console.error('❌ Error handling incoming URL:', error);
      onError('Failed to process authentication');
    }
  };

  const promptFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Auto Facebook Auth...');
      setIsLoading(true);
      
      // Check for stored token first
      const storedToken = getStoredToken('facebook');
      if (storedToken) {
        console.log('✅ Using stored Facebook token');
        await handleToken(storedToken, 'facebook');
        return;
      }

      // Try both deep link and HTTPS redirect URIs
      const deepLinkUri = `${Linking.createURL('')}oauth/facebook`;
      const httpsUri = 'https://auth.expo.io/@zian17/gesturbee';
      console.log('🔗 Deep link URI:', deepLinkUri);
      console.log('🔗 HTTPS URI:', httpsUri);
      
      // Use HTTPS URI for now (already registered with Facebook)
      const redirectUri = httpsUri;
      
      const authUrl = 
        `${OAUTH_CONFIG.FACEBOOK.AUTHORIZATION_ENDPOINT}?` +
        `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.SCOPES.join(','))}`;

      // Start listening for URL
      setIsListening(true);
      console.log('👂 Listening for OAuth redirect...');
      
      // Open auth URL
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Set timeout to stop listening after 5 minutes
      setTimeout(() => {
        if (isListening) {
          setIsListening(false);
          setIsLoading(false);
          onError('Authentication timed out');
        }
      }, 300000);
      
    } catch (error) {
      console.error('❌ Facebook auth error:', error);
      setIsListening(false);
      onError('Failed to start Facebook authentication');
      setIsLoading(false);
    }
  };

  const promptGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Auto Google Auth...');
      setIsLoading(true);
      
      // Check for stored token first
      const storedToken = getStoredToken('google');
      if (storedToken) {
        console.log('✅ Using stored Google token');
        await handleToken(storedToken, 'google');
        return;
      }

      // Try both deep link and HTTPS redirect URIs
      const deepLinkUri = `${Linking.createURL('')}oauth/google`;
      const httpsUri = 'https://auth.expo.io/@zian17/gesturbee';
      console.log('🔗 Deep link URI:', deepLinkUri);
      console.log('🔗 HTTPS URI:', httpsUri);
      
      // Use HTTPS URI for now (already registered with Google)
      const redirectUri = httpsUri;
      
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES.join(' '))}`;

      // Start listening for URL
      setIsListening(true);
      console.log('👂 Listening for OAuth redirect...');
      
      // Open auth URL
      await WebBrowser.openBrowserAsync(authUrl);
      
      // Set timeout to stop listening after 5 minutes
      setTimeout(() => {
        if (isListening) {
          setIsListening(false);
          setIsLoading(false);
          onError('Authentication timed out');
        }
      }, 300000);
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      setIsListening(false);
      onError('Failed to start Google authentication');
      setIsLoading(false);
    }
  };

  const extractTokenFromUrl = (url: string): string | null => {
    try {
      console.log('🔍 Extracting token from:', url.substring(0, 100) + '...');
      
      // Try multiple extraction patterns
      const patterns = [
        /access_token=([^&\s#]+)/,
        /#access_token=([^&\s]+)/,
        /token=([^&\s#]+)/,
        /access_token%3D([^&\s%]+)/  // URL encoded
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          if (token.length > 50) {
            console.log(`✅ Extracted token (${token.length} chars):`, token.substring(0, 30) + '...');
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
      setIsListening(false);
    }
  };

  return {
    promptFacebookAuth,
    promptGoogleAuth,
    clearStoredToken
  };
};