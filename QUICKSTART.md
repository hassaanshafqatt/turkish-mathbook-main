# Quick Start Guide - Admin Panel Setup

Get your admin panel up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Supabase project created
- [ ] `.env` file configured with Supabase credentials
- [ ] Node.js and npm installed
- [ ] Access to Supabase SQL Editor

## Step-by-Step Setup

### 1. Clean Up Existing Policies (If Needed)

If you're upgrading or encountered an error, run the cleanup first:

**Option A: Standard Cleanup**
1. Open Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase/migrations/000_cleanup.sql`
3. Paste and click **Run**

**Option B: Full Reset (if you get dependency errors)**
1. Open Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase/migrations/000_full_reset.sql`
3. Paste and click **Run**
4. This will delete all existing profiles data!

> **Note:** If you get errors about "other objects depend on it", use Option B (full reset).

### 2. Run the Database Migration

1. Open Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy the **entire contents** of `supabase/migrations/001_add_roles.sql`
4. Paste into SQL Editor
5. Click **Run**

✅ You should see: "Success. No rows returned"

### 3. Create Your First Owner Account

Choose one method:

#### Method A: Promote Existing User

If you already have an account:

```sql
UPDATE public.profiles 
SET role = 'owner' 
WHERE email = 'your-email@example.com';
```

#### Method B: Create New Owner

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. After creating, run:

```sql
UPDATE public.profiles 
SET role = 'owner' 
WHERE email = 'new-owner@example.com';
```

### 4. Configure Environment Variables

Update your `.env` file:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Webhooks (Optional but recommended)
BOOKS_WEBHOOK_URL=https://your-n8n.com/webhook/books
STATS_WEBHOOK_URL=https://your-n8n.com/webhook/stats

# Server
PORT=7893
```

**Important:** Get your `SUPABASE_SERVICE_ROLE_KEY` from:
- Supabase Dashboard → **Settings** → **API** → `service_role` key (not the `anon` key!)

### 5. Restart Your Application

```bash
# Stop any running instances
# Then start fresh:
npm run dev
```

Or for production:

```bash
npm run build
npm start
```

### 6. Access the Admin Panel

1. Sign in with your owner account
2. Click your avatar (top-right)
3. Select **"Admin Panel"**
4. Or navigate to: `http://localhost:5173/admin`

## Verify Everything Works

### Check 1: View Your Role

In Supabase SQL Editor:

```sql
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

Expected: You should see `role = 'owner'`

### Check 2: Access Admin Panel

- You should see the admin panel with statistics
- "Owner" badge should appear in top-right
- User Management tab should be visible

### Check 3: Create a Test User

1. Click **"Create User"** button
2. Enter test email and password
3. Select role: User
4. Click **"Create User"**

Expected: User appears in the table

## Common Issues & Quick Fixes

### Issue: "Infinite recursion detected in policy"

**Fix:**
1. Run `000_full_reset.sql` (complete reset)
2. Then run `001_add_roles.sql` again

### Issue: "Cannot drop function because other objects depend on it"

**Fix:**
Use the full reset script which handles all dependencies:
1. Run `000_full_reset.sql`
2. Then run `001_add_roles.sql`

The full reset script drops triggers before functions, preventing dependency errors.

### Issue: "Cannot access admin panel"

**Fix:**
```sql
-- Check your role
SELECT role FROM public.profiles WHERE email = 'your-email@example.com';

-- If wrong, update it
UPDATE public.profiles SET role = 'owner' WHERE email = 'your-email@example.com';
```

### Issue: "Stats not loading"

**Reason:** Stats webhook not configured

**Fix:**
1. Add `STATS_WEBHOOK_URL` to `.env`
2. Restart server
3. Or ignore - stats are optional

### Issue: "Cannot create users" or "User not allowed"

**Possible causes:**
- Service role key not configured on server
- Server not restarted after adding environment variables
- Not logged in as admin/owner

**Fix:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file (get it from Supabase Dashboard → Settings → API → service_role key)
2. **Restart the server** after adding the environment variable:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. Ensure you're logged in as admin or owner
4. Check server logs for "Supabase admin client initialized" message
5. Check browser console for errors

### Issue: "Profile not created on signup"

**Fix:**
```sql
-- Manually create missing profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
```

## Testing Your Setup

### Test Role Permissions

1. **As Owner:**
   - Create an admin user
   - Change admin's role to user
   - Delete a user
   - All should work ✅

2. **As Admin (login with admin account):**
   - Create a user
   - Try to change another admin's role (should fail) ✅
   - Delete a regular user (should work) ✅
   - Try to delete an admin (should fail) ✅

3. **As User (login with user account):**
   - Try to access `/admin` (should be denied) ✅
   - Should only see main app features ✅

## Security Checklist

- [ ] Owner account created and tested
- [ ] Service role key stored securely (not committed to git)
- [ ] `.env` added to `.gitignore`
- [ ] Only trusted users have owner/admin roles
- [ ] Email templates configured in Supabase (optional)
- [ ] Regular backups scheduled

## What's Next?

### Important: Owner Role Restriction

For security reasons, the Owner role **cannot** be set via the admin panel:
- Owner option is hidden in the create user dialog
- Owner option is hidden in role change dropdowns
- Server-side validation prevents creating owner accounts via API
- Owner accounts can ONLY be created/promoted via SQL

**To create/promote an owner:**
```sql
UPDATE public.profiles 
SET role = 'owner' 
WHERE email = 'user@example.com';
```

This is intentional to prevent accidental or malicious owner account creation.

### Configure Stats Webhook

Create an n8n workflow that returns:

```json
{
  "total_books": 150,
  "total_questions": 3420,
  "success_rate": 94.5
}
```

Set the webhook URL in `.env`:

```env
STATS_WEBHOOK_URL=https://your-n8n.com/webhook/stats
```

### Customize Email Templates

1. Go to Supabase → **Authentication** → **Email Templates**
2. Customize templates for:
   - Invite User
   - Reset Password
   - Magic Link

### Set Up Production

1. Deploy to your hosting platform
2. Set environment variables in production
3. Update CORS settings in Supabase if needed
4. Set up SSL certificate
5. Configure backup schedule

## Need More Help?

- **Full Guide:** See `ADMIN_SETUP.md` for detailed documentation
- **Database Reference:** See `supabase/README.md` for schema details
- **Supabase Docs:** https://supabase.com/docs
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

## Quick Command Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run build
```

## SQL Quick Reference

```sql
-- List all users with roles
SELECT email, role FROM public.profiles ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) FROM public.profiles GROUP BY role;

-- Promote user to admin
UPDATE public.profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Demote admin to user
UPDATE public.profiles SET role = 'user' WHERE email = 'admin@example.com';

-- Find owner accounts
SELECT email FROM public.profiles WHERE role = 'owner';
```

## Cleanup Scripts Reference

### When to Use Which Script

- **`000_cleanup.sql`**: Standard cleanup, removes policies and functions
- **`000_full_reset.sql`**: Nuclear option, removes everything including table and data
  - Use this if you get dependency errors
  - Use this if you get "cannot drop function" errors
  - ⚠️ WARNING: Deletes all profile data!

---

**Setup Time:** ~5 minutes  
**Difficulty:** Easy  
**Last Updated:** 2024

✅ Once completed, you'll have a fully functional admin panel with user role management!