# 🚀 Deployment Guide for AI-Powered Virtual Chemistry Lab

This guide will help you deploy your chemistry lab application to production.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured in `.env.local`
- [ ] Application builds successfully with `npm run build`
- [ ] Database is accessible from the internet (MongoDB Atlas)
- [ ] Clerk authentication is configured for production domain
- [ ] Google Gemini API key is active and has quota

## 🌐 Deploying to Vercel (Recommended)

### Step 1: Prepare Your Repository
```bash
# Ensure your code is committed and pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Choose "Next.js" as the framework preset

### Step 3: Configure Environment Variables
In the Vercel dashboard, add these environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx

# Google Gemini AI
GEMINI_API_KEY=your_production_gemini_key

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/chemistry-lab

# Production URLs
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 4: Update Clerk Settings
1. Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to your application
3. Update the "Allowed origins" to include your Vercel domain
4. Update redirect URLs to match your production domain

### Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Test your application at the provided URL

## 🔧 Custom Domain Setup

### Add Custom Domain in Vercel
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Update Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📊 Database Setup (MongoDB Atlas)

### Production Database
1. Create a production cluster in MongoDB Atlas
2. Configure network access (allow all IPs: 0.0.0.0/0)
3. Create a database user with read/write permissions
4. Get the connection string for your application

### Seed Production Database
```bash
# Set your production MongoDB URI
export MONGODB_URI="your_production_mongodb_uri"

# Run the seeding script
npm run seed
```

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different API keys for development and production
- Rotate API keys regularly

### Database Security
- Use strong passwords for database users
- Enable MongoDB authentication
- Restrict network access when possible
- Regular backups

### API Rate Limiting
- Monitor Gemini API usage
- Implement client-side caching
- Add request throttling if needed

## 🚀 Alternative Deployment Options

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in site settings

### Railway
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### DigitalOcean App Platform
1. Create a new app from GitHub
2. Configure build settings
3. Add environment variables
4. Deploy

## 📈 Performance Optimization

### Image Optimization
- Use Next.js Image component for optimized loading
- Implement lazy loading for chemical element images

### Caching
- Enable Redis for session caching
- Cache frequent database queries
- Implement CDN for static assets

### Monitoring
- Set up Vercel Analytics
- Monitor API response times
- Track user engagement metrics

## 🐛 Troubleshooting Common Issues

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building locally
npm run build
```

### Environment Variable Issues
- Ensure all required variables are set
- Check for typos in variable names
- Verify API keys are valid

### Database Connection Issues
- Check MongoDB connection string
- Verify network access settings
- Test connection from deployment platform

### Authentication Issues
- Update Clerk allowed origins
- Verify redirect URLs
- Check environment variable formatting

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Clerk Production Setup](https://clerk.dev/docs/deployments/production)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## 🎯 Post-Deployment Testing

1. **Authentication Flow**
   - Test sign up/sign in
   - Verify social logins work
   - Check redirect URLs

2. **Lab Functionality**
   - Test element drag and drop
   - Verify AI predictions work
   - Check parameter controls

3. **Database Operations**
   - Ensure experiments save correctly
   - Verify user profiles work
   - Test data persistence

4. **Performance**
   - Check page load speeds
   - Test on mobile devices
   - Verify API response times

---

**Congratulations! Your Chemistry Lab is now live! 🧪🎉**
