# Fix: "User Not Allowed" Error When Creating Users

## Problem
When trying to create users in the admin panel, you get an error: **"User not allowed"**

## Root Cause
The client-side code was trying to use Supabase Admin API directly, which requires a service role key. For security reasons, we should NEVER use the service role key in client-side code.

## Solution
The system has been updated to use a **server-side API** for user creation. This is more secure and properly isolates the service role key.

---

## Setup Steps

### Step 1: Get Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find the **`service_role`** key (NOT the `anon` key!)
4. Copy the entire key (starts with `eyJhbGciOiJIUzI1NiIs...`)

### Step 2: Add to Environment Variables

Add this line to your `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here
```

**Example `.env` file:**
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role_key_here

# Webhooks
BOOKS_WEBHOOK_URL=https://your-n8n.com/webhook/books
STATS_WEBHOOK_URL=https://your-n8n.com/webhook/stats

# Server
PORT=7893
```

### Step 3: Restart Your Server

**IMPORTANT:** You MUST restart the server after adding the environment variable!

```bash
# Stop the current server (press Ctrl+C)

# Then start it again:
npm run dev
```

### Step 4: Verify Server Initialization

Check your server logs. You should see:

```
Server is running on port 7893
Supabase admin client initialized
Books webhook URL configured: https://...
Stats webhook URL configured: https://...
```

If you see this warning instead, the key is not configured correctly:
```
⚠️  SUPABASE_SERVICE_ROLE_KEY not configured - admin user creation disabled
```

---

## How It Works Now

### Before (Insecure ❌)
- Client-side code used service role key directly
- Service role key exposed to browser
- Security risk!

### After (Secure ✅)
1. Client sends user creation request to server
2. Server validates the request
3. Server uses service role key (never exposed to client)
4. Server creates user via Supabase Admin API
5. Server updates user role in profiles table
6. Server returns success/error to client

### Architecture
```
Admin Panel (Client)
    ↓ POST /api/admin/users
    ↓ { email, password, role }
    ↓
Express Server (server.js)
    ↓ Uses SUPABASE_SERVICE_ROLE_KEY
    ↓
Supabase Admin API
    ↓ Creates user
    ↓ Updates profile role
    ↓
Success ✅
```

---

## Testing

### Test 1: Create a Regular User
1. Sign in as owner/admin
2. Go to Admin Panel (`/admin`)
3. Click **"Create User"**
4. Enter:
   - Email: `test@example.com`
   - Password: `test123`
   - Role: User
5. Click **"Create User"**
6. Should see success message ✅

### Test 2: Create an Admin
1. Follow steps above
2. Select Role: Admin
3. Should create successfully ✅

### Test 3: Verify in Database
```sql
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'test@example.com';
```

Should return the new user with correct role.

---

## Troubleshooting

### Issue: Still Getting "User Not Allowed"

**Checklist:**
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env` file
- [ ] Used the **service_role** key (not the anon key)
- [ ] Restarted the server after adding the key
- [ ] Server logs show "Supabase admin client initialized"
- [ ] Logged in as admin or owner
- [ ] No typos in the environment variable name

**Verify the key:**
```bash
# On Windows (PowerShell):
echo $env:SUPABASE_SERVICE_ROLE_KEY

# On Mac/Linux:
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Issue: "Admin service not configured"

**Cause:** Server cannot initialize Supabase admin client.

**Fix:**
1. Check `.env` file has both:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Restart server
3. Check server logs for initialization message

### Issue: User Created but Role Not Set

**Cause:** Profile update failed after user creation.

**Check:**
```sql
-- Find the user
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- Check their profile
SELECT id, email, role FROM public.profiles WHERE email = 'test@example.com';
```

**Fix:**
```sql
-- Manually set the role
UPDATE public.profiles 
SET role = 'user' 
WHERE email = 'test@example.com';
```

### Issue: Email Already Exists

**Error:** "User with this email already exists"

**Fix:**
Either use a different email or delete the existing user:
```sql
-- Find the user ID
SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Delete from auth (will cascade to profiles)
-- Or use the admin panel to delete
```

---

## Security Notes

### ✅ Good Practices
- Service role key stored only on server
- Never exposed to client/browser
- Server validates requests before creating users
- Environment variables not committed to git

### ❌ Bad Practices (Don't Do This!)
- Never use service role key in client-side code
- Never commit `.env` file to version control
- Never share service role key in public repos
- Never hardcode keys in source code

### Environment Variable Safety
Make sure `.env` is in your `.gitignore`:
```
# .gitignore
.env
.env.local
.env.*.local
```

---

## API Endpoints

### POST `/api/admin/users`
Creates a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Response (Error):**
```json
{
  "error": "User with this email already exists"
}
```

### DELETE `/api/admin/users/:userId`
Deletes a user account.

**Response (Success):**
```json
{
  "success": true
}
```

---

## Complete Example

### Step-by-Step Success Path

1. **Add to `.env`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

3. **Check logs:**
   ```
   ✓ Supabase admin client initialized
   ```

4. **Sign in as owner**

5. **Go to `/admin`**

6. **Click "Create User":**
   - Email: `newuser@example.com`
   - Password: `secure123`
   - Role: User

7. **Success message appears** ✅

8. **New user appears in table** ✅

9. **User can sign in** ✅

---

## Need Help?

If you're still having issues after following this guide:

1. Check server logs for error messages
2. Verify your Supabase project is active
3. Test the service role key with curl:
   ```bash
   curl -X GET 'https://your-project.supabase.co/rest/v1/profiles' \
     -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
   ```
4. Review the main documentation: `ADMIN_SETUP.md`

---

**Status:** ✅ Fixed in latest version
**Security:** ✅ Service role key now server-side only
**Ready:** ✅ Build successful, ready to deploy

Last Updated: 2024