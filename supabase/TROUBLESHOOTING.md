# SQL Migration Troubleshooting Guide

Quick solutions for common database setup errors.

## Error 1: Infinite Recursion in Policy

### Error Message
```
{
    "code": "42P17",
    "details": null,
    "hint": null,
    "message": "infinite recursion detected in policy for relation \"profiles\""
}
```

### What It Means
RLS policies are creating a circular dependency when checking permissions.

### Solution
Run the full reset, then the migration:

```sql
-- Step 1: Run 000_full_reset.sql in Supabase SQL Editor
-- Step 2: Run 001_add_roles.sql in Supabase SQL Editor
```

### Why It Happens
- Old policies without security definer functions
- Policies querying the same table they protect
- Previous incomplete migrations

---

## Error 2: Cannot Drop Function (Dependencies)

### Error Message
```
ERROR: 2BP01: cannot drop function handle_new_user() because other objects depend on it
DETAIL: trigger on_auth_user_created on table auth.users depends on function handle_new_user()
HINT: Use DROP ... CASCADE to drop the dependent objects too.
```

### What It Means
A trigger is using the function you're trying to drop.

### Solution
Use the full reset script which handles dependencies correctly:

```sql
-- Run 000_full_reset.sql - it drops triggers BEFORE functions
```

### Why It Happens
- Triggers must be dropped before their functions
- Standard cleanup script may not handle all dependencies
- Previous incomplete cleanup

### Manual Fix (Alternative)
If you want to fix manually:

```sql
-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles CASCADE;

-- Then drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
```

---

## Error 3: Relation "profiles" Already Exists

### Error Message
```
ERROR: relation "profiles" already exists
```

### What It Means
The profiles table is already created.

### Solution
Either:
1. Skip table creation (comment out CREATE TABLE in migration)
2. Or run full reset to start fresh

```sql
-- Option 1: Full reset (deletes data!)
-- Run 000_full_reset.sql

-- Option 2: Modify migration
-- Comment out the CREATE TABLE statement in 001_add_roles.sql
```

---

## Error 4: Type "user_role" Already Exists

### Error Message
```
ERROR: type "user_role" already exists
```

### What It Means
The enum type is already defined.

### Solution
```sql
-- Option 1: Use IF NOT EXISTS (already in migration)
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('owner', 'admin', 'user');

-- Option 2: Drop and recreate
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'user');
```

---

## Error 5: Permission Denied

### Error Message
```
ERROR: permission denied for schema public
ERROR: permission denied to create database
```

### What It Means
Your Supabase user doesn't have sufficient permissions.

### Solution
Make sure you're:
1. Using the Supabase SQL Editor (not external client)
2. Logged in as the project owner
3. Running queries in the correct project

---

## Error 6: Profile Not Created on Signup

### Symptoms
- User can sign up but no profile row exists
- Admin panel shows error when listing users
- User cannot be found in profiles table

### Solution
```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, run the full migration again
-- If exists, manually create missing profiles:
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
```

---

## Error 7: Cannot Access Admin Panel

### Symptoms
- User is signed in but admin panel shows "Access Denied"
- Owner/Admin account not recognized

### Solution
```sql
-- Check your role
SELECT id, email, role FROM public.profiles WHERE email = 'your-email@example.com';

-- If NULL or wrong role, update it
UPDATE public.profiles SET role = 'owner' WHERE email = 'your-email@example.com';

-- Then sign out and sign back in
```

---

## Error 8: Stats Not Loading

### Symptoms
- Admin panel shows "Stats Not Configured"
- Empty stats dashboard

### Solution
1. Check if webhook URL is configured:
```bash
# In .env file
STATS_WEBHOOK_URL=https://your-webhook-url.com
```

2. Restart server after changing .env:
```bash
npm run dev
```

3. Test webhook manually:
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

## Complete Reset Procedure

If all else fails, here's the nuclear option:

### Step 1: Backup Data (If Needed)
```sql
-- Export users and roles
COPY (SELECT id, email, role, created_at FROM public.profiles) 
TO '/tmp/profiles_backup.csv' CSV HEADER;
```

### Step 2: Full Reset
```sql
-- Run 000_full_reset.sql completely
-- This will delete everything!
```

### Step 3: Fresh Migration
```sql
-- Run 001_add_roles.sql
-- Should complete without errors
```

### Step 4: Create Owner
```sql
-- Set your owner account
UPDATE public.profiles SET role = 'owner' WHERE email = 'your-email@example.com';
```

### Step 5: Test
1. Sign in
2. Access `/admin`
3. Create test user
4. Verify roles work

---

## Prevention Tips

### Best Practices
1. **Always backup before migrations**
2. **Test on development database first**
3. **Run full reset if switching migration versions**
4. **Use SQL Editor (not external clients)**
5. **Read error messages carefully**

### Common Mistakes
❌ Running partial migrations  
❌ Mixing old and new policy structures  
❌ Not dropping triggers before functions  
❌ Editing migration files after partial execution  
❌ Using wrong Supabase project  

✅ Run complete reset before new migration  
✅ Use provided cleanup scripts  
✅ Follow step-by-step guides  
✅ Test one feature at a time  
✅ Verify each step completes successfully  

---

## Quick Command Reference

```sql
-- Check if table exists
SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles');

-- Check if enum exists
SELECT EXISTS (SELECT FROM pg_type WHERE typname = 'user_role');

-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- List all triggers
SELECT * FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;

-- List all functions
SELECT proname FROM pg_proc WHERE proname LIKE 'handle_%' OR proname LIKE 'is_%';

-- Count users by role
SELECT role, COUNT(*) FROM public.profiles GROUP BY role;

-- Find users without profiles
SELECT id, email FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);
```

---

## Still Having Issues?

### Checklist
- [ ] Ran full reset script
- [ ] Ran migration script completely
- [ ] No error messages in SQL output
- [ ] Owner account created manually
- [ ] Signed out and back in
- [ ] Cleared browser cache
- [ ] Environment variables set correctly
- [ ] Server restarted after .env changes

### Getting Help
1. Check the error code and message carefully
2. Search this guide for the error
3. Review main documentation: `ADMIN_SETUP.md`
4. Check Supabase logs: Dashboard → Logs → Postgres Logs
5. Verify RLS policies: Dashboard → Authentication → Policies

### Debug Queries
```sql
-- Full system check
SELECT 
    'Profiles table' as check,
    EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') as exists
UNION ALL
SELECT 
    'User role enum',
    EXISTS (SELECT FROM pg_type WHERE typname = 'user_role')
UNION ALL
SELECT 
    'Owner account',
    EXISTS (SELECT FROM public.profiles WHERE role = 'owner')
UNION ALL
SELECT 
    'RLS enabled',
    EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true);
```

---

## Success Indicators

You'll know everything is working when:

✅ `SELECT * FROM public.profiles LIMIT 1;` returns data  
✅ No errors when running queries  
✅ Can access admin panel as owner  
✅ Can create users  
✅ Can change roles  
✅ Stats display (if webhook configured)  

---

**Last Updated:** 2024  
**Migration Version:** 001

For detailed setup instructions, see `QUICKSTART.md` or `ADMIN_SETUP.md`.