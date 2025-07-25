# 🔑 Google OAuth Setup for Chemistry Lab

## Step-by-Step Google Cloud Console Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** or select existing project
3. Name your project: `chemistry-lab-oauth` (or similar)
4. Click **"Create"**

### 2. Enable Google+ API
1. In your project, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### 3. Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** (for public chemistry lab)
3. Fill out the required fields:

```
App name: AI-Powered Chemistry Lab
User support email: your-email@domain.com
App domain: your-domain.com (or leave blank for now)
Developer contact email: your-email@domain.com
```

4. **Scopes**: Add these scopes:
   - `email` (to get user's email)
   - `profile` (to get user's name and profile picture)

5. **Test users** (optional): Add your email for testing

### 4. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. Name: `Chemistry Lab Web Client`

5. **Authorized JavaScript origins**:
```
http://localhost:3000
https://your-domain.vercel.app (when deployed)
```

6. **Authorized redirect URIs** (IMPORTANT):
```
https://accounts.clerk.dev/v1/oauth_callback
```

7. Click **"Create"**

### 5. Copy Your Credentials
You'll get:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxx`

### 6. Add to Clerk Dashboard
1. Go back to **Clerk Dashboard** → **Social Connections** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **"Save"**

## 🔒 Security Notes
- Keep your Client Secret private
- Never commit it to version control
- Use environment variables for production
- Regularly rotate your credentials

## 🚀 Testing
1. Start your app: `npm run dev`
2. Go to sign-in page
3. Click "Continue with Google"
4. Should redirect to Google login
5. After auth, should return to your app

## 🐛 Common Issues
- **Invalid redirect URI**: Make sure you added the exact Clerk redirect URL
- **OAuth consent screen**: Must be configured before testing
- **Scopes**: Ensure email and profile scopes are enabled
