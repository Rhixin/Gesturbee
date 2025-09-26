# OAuth Setup Guide for GesturBee

## Problem Solved
- Fixed Expo Go `exp://` URI scheme issue that OAuth providers reject
- Using Expo's auth proxy service which provides HTTPS URLs

## OAuth Provider Configuration

### Google OAuth Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID: `971818626439-jhdf8m930fkhjsah7u94bo68rr981apl.apps.googleusercontent.com`
4. Add this **Authorized redirect URI**:
   ```
   https://auth.expo.io/@zian17/Gesturbee
   ```

### Facebook Developer Console
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app with ID: `1014031907323169`
3. Navigate to: Facebook Login → Settings
4. Add this **Valid OAuth Redirect URI**:
   ```
   https://auth.expo.io/@zian17/Gesturbee
   ```

## How It Works

1. **Web Browser Opens**: OAuth providers see HTTPS URLs from Expo's proxy
2. **User Authenticates**: Standard OAuth flow in web browser
3. **Redirect Handled**: Expo proxy redirects back to your app
4. **Token Extracted**: App extracts tokens from the redirect URL
5. **Backend Called**: Tokens sent to your backend for verification

## Testing

1. Run your app: `npm start`
2. Click Google/Facebook login buttons
3. Web browser should open with OAuth provider
4. After authentication, you should return to your app

## Troubleshooting

- **"Invalid redirect URI"**: Make sure you added the exact URIs above
- **"App not verified"**: For development, you can continue with unverified app
- **"Popup blocked"**: Make sure popups are allowed in your browser
- **No response**: Check your backend logs for token verification issues

## Files Modified

- `hooks/useWebOAuth.ts` - New web-based OAuth implementation
- `api/oauth-config.ts` - Added 'openid' scope for Google
- `app/login.tsx` - Updated to use web OAuth hooks
- `app.json` - Updated scheme to `com.softeng.gesturbee`

## Production Notes

For production builds, you'll want to:
1. Create custom redirect URIs like `com.softeng.gesturbee://auth/google`
2. Remove the proxy-based URIs
3. Test thoroughly on physical devices