# Admin Panel Setup Guide

This guide will help you set up the admin panel with user role management for the Questioneer application.

## Table of Contents

1. [Overview](#overview)
2. [User Role Hierarchy](#user-role-hierarchy)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Creating Your First Owner Account](#creating-your-first-owner-account)
6. [Using the Admin Panel](#using-the-admin-panel)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Questioneer application now includes a comprehensive admin panel with:

- **User Management**: Create, manage, and delete user accounts
- **Role-Based Access Control**: Three-tier hierarchy (Owner, Admin, User)
- **Statistics Dashboard**: View total books, questions, and success rates
- **Secure Authentication**: Supabase-powered authentication with Row Level Security

### Features Implemented

✅ Signup disabled - Only admins can create accounts  
✅ Three-tier role system (Owner → Admin → User)  
✅ Admin panel with stats dashboard  
✅ User management table with role assignment  
✅ Kick/delete user functionality based on permissions  
✅ Stats webhook integration for analytics  
✅ Translations for English and Turkish  

---

## User Role Hierarchy

### 🔑 Owner (Highest Authority)
- Full system access
- Can manage admin roles
- Can kick admins and users
- Can create any type of account
- Cannot be kicked by anyone

### 🛡️ Admin
- Can create user and admin accounts
- Can manage user roles (not admin or owner roles)
- Can kick users (not admins or owners)
- Access to admin panel and statistics
- Cannot modify other admins

### 👤 User (Basic Access)
- Standard application access
- Can generate content
- Can view their uploaded books
- Cannot access admin panel
- Cannot manage other users

### Permission Matrix

| Action | Owner | Admin | User |
|--------|-------|-------|------|
| Access Admin Panel | ✅ | ✅ | ❌ |
| View Statistics | ✅ | ✅ | ❌ |
| Create Users/Admins | ✅ | ✅ | ❌ |
| Create Owners | ❌ (SQL only) | ❌ | ❌ |
| Change User Roles | ✅ | ✅* | ❌ |
| Change Admin Roles | ✅ | ❌ | ❌ |
| Promote to Owner | ❌ (SQL only) | ❌ | ❌ |
| Kick Users | ✅ | ✅ | ❌ |
| Kick Admins | ✅ | ❌ | ❌ |
| Generate Books | ✅ | ✅ | ✅ |

---

## Database Setup

### Step 1: Run the Migration

The database migration creates the necessary tables and policies for role management.

#### Option A: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase project at https://supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_add_roles.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute

#### Option B: Using Supabase CLI

```bash
cd turkish-mathbook-main
supabase db push
```

### Step 2: Verify the Migration

After running the migration, verify the setup:

```sql
-- Check if the profiles table exists
SELECT * FROM public.profiles LIMIT 5;

-- Check if the user_role enum exists
SELECT enum_range(NULL::user_role);

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### What the Migration Creates

- **`profiles` table**: Stores user information and roles
- **`user_role` enum**: Defines the three role types (owner, admin, user)
- **RLS Policies**: Secures data access based on user roles
- **Triggers**: Automatically creates profiles on user signup
- **Indexes**: Optimizes query performance

---

## Environment Configuration

### Update `.env` File

Add the following environment variables to your `.env` file:

```env
# Existing variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Server-side Admin Operations (Required for user creation)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Webhooks
BOOKS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/books
STATS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/stats

# Server Port (optional)
PORT=7893
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for admin user creation:
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the `service_role` key (NOT the `anon` key)
3. Add it to your `.env` file
4. Restart the server after adding it

### Stats Webhook Setup

The stats webhook should return data in this format:

```json
{
  "total_books": 150,
  "total_questions": 3420,
  "success_rate": 94.5
}
```

**Example n8n Workflow:**
1. HTTP Request node listens for GET requests
2. Query your database for statistics
3. Return JSON with the above structure

---

## Creating Your First Owner Account

### Method 1: Set Existing User as Owner

If you already have a user account:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace with your email):

```sql
UPDATE public.profiles 
SET role = 'owner' 
WHERE email = 'your-email@example.com';
```

### Method 2: Create New Owner Account

1. **Create directly in Supabase**:

```sql
-- First, create the auth user
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Then update the role:

UPDATE public.profiles 
SET role = 'owner' 
WHERE email = 'new-owner@example.com';
```

### Verify Owner Account

```sql
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE role = 'owner';
```

---

## Using the Admin Panel

### Accessing the Admin Panel

1. Sign in with an admin or owner account
2. Click your avatar in the top-right corner
3. Select **"Admin Panel"** from the dropdown
4. Or navigate directly to: `http://localhost:5173/admin`

### Statistics Dashboard

The stats dashboard displays three key metrics:

- **Total Books**: Number of books generated
- **Total Questions**: Questions extracted across all books
- **Success Rate**: Processing success percentage

These stats are fetched from your configured `STATS_WEBHOOK_URL`.

### Creating New Users

1. In the Admin Panel, click **"Create User"**
2. Enter email address
3. Enter password (minimum 6 characters)
4. Select role:
   - **Admin**: For trusted administrators
   - **User**: For regular users
5. Click **"Create User"**

**Note:** The Owner role is NOT available in the admin panel for security reasons. Owner accounts can only be created manually via SQL.

The user will receive an email confirmation (if configured in Supabase).

### Managing User Roles

**As an Owner:**
- Click the role dropdown next to any user
- Select new role (Admin or User only)
- Role is updated immediately
- **Note:** Cannot promote users to Owner via admin panel

**As an Admin:**
- Can only change roles for users (not admins or owners)
- Dropdown will be disabled for admin/owner accounts

### Deleting Users

**As an Owner:**
- Can delete any user except yourself
- Click the trash icon next to the user
- Confirm deletion

**As an Admin:**
- Can only delete regular users
- Cannot delete admins or owners
- Trash icon will not appear for admin/owner accounts

---

## Security Considerations

### 🔒 Best Practices

1. **Limit Owner Accounts**
   - Only create owner accounts for trusted administrators via SQL
   - Keep the number of owners to a minimum (1-2 recommended)
   - Owner role is intentionally NOT available in admin panel UI

2. **Service Role Key Security**
   - Never commit `.env` files to version control
   - Store service role key securely on server only (not in client code)
   - Rotate keys periodically
   - The service role key is now used server-side only for security

3. **Production Setup**
   - User creation now uses server-side API (secure!)
   - Service role key never exposed to client
   - Implement rate limiting for admin actions in production

4. **Regular Audits**
   - Periodically review user roles
   - Check for inactive admin accounts
   - Monitor admin panel access logs

5. **Row Level Security**
   - All policies are enforced at the database level
   - Even with service role key, RLS protects data
   - Regular review of RLS policies recommended

### 🚨 Important Notes

- **Service Role Key**: Required on the server for admins to create users. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` file.
- **Server-Side Security**: User creation now uses server-side API, so the service role key is never exposed to the client.
- **Owner Role Restriction**: Owner accounts can ONLY be created/set via SQL for security. The admin panel does not allow creating or promoting users to owner role.
- **First Owner**: Must be set manually via SQL. The application cannot auto-promote users to owner.
- **Self-Deletion**: Owners cannot delete their own account through the UI (prevents lockout).
- **Role Changes**: Take effect immediately but may require re-login for full effect.
- **Restart Required**: Always restart the server after adding/changing environment variables.

---

## Troubleshooting

### Problem: Cannot Access Admin Panel

**Solution:**
```sql
-- Check your role
SELECT id, email, role FROM public.profiles WHERE email = 'your-email@example.com';

-- If role is wrong, update it (as owner):
UPDATE public.profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Problem: "Stats Not Configured" Message

**Solution:**
1. Verify `STATS_WEBHOOK_URL` is set in `.env`
2. Restart the server after adding environment variables
3. Check webhook endpoint is responding:
```bash
curl https://your-stats-webhook-url.com
```

### Problem: Cannot Create Users / "User Not Allowed"

**Possible causes:**

1. **Service role key not configured on server**
   - Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` file
   - Get the key from Supabase Dashboard → Settings → API → `service_role` key
   - **Must restart server** after adding the key

2. **Server not using service role key**
   - Check server logs for "Supabase admin client initialized"
   - If you see a warning about service role key, it's not configured
   - Restart the server after configuring

3. **Insufficient permissions**
   - Verify you're logged in as admin or owner
   - Check your role in the database

4. **Email already exists**
   - User with that email already exists
   - Try a different email address

**Fix:**
```bash
# 1. Add to .env file:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Restart server:
npm run dev
```

### Problem: Profile Not Created on Signup

**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Manually create missing profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
```

### Problem: Role Changes Not Taking Effect

**Solution:**
1. Sign out completely
2. Clear browser cache
3. Sign back in
4. Verify role in database:
```sql
SELECT id, email, role, updated_at FROM public.profiles WHERE email = 'user@example.com';
```

### Problem: Stats Not Loading

**Debugging steps:**

1. Open browser DevTools → Network tab
2. Check for request to `/api/env`
3. Verify `statsWebhookUrl` is returned
4. Check webhook response:
```bash
curl https://your-stats-webhook-url.com
```

Expected response:
```json
{
  "total_books": 0,
  "total_questions": 0,
  "success_rate": 0
}
```

---

## Advanced Configuration

### Custom Email Templates

Configure Supabase email templates for user creation:

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize templates for:
   - Invite User
   - Magic Link
   - Change Email Address
   - Reset Password

### Webhook Implementations

#### Books Webhook (Already Configured)

Returns user's uploaded books:

```json
{
  "unique": ["book-id-1", "book-id-2", "book-id-3"]
}
```

#### Stats Webhook (New)

Returns system-wide statistics:

```json
{
  "total_books": 150,
  "total_questions": 3420,
  "success_rate": 94.5
}
```

**Sample n8n Flow:**
1. Webhook trigger (GET request)
2. Query database for counts
3. Calculate success rate
4. Return JSON response

### Backup and Recovery

**Regular Backups:**

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db reset --db-url "postgresql://..."
psql -U postgres -d postgres -f backup-20240101.sql
```

**Export User Data:**

```sql
-- Export all users and roles
COPY (SELECT id, email, role, created_at, last_sign_in_at FROM public.profiles) 
TO '/tmp/users_export.csv' CSV HEADER;
```

---

## Support and Documentation

### Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **n8n Documentation**: https://docs.n8n.io/

### Database Schema Reference

See `supabase/README.md` for detailed schema documentation.

### Getting Help

If you encounter issues:

1. Check this documentation first
2. Review Supabase logs: Dashboard → Logs → Postgres Logs
3. Check browser console for client-side errors
4. Verify RLS policies: Dashboard → Authentication → Policies
5. Test webhooks independently with curl/Postman

---

## Quick Reference

### SQL Snippets

```sql
-- List all users with roles
SELECT id, email, role, created_at, last_sign_in_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) 
FROM public.profiles 
GROUP BY role;

-- Find users who never signed in
SELECT id, email, created_at 
FROM public.profiles 
WHERE last_sign_in_at IS NULL;

-- Promote user to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';

-- Demote admin to user
UPDATE public.profiles 
SET role = 'user' 
WHERE email = 'admin@example.com';

-- View RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Public anon key (for client authentication)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side, for user creation)
- [ ] `BOOKS_WEBHOOK_URL` - Webhook for user's books
- [ ] `STATS_WEBHOOK_URL` - Webhook for statistics
- [ ] `PORT` - Server port (default: 7893)

### Setup Checklist

- [ ] Run database migration
- [ ] Set first owner account
- [ ] Configure environment variables
- [ ] Set up stats webhook
- [ ] Test user creation
- [ ] Test role changes
- [ ] Test user deletion
- [ ] Verify RLS policies
- [ ] Configure email templates
- [ ] Set up regular backups

---

**Last Updated**: 2024
**Version**: 1.0.0

For questions or issues, please refer to the project documentation or contact your system administrator.