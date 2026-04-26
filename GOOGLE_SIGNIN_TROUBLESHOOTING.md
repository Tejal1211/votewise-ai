# 🔧 Google Sign-In Troubleshooting Guide

## Issue: "Google sign-up failed. Please try again."

Your screenshot shows the error is being caught but not providing helpful debugging information. Here's the complete fix guide.

---

## ✅ What Has Been Fixed

1. **Enhanced Error Messages** ✅
   - Detailed error detection in `AuthContext.jsx`
   - User-friendly error messages in `Signup.jsx` and `Login.jsx`
   - Console logging for debugging

2. **Firebase Configuration Validation** ✅
   - Validates all required env vars on app initialization
   - Throws clear error if config is missing
   - Helps identify setup issues immediately

3. **Graceful Error Handling** ✅
   - Detects popup-blocked errors
   - Handles Firebase initialization errors
   - Shows specific error messages for each scenario

---

## 🚨 Step-by-Step Troubleshooting

### Step 1: Check Your `.env` File

**File:** `frontend/.env`

```bash
# ❌ WRONG - Placeholder values
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com

# ✅ CORRECT - Real values
VITE_FIREBASE_API_KEY=AIzaSyC_-Z-1234567890abcdefghijklmno
VITE_FIREBASE_AUTH_DOMAIN=votewise-prod.firebaseapp.com
```

**Check all required variables:**
```bash
VITE_FIREBASE_API_KEY           ❌ or ✅
VITE_FIREBASE_AUTH_DOMAIN       ❌ or ✅
VITE_FIREBASE_PROJECT_ID        ❌ or ✅
VITE_FIREBASE_STORAGE_BUCKET    ❌ or ✅
VITE_FIREBASE_MESSAGING_SENDER_ID ❌ or ✅
VITE_FIREBASE_APP_ID            ❌ or ✅
VITE_GOOGLE_API_KEY             ❌ or ✅
VITE_GOOGLE_CLIENT_ID           ❌ or ✅
VITE_API_URL                    (Should be http://localhost:5000)
```

---

### Step 2: Enable Firebase Authentication

**In Firebase Console:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Authentication**
3. Click "Get Started"
4. Sign-in method → **Google** → Enable
5. Configure OAuth consent screen:
   - App name: "VoteWise AI"
   - User support email: Your email
   - App logo: (optional)
   - Developer contact: Your email
6. Save

---

### Step 3: Configure Google OAuth Credentials

**In Google Cloud Console:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click "Create Credentials" → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: "VoteWise AI Web"
7. **Authorized origins (important):**
   ```
   http://localhost:5173        (Development)
   http://localhost:3000        (If using different port)
   https://votewise-ai.web.app  (Production Firebase Hosting)
   ```
8. **Authorized redirect URIs:**
   ```
   http://localhost:5173/
   https://votewise-ai.web.app/
   ```
9. Copy **Client ID** to `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

---

### Step 4: Verify Browser Popup Settings

**Common Issue:** Popups are blocked

**Fix:**
1. Click the popup-blocked icon in browser address bar
2. Select "Always allow popups from localhost"
3. Refresh the page
4. Try signing in again

---

### Step 5: Check Browser Console for Errors

**Steps:**
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try signing in again
4. Look for error messages starting with "❌ Google Sign-In Error:"

**Example output you should see:**
```
✅ Google Sign-In successful: user@gmail.com
```

**Or if error:**
```
❌ Google Sign-In Error: {
  code: "auth/popup-blocked",
  message: "Popup blocked. Please allow popups in your browser."
}
```

---

### Step 6: Test Firebase Connection

**Quick Test:**
1. Open `frontend/.env` 
2. Verify each value is **not** a placeholder
3. Run: `npm run dev`
4. Look at console for Firebase init messages
5. Try creating an account

**Expected:**
- No error about missing Firebase config
- Page loads without Firebase validation error
- Can click "Sign up with Google" button

---

### Step 7: Verify Firestore is Enabled

**In Firebase Console:**
1. **Firestore Database** → Click "Create Database"
2. Start in **Production mode**
3. Region: **asia-south1** (nearest to India)
4. Create

**Security rules should be:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## 🔍 Common Error Messages & Fixes

| Error | Cause | Fix |
|---|---|---|
| `auth/popup-blocked` | Browser blocked popup | Allow popups in browser settings |
| `auth/operation-not-supported-in-this-environment` | Firebase not initialized | Check `.env` file values |
| `auth/auth-domain-config-required` | Firebase auth domain not set | Add domain in Firebase console |
| `Firebase configuration invalid` | Env vars are placeholder values | Replace with real Firebase config |
| `Firestore not initialized` | Firestore database not created | Create Firestore in Firebase console |
| No user returned | Google auth failed silently | Check OAuth credentials in Google Cloud |

---

## 📋 Checklist for Success

Before testing, verify all of these:

- ✅ `frontend/.env` has all 8 VITE_FIREBASE_* variables filled with **real values**
- ✅ Firebase Console → Authentication → Google provider **enabled**
- ✅ Google Cloud Console → OAuth 2.0 credentials created
- ✅ Browser allows popups from localhost
- ✅ Firestore Database created (not just initialized)
- ✅ Browser cache cleared (Ctrl+Shift+Delete)
- ✅ `npm install` completed without errors
- ✅ `npm run dev` runs without Firebase config errors

---

## 🧪 Manual Testing Steps

### Test 1: Signup with Google
```
1. Go to http://localhost:5173/signup
2. Click "Sign up with Google" button
3. Choose Gmail account from popup
4. Should redirect to /dashboard
5. Check browser console for ✅ success message
```

### Test 2: Check Firestore User Profile
```
1. After successful signup, go to Firebase Console
2. Firestore Database → Collections
3. You should see "users" collection
4. Click it, you should see a document with your user UID
5. Document contains: uid, email, displayName, createdAt, language, reminders, chatHistory
```

### Test 3: Logout & Login
```
1. On dashboard, click your profile/logout
2. Go to http://localhost:5173/login
3. Click "Sign in with Google"
4. Choose same Gmail account
5. Should redirect to /dashboard
6. Should load your saved user data
```

### Test 4: Test Forgot Password
```
1. On login page, enter email
2. Click "Forgot your password?"
3. Email input appears
4. Click "Send Reset Email"
5. Should show success message (actual email sent to Gmail)
```

---

## 🚀 Production Deployment Checklist

When ready for deployment:

- ✅ Update `frontend/.env` with production Firebase config
- ✅ Update `VITE_GOOGLE_CLIENT_ID` with production OAuth credentials
- ✅ Add production domain to Google OAuth authorized origins
- ✅ Deploy frontend: `npm run build && firebase deploy --only hosting`
- ✅ Update backend `FRONTEND_URL` env var for production
- ✅ Deploy backend: `gcloud run deploy ...`
- ✅ Test Google sign-in on production URL
- ✅ Monitor Cloud Run logs for errors: `gcloud run logs read votewise-backend --region asia-south1`

---

## 📞 Still Having Issues?

### Debug Mode: Enable Verbose Logging

**File:** `frontend/src/context/AuthContext.jsx`

Add this line after imports:
```javascript
const DEBUG = true;  // Set to true for verbose logging
```

Then update console.log calls to always log:
```javascript
if (DEBUG) console.log("Google Sign-In:", result);
```

### Verify Backend Connection

```bash
# Test backend is running
curl http://localhost:5000/health

# Should return: { status: "ok" }
```

### Check All 8 Environment Variables

Run this in `frontend/` terminal:
```bash
echo $VITE_FIREBASE_API_KEY
echo $VITE_FIREBASE_AUTH_DOMAIN
echo $VITE_FIREBASE_PROJECT_ID
echo $VITE_FIREBASE_STORAGE_BUCKET
echo $VITE_FIREBASE_MESSAGING_SENDER_ID
echo $VITE_FIREBASE_APP_ID
echo $VITE_GOOGLE_API_KEY
echo $VITE_GOOGLE_CLIENT_ID
```

All should show values, not "undefined"

---

## 🎯 What Should Happen (Success Flow)

```
1. User clicks "Sign up with Google"
   ↓
2. Browser popup opens Google login (or shows account chooser)
   ↓
3. User selects Gmail account
   ↓
4. Firebase creates auth user in background
   ↓
5. AuthContext.createUserProfile() creates Firestore doc
   ↓
6. Router redirects to /dashboard
   ↓
7. Dashboard shows user name & profile picture
   ✅ SUCCESS!
```

---

## 📊 Expected Console Output

When everything works:

```
✅ Google Sign-In successful: user@gmail.com
User profile created in Firestore
Dashboard loaded with user data
Chat history: []
Reminders: []
Language: en
```

---

## 🔄 Need Help?

1. Check console (F12) for error messages
2. Compare your `.env` with `.env.example` - ensure NO placeholder values
3. Verify Firebase project ID matches between files
4. Clear browser cache and cookies (Ctrl+Shift+Delete)
5. Restart dev server: Ctrl+C in terminal, then `npm run dev` again

**Google Sign-In should work perfectly once Firebase is properly configured!** 🎉

---

**Last Updated:** April 26, 2026
**Version:** 1.0
