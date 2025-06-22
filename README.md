# SignRequest Demo

A streamlined demo showing SignRequest document embedding with Supabase Edge Functions.

## Quick Setup

Since your Supabase project is already configured with the database, Edge Function, and secrets, you just need to:

1. **Update Environment Variables**
   - Copy your Supabase Project URL and anon key from your Supabase dashboard
   - Update the `.env` file with your actual values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. **Run the Demo**
   ```bash
   npm run dev
   ```

That's it! The demo will automatically load a SignRequest document when you open it.

## What This Demo Shows

- ✅ **Automatic Document Creation**: Creates a new SignRequest document using your template
- ✅ **Live Embed**: Shows the actual SignRequest signing interface
- ✅ **Real-time Status**: Displays loading states and error handling
- ✅ **Production Ready**: Uses secure Supabase Edge Functions

## Your Current Configuration

- **Database**: `document_signatures` table with RLS policies ✅
- **Edge Function**: `create-signrequest-document` deployed ✅
- **Secrets**: API key and template ID configured ✅
- **Template**: Subscription agreement template ready ✅

## Features

- Clean, professional interface focused on the SignRequest embed
- Automatic document loading on page load
- Reload functionality to create new documents
- Comprehensive error handling and status display
- Responsive design that works on all devices

## Test Signer Details

The demo uses these test values:
- **Email**: test.signer@example.com
- **Name**: John Doe Test
- **User ID**: test-user-12345

Each time you reload, a new document is created for signing.