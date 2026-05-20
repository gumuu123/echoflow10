# EchoFlow - Local Service Provider Platform

A modern full-stack platform connecting clients with local service providers. Features real-time location tracking, instant messaging, and Supabase integration.

## 🌟 Features

### Core Features
- **Authentication**: Email/password + Social login (Google, GitHub) via Supabase Auth
- **Dual Roles**: Client and Provider accounts with role-based access
- **Service Listings**: Providers can create and manage service offerings
- **Search & Filter**: Advanced filtering by category, price, location
- **Booking System**: Complete booking workflow with status tracking
- **Reviews & Ratings**: 5-star rating system with verified reviews

### Real-Time Features
- **Live Location Tracking**: Leaflet.js map with real-time provider location updates (every 10 seconds)
- **Instant Messaging**: Real-time chat between clients and providers using Supabase Realtime
- **Live Notifications**: Instant notifications for bookings, messages, and updates
- **Geolocation API**: Browser geolocation integration for accurate positioning

### Modern UI/UX
- **Thumbtack-Inspired Design**: Clean, modern interface inspired by leading service platforms
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Maps**: Full-screen map view with custom markers
- **Real-Time Chat**: Auto-scrolling chat with message history

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Email + OAuth)
- **Real-Time**: Supabase Realtime subscriptions
- **Maps**: Leaflet.js with react-leaflet
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** 18+ installed
2. **Supabase Account** (free tier works)
3. **Vercel Account** (for deployment)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the contents of `supabase-schema.sql` from this project
5. Paste and run it in the SQL Editor
6. This will create all 11 tables with RLS policies and triggers

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=EchoFlow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these values from your Supabase project:
- Go to **Project Settings** → **API**
- Copy the **Project URL** and **anon public** key

### 4. Enable OAuth Providers (Optional)

For Google/GitHub login:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable Google and/or GitHub
3. Add your OAuth credentials
4. Set authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
echoflow/
├── app/
│   ├── auth/callback/          # OAuth callback handler
│   ├── dashboard/              # User dashboard
│   ├── login/                  # Login page
│   ├── map/                    # Live map view
│   ├── messages/               # Real-time messaging
│   ├── profile/                # User profile
│   ├── register/               # Registration page
│   ├── search/                 # Service search
│   ├── services/[id]/          # Service detail page
│   ├── settings/               # Account settings
│   ├── layout.tsx              # Root layout with Navbar
│   └── page.tsx                # Homepage
├── components/
│   ├── LiveMap.tsx             # Leaflet map component
│   ├── Navbar.tsx              # Navigation with EchoFlow logo
│   ├── RealTimeChat.tsx        # Real-time messaging component
│   └── ServiceCard.tsx         # Service listing card
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Auth middleware
├── middleware.ts               # Route protection middleware
├── supabase-schema.sql         # Complete database schema
└── .env.local.example          # Environment variables template
```

## 🗄️ Database Schema

The application uses 11 tables:

1. **profiles** - User profiles (extends auth.users)
2. **categories** - Service categories (pre-seeded with 15 categories)
3. **services** - Service listings
4. **bookings** - Booking records
5. **reviews** - Reviews and ratings
6. **messages** - Chat messages
7. **provider_locations** - Real-time provider locations
8. **availability** - Provider availability schedules
9. **notifications** - User notifications
10. **favorites** - Client favorite providers
11. **service_areas** - Provider service areas

All tables have Row Level Security (RLS) policies enabled.

## 🔐 Authentication Flow

1. User registers with email/password or OAuth
2. Supabase Auth creates user in `auth.users`
3. Trigger creates profile in `profiles` table
4. Session is stored in cookies
5. Middleware protects routes based on authentication status

## 📍 Real-Time Location Tracking

Providers can share their location in real-time:

1. Provider enables location sharing
2. Browser's Geolocation API gets current position
3. Position is stored in `provider_locations` table
4. Clients see live markers on the map
5. Locations update every 10 seconds via Supabase Realtime

## 💬 Real-Time Messaging

Messages use Supabase Realtime subscriptions:

1. Messages are stored in the `messages` table
2. Both users subscribe to the channel
3. New messages appear instantly without refresh
4. Auto-scroll to latest message
5. Message history is preserved

## 🎨 Design Philosophy

Inspired by Thumbtack's clean, professional design:

- **Color Palette**: Blue primary (#2563EB), clean whites, subtle grays
- **Typography**: Inter font family for readability
- **Components**: Rounded corners, soft shadows, smooth transitions
- **Layout**: Card-based design with clear visual hierarchy
- **Logo**: "Echo" in black, "Flow" in blue (#2563EB)

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/echoflow.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_NAME=EchoFlow
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. Click **Deploy**

### 3. Update OAuth Redirect URLs

After deployment, update your OAuth providers in Supabase:
- Add your Vercel URL to authorized redirect URLs
- Example: `https://echoflow.vercel.app/auth/callback`

## 🧪 Testing Locally

1. Register a new account (no demo accounts needed)
2. Create a provider account to test service creation
3. Create a client account to test booking flow
4. Open two browsers to test real-time messaging
5. Enable location sharing to test map features

## 🔒 Security

- **Row Level Security (RLS)**: All tables protected
- **Middleware**: Route-level authentication checks
- **OAuth**: Secure social login
- **Environment Variables**: Sensitive data never exposed
- **HTTPS**: Enforced in production

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS
