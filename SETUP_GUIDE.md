# EchoFlow Setup Guide

This guide will walk you through setting up EchoFlow locally and deploying it to Vercel.

## 📋 What You Need

1. **Supabase Account** - Free tier works perfectly
2. **Node.js 18+** - Already installed on your system
3. **Vercel Account** - For deployment (free)

## 🔧 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Fill in:
   - **Name**: EchoFlow (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### Step 2: Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from this project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

This creates:
- 11 tables (profiles, categories, services, bookings, reviews, messages, provider_locations, availability, notifications, favorites, service_areas)
- Row Level Security policies
- Triggers for automatic updates
- 15 pre-seeded categories

### Step 3: Get Your Credentials

1. In Supabase dashboard, go to **Project Settings** (gear icon bottom left)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

### Step 4: Configure Environment Variables

1. Open `.env.local` file in the project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
NEXT_PUBLIC_APP_NAME=EchoFlow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

### Step 5: Install Dependencies

Open terminal in the project directory:

```bash
cd /home/banez/service-provider-platform-old/echoflow
npm install
```

Wait for installation to complete (~1-2 minutes).

### Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in xxx ms
```

### Step 7: Test the Application

1. Open browser to http://localhost:3000
2. You should see the EchoFlow homepage
3. Click "Sign up" to create an account
4. Register as either Client or Provider
5. Login with your credentials

## 🎯 Testing Features

### Test Registration & Login
1. Go to `/register`
2. Fill in the form
3. Choose role (Client or Provider)
4. Submit
5. Check your email for confirmation (if enabled)
6. Login at `/login`

### Test Service Creation (Provider)
1. Login as a provider
2. Go to Dashboard
3. Create a new service
4. Fill in title, description, price, category
5. Submit

### Test Search (Client)
1. Login as a client
2. Go to `/search`
3. Browse services
4. Use filters (category, price, city)
5. Click on a service to view details

### Test Real-Time Chat
1. Open two different browsers (or incognito window)
2. Login as different users
3. Go to `/messages`
4. Send messages back and forth
5. Messages should appear instantly

### Test Map View
1. Go to `/map`
2. Allow location access when prompted
3. See your location on the map
4. If providers are online, see their markers

## 🚀 Deploy to Vercel

### Option 1: Via GitHub (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial EchoFlow setup"
git branch -M main
# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/echoflow.git
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your echoflow repository
   - Configure:
     - Framework Preset: **Next.js**
     - Root Directory: **./**
     - Build Command: **next build**
     - Output Directory: **.next**
   
3. **Add Environment Variables** in Vercel:
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
     NEXT_PUBLIC_APP_NAME = EchoFlow
     NEXT_PUBLIC_APP_URL = https://your-app-name.vercel.app
     ```

4. Click **Deploy**
5. Wait 2-3 minutes for deployment

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --yes

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

## 🔐 Enable OAuth (Optional)

To enable Google/GitHub login:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Configure consent screen
6. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret
8. In Supabase: Authentication → Providers → Google
9. Paste credentials and enable

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Homepage URL: Your app URL
4. Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and generate Client Secret
6. In Supabase: Authentication → Providers → GitHub
7. Paste credentials and enable

## 📱 Mobile Testing

The app is fully responsive. Test on mobile by:

1. Opening DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device
4. Test all features

Or use your phone on the same network:
- Find your computer's IP: `ip addr` (Linux) or `ipconfig` (Windows)
- Access: `http://YOUR_IP:3000`

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Supabase connection errors
- Check `.env.local` has correct values
- Ensure no extra spaces in URLs
- Restart dev server after changing env vars

### Map not loading
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Try clearing browser cache

### Real-time not working
- Check Supabase Realtime is enabled
- Verify RLS policies allow access
- Check browser console for subscription errors

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Test `npm run build` locally first

## 📞 Getting Help

If you encounter issues:

1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Review Supabase logs in dashboard
4. Check Vercel deployment logs
5. Review this guide step-by-step

## ✅ Final Checklist

Before considering setup complete:

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Dev server running without errors
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can view homepage
- [ ] Can navigate to search page
- [ ] Can view map (if location enabled)
- [ ] Can send messages (test with 2 accounts)
- [ ] Build succeeds (`npm run build`)
- [ ] Deployed to Vercel (optional)

## 🎉 You're Done!

Your EchoFlow platform is now ready. Start customizing:
- Update colors in `tailwind.config.ts`
- Modify components in `/components`
- Add new features to pages
- Customize the logo and branding

Happy building! 🚀
