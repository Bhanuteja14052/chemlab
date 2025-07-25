# 🔐 Email + Google Authentication Setup for Chemistry Lab

## ✅ Clerk Dashboard Configuration Checklist

### **Step 1: Authentication Methods**
**Location**: User & Authentication → Email, Phone, Username

```
✅ Email address
   - Set as: Required
   - Verify email address: ✅ ON
   - Verify at sign-up: ✅ ON

✅ Password  
   - Set as: Required
   - Minimum length: 8 characters
   - Require uppercase: Optional
   - Require numbers: Optional
   - Require symbols: Optional

❌ Phone number: OFF
❌ Username: OFF
```

### **Step 2: Google Social Login**
**Location**: User & Authentication → Social Connections

```
✅ Google: ON
   - Click "Configure" after enabling
   - You'll need Google OAuth credentials
```

### **Step 3: User Profile Fields**
**Location**: User & Authentication → Personal Information

```
✅ First name: Required
✅ Last name: Required
✅ Profile image: Optional (Recommended for better UX)
```

### **Step 4: Email Settings**
**Location**: Messaging → Email

```
✅ Email verification: ON
✅ Welcome email: ON  
✅ Password reset: ON
```

### **Step 5: Security Settings**
**Location**: User & Authentication → Attack Protection

```
✅ Bot protection: ON
✅ Rate limiting: ON
Session timeout: 24 hours (good for students)
```

## 🌐 Google OAuth Setup (Required for Google Login)

### **Create Google Cloud Project:**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create New Project**: 
   - Name: `Chemistry Lab Auth`
   - Click "Create"

3. **Enable APIs**:
   - Go to APIs & Services → Library
   - Search "Google+ API" → Enable
   - Search "People API" → Enable

4. **OAuth Consent Screen**:
   - Go to APIs & Services → OAuth consent screen
   - Choose "External"
   - Fill required fields:
     ```
     App name: AI Chemistry Lab
     User support email: your-email@domain.com
     Developer contact: your-email@domain.com
     ```
   - Scopes: Add `email` and `profile`

5. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Chemistry Lab Web Client"
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-app.vercel.app
   ```
   
   **Authorized redirect URIs:**
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   ```

6. **Copy Credentials**:
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxx`

### **Add to Clerk Dashboard:**

1. Go back to Clerk → Social Connections → Google
2. Paste your Client ID and Client Secret
3. Click "Save"

## 🎯 User Experience Flow

With this setup, your chemistry lab users will experience:

### **New User Registration:**
1. **Visit**: `/sign-up`
2. **Choose**: Email/Password OR "Continue with Google"
3. **If Email**: Fill form → Verify email → Access dashboard
4. **If Google**: Google login → Access dashboard immediately

### **Returning User Login:**
1. **Visit**: `/sign-in`  
2. **Choose**: Email/Password OR "Continue with Google"
3. **Access**: Dashboard immediately

### **Profile Information:**
- **From Email signup**: User enters first name, last name, email
- **From Google**: Auto-populated from Google account
- **Profile image**: Optional but enhances the chemistry lab experience

## 🧪 Perfect for Chemistry Lab Because:

✅ **Students love Google login** (most have school Google accounts)
✅ **Email verification** ensures legitimate educational users
✅ **Simple signup flow** reduces barriers to chemistry experimentation
✅ **Secure authentication** protects student experiment data
✅ **Professional appearance** builds trust for educational platform

## 🔧 Environment Variables

After setup, your `.env.local` should look like:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx

# Other APIs
GEMINI_API_KEY=your_gemini_key
MONGODB_URI=your_mongodb_uri

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🧪 Testing Your Setup

### **Test Email Authentication:**
```bash
npm run dev
```
1. Go to `http://localhost:3000/sign-up`
2. Create account with email/password
3. Check email for verification
4. Verify you're redirected to `/dashboard`

### **Test Google Authentication:**
1. Go to `http://localhost:3000/sign-in`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Verify you're redirected to `/dashboard`
5. Check that profile info is auto-populated

## 🚨 Common Issues & Solutions

### **Google OAuth Not Working:**
- Verify redirect URI is exactly: `https://accounts.clerk.dev/v1/oauth_callback`
- Check OAuth consent screen is configured
- Ensure Google+ API is enabled

### **Email Verification Not Sending:**
- Check spam folder
- Try different email provider
- Verify email settings in Clerk dashboard

### **Users Not Redirecting to Dashboard:**
- Check redirect URLs in Clerk → Paths
- Verify `/dashboard` route exists in your app

---

**Ready for students to start their chemistry journey! 🧪⚗️✨**
