# Settings System Migration Guide

## Overview

This document explains the migration from file-based settings to Supabase database-based user settings.

## Changes Summary

### What Changed

1. **Settings Storage**: Moved from local JSON file (`data/settings.json`) to Supabase database tables
2. **User-Specific Preferences**: Each user now has their own language preference stored in the database
3. **Access Control**: Webhook management is now restricted to admin and owner roles only
4. **Voice Management**: Voices are now managed by admins/owners but readable by all authenticated users

### Architecture

```
OLD SYSTEM (File-based)
├── data/settings.json (single file for all users)
│   ├── webhooks[]
│   ├── voices[]
│   └── language (global)
└── Server API endpoints read/write this file

NEW SYSTEM (Supabase-based)
├── public.webhooks (admin/owner only)
│   ├── id (UUID)
│   ├── name (text)
│   ├── url (text)
│   ├── active (boolean)
│   ├── created_by (UUID)
│   └── created_at (timestamp)
├── public.voices (admin/owner manage, all users read)
│   ├── id (UUID)
│   ├── voice_id (text, unique)
│   ├── name (text)
│   ├── created_by (UUID)
│   └── created_at (timestamp)
└── public.user_preferences (per-user)
    ├── user_id (UUID, primary key)
    ├── language (text: 'en' or 'tr')
    └── updated_at (timestamp)
```

## Database Schema

### Tables Created

#### 1. `webhooks`
- **Purpose**: Store n8n webhook configurations
- **Access**: Admin and Owner roles only
- **Columns**:
  - `id`: Primary key (UUID)
  - `name`: Webhook display name
  - `url`: Webhook endpoint URL
  - `active`: Only one webhook can be active at a time (enforced by trigger)
  - `created_by`: User who created the webhook
  - `created_at`, `updated_at`: Timestamps

#### 2. `voices`
- **Purpose**: Store available AI voices for narration
- **Access**: Admin/Owner can manage, all authenticated users can read
- **Columns**:
  - `id`: Primary key (UUID)
  - `voice_id`: External voice ID from AI service (e.g., ElevenLabs) - UNIQUE
  - `name`: Display name for the voice
  - `created_by`: User who created the voice entry
  - `created_at`, `updated_at`: Timestamps

#### 3. `user_preferences`
- **Purpose**: Store per-user preferences
- **Access**: Users can only manage their own preferences
- **Columns**:
  - `user_id`: Primary key, references auth.users(id)
  - `language`: UI language ('en' or 'tr')
  - `created_at`, `updated_at`: Timestamps

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

**Webhooks:**
- Only admins and owners can SELECT, INSERT, UPDATE, DELETE

**Voices:**
- All authenticated users can SELECT
- Only admins and owners can INSERT, UPDATE, DELETE

**User Preferences:**
- Users can only SELECT, INSERT, UPDATE, DELETE their own preferences

### Database Triggers

1. **Single Active Webhook**: Automatically deactivates other webhooks when one is set to active
2. **Auto-create User Preferences**: Creates a default preference record when a user signs up
3. **Updated At Timestamp**: Automatically updates the `updated_at` column on record changes

## Migration Steps

### 1. Run the Migration

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration file
psql -h <your-db-host> -U postgres -d postgres -f supabase/migrations/002_user_settings.sql
```

### 2. Migrate Existing Data (Optional)

If you have existing data in `data/settings.json`, you can migrate it manually:

```sql
-- Insert existing webhooks (as admin/owner user)
INSERT INTO public.webhooks (name, url, active, created_by)
VALUES 
  ('Production Webhook', 'https://your-n8n.com/webhook/...', true, '<admin-user-id>'),
  ('Staging Webhook', 'https://staging-n8n.com/webhook/...', false, '<admin-user-id>');

-- Insert existing voices
INSERT INTO public.voices (voice_id, name, created_by)
VALUES 
  ('9BWtsMINqrJLrRacOk9x', 'Aria', '<admin-user-id>'),
  ('another-voice-id', 'John', '<admin-user-id>');

-- Set language preference for existing users (if needed)
INSERT INTO public.user_preferences (user_id, language)
SELECT id, 'en' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### 3. Update Environment Variables

The settings system no longer uses server-side JSON file storage. You can remove or ignore the `DATA_DIR` setting.

Environment variables that are still used:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `BOOKS_WEBHOOK_URL`: Read-only webhook for fetching books (optional)
- `STATS_WEBHOOK_URL`: Read-only webhook for stats (optional)

### 4. Remove Old Files (Optional)

After confirming the migration works:
```bash
# Backup first
cp data/settings.json data/settings.json.backup

# Remove if no longer needed
rm data/settings.json
```

## User Experience Changes

### For Regular Users

- **Language Setting**: Now per-user instead of global
- **Voice Selection**: Can view all available voices (no change in UX)
- **Webhook Tab**: No longer visible in settings (admin/owner only)

### For Admin/Owner Users

- **Webhook Management**: Same UI, now stored in database
- **Voice Management**: Same UI, now stored in database
- **User Preferences**: Can manage webhooks and voices system-wide

## API Changes

### Old Server Endpoints (Deprecated)

```javascript
// These endpoints are no longer used
GET  /api/settings  // Replaced by Supabase queries
POST /api/settings  // Replaced by Supabase queries
```

### New Supabase Queries

**Frontend components now use direct Supabase queries:**

```typescript
// Fetch webhooks (admin/owner only)
const { data } = await supabase
  .from('webhooks')
  .select('*')
  .order('created_at', { ascending: false });

// Fetch voices (all authenticated users)
const { data } = await supabase
  .from('voices')
  .select('*')
  .order('created_at', { ascending: false });

// Fetch user preferences
const { data } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Update user language preference
await supabase
  .from('user_preferences')
  .upsert({ user_id: user.id, language: 'en' })
  .eq('user_id', user.id);
```

## Helper Functions

The following helper functions are available for backward compatibility:

```typescript
import { getConfiguredVoices, getActiveWebhook } from '@/components/SettingsDialog';

// Get all voices
const voices = await getConfiguredVoices();

// Get active webhook URL
const webhookUrl = await getActiveWebhook();
```

## Testing the Migration

### 1. Test User Roles

```sql
-- Check your role
SELECT role FROM public.profiles WHERE email = 'your-email@example.com';

-- Set yourself as admin (if needed)
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 2. Test Webhook Access

- **As Regular User**: Webhook tab should NOT appear in settings
- **As Admin/Owner**: Webhook tab should appear and be functional

### 3. Test Voice Management

- **As Regular User**: Can view voices but cannot add/delete them
- **As Admin/Owner**: Can add, view, and delete voices

### 4. Test User Preferences

- Log in as different users
- Change language settings for each user
- Verify that each user has their own language preference

## Troubleshooting

### Issue: "Permission denied for table webhooks"

**Cause**: User is not admin or owner, or RLS policies are not properly applied.

**Solution**:
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'webhooks';

-- Check user role
SELECT role FROM public.profiles WHERE id = auth.uid();
```

### Issue: "Webhook tab not showing for admin"

**Cause**: User role might not be loaded yet or user is not actually admin.

**Solution**:
1. Check browser console for errors
2. Verify user role in database:
```sql
SELECT email, role FROM public.profiles WHERE email = 'your-email@example.com';
```

### Issue: "Voices not appearing"

**Cause**: No voices in database or RLS blocking access.

**Solution**:
```sql
-- Check if voices exist
SELECT * FROM public.voices;

-- Add a test voice (as admin)
INSERT INTO public.voices (voice_id, name, created_by)
VALUES ('test-voice-id', 'Test Voice', '<your-user-id>');
```

### Issue: "Language setting not saving"

**Cause**: User preferences record might not exist.

**Solution**:
```sql
-- Manually create user preferences
INSERT INTO public.user_preferences (user_id, language)
VALUES ('<your-user-id>', 'en')
ON CONFLICT (user_id) DO UPDATE SET language = 'en';
```

## Rollback Plan

If you need to rollback to the old system:

### 1. Restore Old Code

```bash
git revert <commit-hash>
```

### 2. Restore Old Settings File

```bash
cp data/settings.json.backup data/settings.json
```

### 3. Drop New Tables (Optional)

```sql
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.voices CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
```

## Benefits of New System

1. **Per-User Settings**: Each user can have their own language preference
2. **Better Security**: Webhooks protected by RLS, only accessible to admins
3. **Audit Trail**: Track who created each webhook and voice
4. **Scalability**: Database-backed system scales better than file storage
5. **Real-time**: Changes are immediately visible across all sessions
6. **Backup**: Automatic backups with Supabase (if enabled)
7. **Multi-instance**: Multiple server instances can share the same settings

## Next Steps

- [ ] Run the migration on development environment
- [ ] Test all functionality with different user roles
- [ ] Run the migration on staging environment
- [ ] Verify webhook and voice operations
- [ ] Run the migration on production environment
- [ ] Monitor for any issues
- [ ] Update team documentation
- [ ] Train team on new per-user settings

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Check the browser console for errors
3. Check Supabase logs in the Supabase dashboard
4. Review the RLS policies in Supabase dashboard
5. Check the migration file: `supabase/migrations/002_user_settings.sql`

## Related Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md)
- [Authentication Implementation](AUTH_IMPLEMENTATION.md)
- [Admin Setup Guide](ADMIN_SETUP.md)
- [Security Documentation](SECURITY.md)