# Development Build OAuth Setup Guide

## 🎯 Build Status
**Build URL**: https://expo.dev/accounts/zian17/projects/Gesturbee/builds/55e7f787-da0b-4f60-a784-88131cf5aa74

## ✅ After Build Completes

### 1. Download and Install
- Download the `.apk` file from the build URL above
- Install it on your Android device
- **Uninstall Expo Go** or don't use it for this project anymore

### 2. Update OAuth Provider Redirect URIs

#### Facebook Developer Console
1. Go to [Facebook Developers](https://developers.facebook.com/apps/1014031907323169/fb-login/settings/)
2. Navigate to **Facebook Login** → **Settings**
3. **Add this redirect URI**:
   ```
   com.softeng.gesturbee://auth/facebook
   ```
4. **Keep your existing URIs** for backup
5. Click **Save Changes**

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `971818626439-jhdf8m930fkhjsah7u94bo68rr981apl.apps.googleusercontent.com`
3. Click **Edit**
4. Under **Authorized redirect URIs**, **add**:
   ```
   com.softeng.gesturbee://auth/google
   ```
5. **Keep your existing URIs** for backup
6. Click **Save**

### 3. Test OAuth
1. Open your development build app (not Expo Go!)
2. Go to login screen
3. Click Facebook or Google icons
4. Should open browser → authenticate → redirect back to your app automatically
5. Check console logs for success/error details

## 🔧 Why This Works

**Development Build Benefits:**
- ✅ **Native redirect URIs**: `com.softeng.gesturbee://` URLs work
- ✅ **Proper app integration**: OAuth providers can redirect to your actual app
- ✅ **No Expo Go limitations**: Full native app capabilities
- ✅ **Production-ready**: Same as how your published app will work

**Redirect Flow:**
1. User clicks OAuth button
2. Browser opens with OAuth provider
3. User authenticates
4. Provider redirects to `com.softeng.gesturbee://auth/facebook`
5. Your app receives the redirect and processes the token
6. User is logged in successfully

## 🚀 Expected Results

**Console logs should show:**
```
🚀 Starting Facebook Auth in Dev Build...
Redirect URI: com.softeng.gesturbee://auth/facebook
🔍 Facebook Dev Build Response: {type: "success", params: {...}}
✅ Facebook Success! Params: {access_token: "..."}
🎉 Got Facebook token in dev build: EAAOaQbOgfSE...
📤 Sending Facebook token to backend...
📥 Backend response: {...}
Facebook Backend Success: {...}
```

## 🐛 Troubleshooting

**If OAuth still doesn't work:**
1. Check that you added the correct redirect URIs to both providers
2. Make sure you're using the development build app (not Expo Go)
3. Check console logs for specific error messages
4. Verify your backend is running and accessible

**Common Issues:**
- ❌ Still using Expo Go instead of development build
- ❌ Didn't add redirect URIs to OAuth providers
- ❌ Backend is not running or returning errors
- ❌ Network issues preventing API calls

## 📱 App Installation Notes

**After downloading the APK:**
1. Enable "Install unknown apps" in Android settings if needed
2. Install the APK file
3. The app icon should appear in your app drawer
4. Open the development build app (not Expo Go!)
5. OAuth should work perfectly

**Development vs Production:**
- This development build includes debugging tools
- OAuth works exactly like it will in production
- You can still hot-reload code changes
- Perfect for testing OAuth integration