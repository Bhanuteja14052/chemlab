# ✅ Clerk Dashboard Setup Checklist for Chemistry Lab

## 🎯 Essential Configuration

### 1. Authentication Methods
- [ ] **Email Address** - ✅ Enable (Required)
- [ ] **Password** - ✅ Enable (Required)
- [ ] **Phone Number** - ❌ Disable (Not needed)
- [ ] **Username** - ❌ Disable (Email is sufficient)

### 2. Social Connections
- [ ] **Google** - ✅ Enable (Highly recommended for students)
- [ ] **GitHub** - ⚠️ Optional (Good for developers)
- [ ] **Facebook/Twitter** - ❌ Skip (Not typical for educational apps)

### 3. Personal Information
- [ ] **First Name** - ✅ Require
- [ ] **Last Name** - ✅ Require
- [ ] **Profile Image** - ✅ Optional (Nice UX)

### 4. Email Settings
- [ ] **Email Verification** - ✅ Enable (Essential for students)
- [ ] **Welcome Email** - ✅ Enable (Good user experience)

### 5. Security & Protection
- [ ] **Bot Protection** - ✅ Enable
- [ ] **Session Management** - ✅ Configure (24 hours recommended)

### 6. URLs & Redirects
```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in: /dashboard
After sign-up: /dashboard
```

### 7. Domains
**Development:**
```
http://localhost:3000
```

**Production (when deployed):**
```
https://your-chemistry-lab.vercel.app
```

## 🔑 API Keys Setup

### From Clerk Dashboard → API Keys:
1. Copy **Publishable Key** (starts with `pk_`)
2. Copy **Secret Key** (starts with `sk_`)
3. Add both to your `.env.local` file

### Example .env.local:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
```

## 🌐 Google OAuth Setup (If Enabling)

### In Google Cloud Console:
1. Create new project: "Chemistry Lab OAuth"
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Set redirect URI: `https://accounts.clerk.dev/v1/oauth_callback`

### In Clerk Dashboard:
1. Go to Social Connections → Google
2. Paste Client ID and Client Secret
3. Save configuration

## 🧪 Testing Your Setup

### Test Authentication Flow:
1. Start app: `npm run dev`
2. Go to: `http://localhost:3000/sign-in`
3. Test email/password signup
4. Test Google login (if configured)
5. Verify redirect to dashboard works

### Verify User Data:
1. Sign up with test account
2. Check if first/last name are captured
3. Verify email verification works
4. Test sign-out functionality

## 🚨 Common Issues & Solutions

### "Invalid Publishable Key"
- Check if key is copied correctly
- Ensure it starts with `pk_test_` or `pk_live_`
- Restart development server after adding keys

### "Domain not allowed"
- Add `http://localhost:3000` to allowed domains
- For production, add your Vercel URL

### Google OAuth not working
- Verify OAuth consent screen is configured
- Check redirect URI matches exactly: `https://accounts.clerk.dev/v1/oauth_callback`
- Ensure Google+ API is enabled

### Email verification not sending
- Check spam folder
- Verify email configuration in Clerk
- Test with different email provider

## 🎓 User Experience for Students

With this setup, your chemistry lab users will experience:

1. **Landing page** → Click "Get Started"
2. **Sign-up page** → Choose email/password OR Google
3. **Email verification** → Check email and verify
4. **Welcome** → Redirected to chemistry lab dashboard
5. **Seamless access** → No repeated logins (session management)

## 🔐 Production Checklist

Before deploying:
- [ ] Switch to production Clerk keys (`pk_live_`, `sk_live_`)
- [ ] Add production domain to Clerk
- [ ] Test Google OAuth with production URLs
- [ ] Verify email verification works in production
- [ ] Test user flow end-to-end

---

**Ready to create amazing chemistry experiments! 🧪⚗️**
