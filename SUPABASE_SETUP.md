# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Turkish Math Book application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - Project name: `turkish-mathbook` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon/public key** (under "Project API keys")

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   ⚠️ **Important**: Never commit the `.env` file to version control!

## Step 4: Configure Supabase Authentication

### Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and password reset emails

### Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL** (e.g., `http://localhost:5173` for development)
3. Add **Redirect URLs**:
   - Development: `http://localhost:5173/**`
   - Production: `https://yourdomain.com/**`

### Email Confirmation Settings

By default, Supabase requires email confirmation for new signups. You can change this:

1. Go to **Authentication** → **Settings**
2. Find "Email confirmation" settings
3. Choose your preferred option:
   - **Enabled**: Users must confirm their email (recommended for production)
   - **Disabled**: Users can sign in immediately (useful for development)

## Step 5: Optional - Create Database Policies

If you want to store user data in Supabase, you'll need to set up Row Level Security (RLS):

1. Go to **Table Editor** in your Supabase dashboard
2. Create a table (e.g., `user_profiles`)
3. Go to **Authentication** → **Policies**
4. Enable RLS and create policies for your table

Example policy to allow users to read their own data:
```sql
CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);
```

## Step 6: Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`
3. Try signing up with a test email
4. Check your email for the confirmation link (if email confirmation is enabled)
5. Try signing in and accessing the protected routes

## Troubleshooting

### "Invalid API key" error
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the `.env` file
- Make sure there are no extra spaces or quotes
- Restart your development server after updating the `.env` file

### Email not sending
- Check your Supabase email settings in **Authentication** → **Email Templates**
- For development, consider disabling email confirmation
- Check your spam folder
- Verify your SMTP settings if using a custom email provider

### Users can't access protected routes
- Make sure the user has confirmed their email (if confirmation is enabled)
- Check the browser console for authentication errors
- Verify the user session in Supabase dashboard under **Authentication** → **Users**

### CORS errors
- Make sure your Site URL is configured correctly in Supabase
- Check that redirect URLs include your development and production domains

## Security Best Practices

1. **Never commit `.env` files** - Add `.env` to your `.gitignore`
2. **Use environment variables** - Store all sensitive data in environment variables
3. **Enable RLS** - Always use Row Level Security for database tables
4. **Use HTTPS in production** - Never use HTTP for authentication in production
5. **Rotate keys regularly** - Periodically rotate your Supabase API keys
6. **Monitor auth logs** - Check authentication logs in Supabase dashboard regularly

## Production Deployment

When deploying to production:

1. Add your production environment variables to your hosting platform
2. Update the Site URL in Supabase to your production domain
3. Add production redirect URLs
4. Enable email confirmation for security
5. Consider implementing rate limiting for authentication endpoints

## Additional Features

### OAuth Providers

To add social login (Google, GitHub, etc.):

1. Go to **Authentication** → **Providers**
2. Enable and configure the OAuth provider you want
3. Add the provider's credentials (Client ID, Client Secret)
4. Update your code to use `supabase.auth.signInWithOAuth()`

### Multi-factor Authentication

To enable MFA:

1. Go to **Authentication** → **Settings**
2. Enable "Multi-Factor Authentication"
3. Implement MFA UI in your application using Supabase MFA APIs

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter any issues:
- Check the [Supabase Discord](https://discord.supabase.com)
- Visit the [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
- Review the [Supabase Documentation](https://supabase.com/docs)