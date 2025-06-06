# Supabase Migration Guide

This guide will help you migrate your Dodgers Win app from using local `game-data.json` and Vercel Edge Config to a fully remote Supabase database solution.

## Why Migrate to Supabase?

- **Remote Data Storage**: No more local JSON files that don't work on Vercel
- **Automated Email Management**: Subscribers are stored in the database, not Edge Config
- **Email Logging**: Track which emails were sent and their status
- **Scalability**: Handle more subscribers and game data efficiently
- **Real-time Updates**: Potential for real-time features in the future

## What's Changed

### Before (Local + Edge Config)
- Game data stored in `public/game-data.json`
- Subscribers managed via Vercel Edge Config (read-only from app)
- Manual subscriber management
- No email delivery tracking

### After (Supabase)
- Game data stored in `game_data` table
- Subscribers stored in `subscribers` table
- Email logs stored in `email_logs` table
- Fully automated subscriber management
- Complete email delivery tracking

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be ready (usually 1-2 minutes)

### 2. Set Up Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql` into the editor
3. Click "Run" to create all the necessary tables and indexes

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Add these to your environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Update Vercel Environment Variables

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Add the Supabase environment variables
4. Keep your existing `RESEND_API_KEY` and `CRON_SECRET`

### 5. Migrate Existing Data (Optional)

If you have existing game data in `game-data.json`, you can migrate it:

```bash
# Set your environment variables first
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run the migration script
node scripts/migrate-to-supabase.js
```

### 6. Deploy Your Updated App

1. Commit all the changes to your repository
2. Push to your main branch
3. Vercel will automatically deploy the updated app

## Database Schema

### `game_data` Table
- `id`: Primary key
- `did_win`: Boolean indicating if Dodgers won
- `game_info`: Description of the game
- `game_id`: Unique identifier for each game
- `last_updated`: When the record was last updated
- `last_home_win`: When the last home win occurred
- `email_sent`: Whether emails were sent for this game
- `emails_sent`: Number of emails successfully sent
- `created_at`: When the record was created

### `subscribers` Table
- `id`: Primary key
- `email`: Subscriber's email address (unique)
- `subscribed_at`: When they subscribed
- `active`: Whether the subscription is active
- `created_at`: When the record was created

### `email_logs` Table
- `id`: Primary key
- `game_id`: Reference to the game
- `subscriber_email`: Email address that received the email
- `sent_at`: When the email was sent
- `status`: 'sent' or 'failed'
- `error_message`: Error details if failed
- `created_at`: When the record was created

## New Features

### Automated Subscriber Management
- Users can subscribe/unsubscribe directly through the app
- No more manual Edge Config updates
- Duplicate email prevention
- Reactivation of previously unsubscribed users

### Email Delivery Tracking
- Every email attempt is logged
- Track success/failure rates
- Debug email delivery issues
- Prevent duplicate emails for the same game

### Better Game Data Management
- Automatic duplicate prevention using `game_id`
- Historical game data storage
- Better tracking of email sending status

## API Changes

### New Endpoints
- `GET /api/game-data` - Fetches latest game data from Supabase
- All existing webhook and cron endpoints updated to use Supabase

### Updated Functions
- `addSubscriber()` - Now directly adds to database
- `getActiveSubscribers()` - Fetches from database
- `sendWinEmails()` - Includes email logging

## Testing

After deployment, test these features:

1. **Subscribe to newsletter** - Should add email to database
2. **Game data display** - Should show data from Supabase
3. **Email sending** - Test via admin panel or webhook
4. **Cron job** - Should update game data in Supabase

## Monitoring

You can monitor your app through:

1. **Supabase Dashboard** - View all data and logs
2. **Vercel Logs** - Application logs and errors
3. **Email Logs Table** - Track email delivery success/failure

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Make sure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel

2. **Database Connection Errors**
   - Verify your Supabase project is active
   - Check that the database tables were created correctly

3. **Email Sending Issues**
   - Ensure `RESEND_API_KEY` is still set
   - Check email logs in the `email_logs` table

4. **Migration Issues**
   - Run the migration script locally first
   - Check Supabase logs for any errors

### Getting Help

If you encounter issues:
1. Check the Vercel function logs
2. Check the Supabase logs in your dashboard
3. Verify all environment variables are set correctly

## Security Notes

The current setup uses Row Level Security (RLS) with public access policies. For production, you may want to:

1. Implement proper authentication
2. Restrict database access based on user roles
3. Add rate limiting for API endpoints
4. Use Supabase's built-in auth system

## Next Steps

After successful migration, consider:

1. **Real-time Updates** - Use Supabase's real-time features
2. **Analytics Dashboard** - Build admin views using the logged data
3. **Email Templates** - Enhance email designs
4. **Mobile App** - Use the same Supabase backend for a mobile app 