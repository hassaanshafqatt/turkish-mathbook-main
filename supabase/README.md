# Database Setup Guide

This guide explains how to set up the Supabase database for the MathBook application with user roles and admin functionality.

## Prerequisites

- Supabase project created
- Supabase CLI installed (optional, for migrations)
- Access to Supabase SQL Editor

## Setup Instructions

### Option 1: Using Supabase SQL Editor (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `migrations/001_add_roles.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project root directory
supabase db push
```

### Important: Handling Errors During Setup

#### Error 1: Infinite Recursion
```
{
    "code": "42P17",
    "message": "infinite recursion detected in policy for relation \"profiles\""
}
```

**Solution:** Use the full reset script, then run the migration:
1. Run `000_full_reset.sql`
2. Run `001_add_roles.sql`

#### Error 2: Cannot Drop Function (Dependency Error)
```
ERROR: cannot drop function handle_new_user() because other objects depend on it
HINT: Use DROP ... CASCADE to drop the dependent objects too.
```

**Solution:** Use the full reset script which handles all dependencies:
1. Run `000_full_reset.sql` (drops triggers before functions)
2. Run `001_add_roles.sql`

The migration uses `SECURITY DEFINER` functions to prevent infinite recursion in RLS policies.

### Cleanup Scripts Available

- **`000_cleanup.sql`**: Standard cleanup (drops policies, functions, triggers)
- **`000_full_reset.sql`**: Complete reset with CASCADE (⚠️ deletes all profile data!)

## Post-Migration Steps

### 1. Set Your First Owner

After running the migration, you need to manually set the first owner account. This is a one-time setup:

1. Create a user account through the application (or create it manually in Supabase)
2. Go to Supabase Dashboard → **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE public.profiles 
SET role = 'owner' 
WHERE email = 'your-email@example.com';
```

### 2. Enable Supabase Admin API (Required for User Creation)

For admins to create users via the application, you need to configure the Supabase service role key:

1. Go to your Supabase Dashboard → **Settings** → **API**
2. Copy the `service_role` key (NOT the `anon` key)
3. In your application, update `.env.local` with:

```env
VITE_SUPABASE_ANON_KEY=your_service_role_key_here
```

**⚠️ SECURITY WARNING**: The service role key bypasses Row Level Security. In production, you should create a server-side API endpoint for user creation instead of using the service role key in the client.

## Database Schema

### Profiles Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users(id) |
| `email` | TEXT | User's email address |
| `role` | user_role | User role: 'owner', 'admin', or 'user' |
| `created_at` | TIMESTAMP | Account creation timestamp |
| `last_sign_in_at` | TIMESTAMP | Last sign-in timestamp |
| `updated_at` | TIMESTAMP | Last profile update timestamp |

### User Roles

- **Owner**: Full system access, can manage admins and all users
- **Admin**: Can create users, manage user roles, kick users
- **User**: Basic access, can only view their own profile

## Row Level Security (RLS) Policies

The migration automatically sets up RLS policies:

- Users can read and update their own profile (but cannot change their role)
- Admins can read all profiles
- Admins can update and delete user-level profiles
- Owners can update and delete any profile (except their own)
- Admins and owners can insert new profiles

## Automatic Triggers

The migration creates several automatic triggers:

1. **New User Creation**: Automatically creates a profile with 'user' role when a new auth user is created
2. **Sign-in Tracking**: Updates `last_sign_in_at` when a user signs in
3. **Updated Timestamp**: Automatically updates `updated_at` on profile changes

## Role Hierarchy

```
Owner (highest authority)
  ↓
Admin
  ↓
User (basic access)
```

### Permission Matrix

| Action | Owner | Admin | User |
|--------|-------|-------|------|
| Create users | ✅ | ✅ | ❌ |
| View all users | ✅ | ✅ | ❌ |
| Manage user roles | ✅ | ✅ (users only) | ❌ |
| Kick users | ✅ | ✅ (users only) | ❌ |
| Kick admins | ✅ | ❌ | ❌ |
| Manage admins | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |

## Troubleshooting

### Infinite Recursion Error

**Error message:**
```
infinite recursion detected in policy for relation "profiles"
```

**Solution:**
1. Run the full reset: `000_full_reset.sql`
2. Then run the migration: `001_add_roles.sql`

The migration uses `SECURITY DEFINER` functions that avoid recursion.

### Dependency Errors

**Error message:**
```
cannot drop function X() because other objects depend on it
```

**Solution:**
The `000_full_reset.sql` script handles this by:
1. Dropping triggers first (before functions)
2. Using CASCADE to handle any remaining dependencies
3. Completely resetting the schema

**Steps:**
```sql
-- 1. Run full reset (in SQL Editor)
-- Copy and run: 000_full_reset.sql

-- 2. Run main migration (in SQL Editor)
-- Copy and run: 001_add_roles.sql
```

⚠️ **Warning:** Full reset deletes all profile data. Backup first if needed!

### Profile Not Created Automatically

If a profile isn't created when a new user signs up:

1. Check if the trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Manually create the profile:
```sql
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' 
FROM auth.users 
WHERE id = 'user-uuid-here';
```

### Cannot Create Users from Admin Panel

If admins can't create users:

1. Verify the service role key is correctly configured
2. Check browser console for errors
3. Ensure RLS policies are properly set up

### Role Changes Not Taking Effect

1. Sign out and sign back in
2. Check if the role was actually updated:
```sql
SELECT id, email, role FROM public.profiles WHERE email = 'user@example.com';
```

## Security Best Practices

1. **Never share the service role key** - It has full database access
2. **Set the first owner manually** - Don't allow the application to create owners automatically
3. **Limit owner accounts** - Only create owner accounts for trusted administrators
4. **Regular audits** - Periodically review user roles and permissions
5. **Production setup** - Consider implementing server-side user creation endpoints instead of using service role in client

## Backup Your Data

Before running migrations, always backup your database:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql
```

Or use the Supabase Dashboard → **Database** → **Backups**

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS policies in Supabase Dashboard → **Authentication** → **Policies**
- Check SQL logs in Supabase Dashboard → **Logs** → **Postgres Logs**