-- FULL RESET SCRIPT - USE WITH CAUTION!
-- This script completely removes all profiles-related objects
-- Run this if you encounter dependency errors or need a fresh start

-- STEP 1: Disable RLS temporarily
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all triggers first (prevents function dependency errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles CASCADE;

-- STEP 3: Drop all functions with CASCADE (removes dependent triggers automatically)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_owner(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_owner(UUID) CASCADE;

-- STEP 4: Drop all policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owners can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.profiles;

-- STEP 5: Drop all indexes
DROP INDEX IF EXISTS public.profiles_role_idx;
DROP INDEX IF EXISTS public.profiles_email_idx;
DROP INDEX IF EXISTS public.profiles_created_at_idx;

-- STEP 6: Drop the table (WARNING: Deletes all user data!)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- STEP 7: Drop the enum type
DROP TYPE IF EXISTS public.user_role CASCADE;

-- DONE! Now run 001_add_roles.sql to recreate everything fresh
SELECT 'Full reset complete. You can now run 001_add_roles.sql' AS message;
