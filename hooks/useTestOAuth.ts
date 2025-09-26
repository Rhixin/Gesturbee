import AuthService from '@/api/services/auth-service';
import { extractTokenFromUrl, testTokenExtraction } from '@/utils/extractTokenFromUrl';

// Test OAuth with the actual token you received
export const useTestOAuth = (onSuccess: any, onError: any, setIsLoading: any) => {
  
  const testFacebookWithActualToken = async () => {
    try {
      console.log('🧪 Testing Facebook with your actual token...');
      setIsLoading(true);
      
      // Use the exact token from your URL
      const testToken = "EAAOaQbOgfSEBPDmoNrqZC5xHZAHAT7hh8RdOx6tYSZAcTbqZBaJU3wUmpNMEQoYoYgio0s19AZBikSMi9h2MFe66c4ZCzQ0UaFThndZCqktWKLB7DDJPU86MdKd4CYWEkFefX9opoUy4tJ4mO6bJTtxMcXJz497ZCau0eRdkm4ZA7cd7TbtRDIUMCMlRAvmAnyF66o8iMgCLUeibxxKFdLa8Wl21Dy8SSTaQQtTcIT48qn8V5eVXZCKVLUhJEu2oCL5gZDZD";
      
      console.log('🎯 Testing with token:', testToken.substring(0, 20) + '...');
      
      const authResult = await AuthService.facebookLogin(testToken);
      console.log('✅ Backend success with your token:', authResult);
      
      await onSuccess(authResult.user, authResult.token);
    } catch (error) {
      console.error('❌ Backend error with your token:', error);
      onError('Backend failed with your token: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenExtract = () => {
    console.log('🧪 Testing token extraction...');
    testTokenExtraction();
  };

  return { 
    testFacebookWithActualToken,
    testTokenExtract 
  };
};