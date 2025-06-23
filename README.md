# Endometriosis Symptom Tracker

A comprehensive web application for tracking endometriosis symptoms with AI-powered predictions and real-time data synchronization, powered entirely by Supabase.

## 🚀 Quick Setup

### 1. Supabase Configuration

**IMPORTANT**: You need to configure Supabase before the app will work properly.

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to be ready

2. **Get Your Credentials**:
   - In your Supabase dashboard, go to **Settings > API**
   - Copy your **Project URL** and **anon public key**

3. **Update Environment Variables**:
   - Open the `.env` file in the project root
   - Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

4. **Enable Authentication Providers**:
   - In your Supabase dashboard, go to **Authentication > Providers**
   - Enable **Email** provider
   - Optionally enable **Google** provider for OAuth

5. **Run Database Migrations**:
   - In your Supabase dashboard, go to **SQL Editor**
   - Run these migration files in order:
     1. `supabase/migrations/20250623202408_mute_block.sql`
     2. `supabase/migrations/20250623202420_green_tree.sql`
     3. `supabase/migrations/20250623202427_silver_shape.sql`
     4. `supabase/migrations/20250623205204_morning_cake.sql`

### 2. Install and Run

```bash
npm install
npm run dev
```

## 🔧 Troubleshooting

### "Connection: Failed" Error

This usually means your Supabase configuration is incorrect:

1. **Check Environment Variables**:
   - Ensure `.env` file has correct Supabase URL and key
   - Restart the dev server after changing `.env`

2. **Verify Database Tables**:
   - Check if migrations ran successfully in Supabase dashboard
   - Tables should exist: `symptom_entries`, `user_progress`

3. **Test Connection**:
   - Open browser console to see detailed error messages
   - Look for specific error codes or messages

### Common Issues

- **"relation does not exist"**: Database migrations haven't been run
- **"Invalid API key"**: Wrong anon key in `.env` file
- **"JWT expired"**: Authentication issue, try signing out and back in
- **"invalid input syntax for type uuid"**: Run the latest migration to fix user_id type issues

## 📊 Features

- **Supabase Authentication**: Email/password and Google OAuth
- **Real-time Symptom Tracking**: Log daily symptoms with instant sync
- **AI Predictions**: Machine learning analysis of symptom patterns
- **Calendar Interface**: Visual tracking with FullCalendar
- **Progress Monitoring**: Track completion and patterns over time
- **Demo Data**: Pre-built scenarios for testing and demonstration
- **Real-time Sync**: Supabase for instant data updates across devices
- **Row Level Security**: Secure, user-specific data access

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth (replaces Firebase Auth)
- **Calendar**: FullCalendar
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # React components
├── lib/                # Supabase utilities and database functions
├── utils/              # Helper functions and dummy data
└── types/              # TypeScript interfaces

supabase/
└── migrations/         # Database schema migrations
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User-specific data access only
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- Real-time subscriptions with proper authorization

## 🚀 Deployment

The app is ready for deployment to:
- Vercel
- Netlify
- Railway
- Any static hosting service

Make sure to set environment variables in your deployment platform.

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure all migrations have been run
4. Check that environment variables are set correctly
5. Verify authentication providers are enabled in Supabase

## 🎯 Demo Features

Use the demo panel (bottom-right corner) to:
- Load complete May 2024 sample data
- Test different risk scenarios
- Add random symptom data
- Clear all data for fresh start

## 🔄 Migration from Firebase

This version has completely replaced Firebase with Supabase:

- **Authentication**: Now uses Supabase Auth instead of Firebase Auth
- **Database**: Uses Supabase PostgreSQL instead of Firestore
- **Real-time**: Uses Supabase real-time subscriptions
- **Security**: Uses Supabase RLS instead of Firestore rules

## 🌟 Supabase Benefits

- **Real-time subscriptions**: Instant UI updates across devices
- **PostgreSQL**: More powerful queries and data relationships
- **Built-in auth**: No need for separate authentication service
- **Row Level Security**: Database-level security policies
- **Edge functions**: Serverless functions (future enhancement)
- **Storage**: Built-in file storage (future enhancement)

---

**Note**: This is a health tracking tool for informational purposes only. Always consult healthcare professionals for medical advice.