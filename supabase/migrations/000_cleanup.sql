-- Cleanup script for profiles table
-- Run this ONLY if you need to start fresh or if you encounter errors

-- Drop triggers FIRST (before functions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

-- Now drop functions (with CASCADE to be safe)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_owner(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_owner(UUID) CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owners can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.profiles;

-- Drop indexes
DROP INDEX IF EXISTS public.profiles_role_idx;
DROP INDEX IF EXISTS public.profiles_email_idx;
DROP INDEX IF EXISTS public.profiles_created_at_idx;

-- Drop table (WARNING: This deletes all data!)
-- Uncomment the next line if you want to completely remove the table
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop enum type (WARNING: Only do this if dropping the table)
-- Uncomment the next line if you want to completely remove the enum
-- DROP TYPE IF EXISTS public.user_role CASCADE;

-- After running this cleanup, run 001_add_roles.sql to recreate everything
