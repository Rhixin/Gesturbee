// Helper function to extract access token from the URL you showed me:
// https://auth.expo.io/@zian17/gesturbee#access_token=EAAOaQbOgfSE...

export const extractTokenFromUrl = (url: string): string | null => {
  try {
    console.log('🔍 Extracting token from URL:', url);
    
    // The URL format: https://auth.expo.io/@zian17/gesturbee#access_token=TOKEN&other_params
    if (url.includes('#access_token=')) {
      const fragment = url.split('#')[1];
      console.log('Fragment:', fragment);
      
      const params = new URLSearchParams(fragment);
      const token = params.get('access_token');
      
      console.log('✅ Extracted token:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    }
    
    console.log('❌ No access_token found in URL');
    return null;
  } catch (error) {
    console.error('❌ Error extracting token:', error);
    return null;
  }
};

// Test function - you can paste the URL you got manually
export const testTokenExtraction = () => {
  const testUrl = "https://auth.expo.io/@zian17/gesturbee#access_token=EAAOaQbOgfSEBPDmoNrqZC5xHZAHAT7hh8RdOx6tYSZAcTbqZBaJU3wUmpNMEQoYoYgio0s19AZBikSMi9h2MFe66c4ZCzQ0UaFThndZCqktWKLB7DDJPU86MdKd4CYWEkFefX9opoUy4tJ4mO6bJTtxMcXJz497ZCau0eRdkm4ZA7cd7TbtRDIUMCMlRAvmAnyF66o8iMgCLUeibxxKFdLa8Wl21Dy8SSTaQQtTcIT48qn8V5eVXZCKVLUhJEu2oCL5gZDZD&data_access_expiration_time=1760890460&expires_in=6340";
  
  const token = extractTokenFromUrl(testUrl);
  console.log('Test extraction result:', token);
  return token;
};