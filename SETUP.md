# Setup Guide

## Fix: "Firebase configuration is missing" Error

If you're seeing the error `Firebase configuration is missing. Please check your .env file`, follow these steps:

### 1. Create Environment File

Copy the example file:
```bash
cp .env.example .env
```

### 2. Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon → **Project settings**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one if you don't have it)
6. Copy all the config values from the `firebaseConfig` object

### 3. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the generated key

### 4. Fill in Your .env File

Open the `.env` file and replace all the placeholder values:

```env
GEMINI_API_KEY=your_actual_gemini_key_here

VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 5. Restart Dev Server

**IMPORTANT:** After creating/updating the `.env` file, you MUST restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

### Common Mistakes

❌ **Forgetting to restart the server** - Vite only loads `.env` on startup
❌ **Missing quotes** - Don't use quotes around values in `.env`
❌ **Wrong variable names** - Firebase variables MUST start with `VITE_`
❌ **Spaces around =** - Use `KEY=value` not `KEY = value`

### Verify It Works

If everything is set up correctly:
- The app should load without errors
- You should be able to sign in with Google
- Firebase authentication should work

### Still Not Working?

1. Check the browser console for error messages
2. Verify all values in `.env` are filled in (no "your_" placeholders)
3. Make sure you restarted the dev server
4. Try clearing browser cache and reloading
