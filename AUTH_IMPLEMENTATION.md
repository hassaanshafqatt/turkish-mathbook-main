# Authentication Implementation Guide

This document explains how authentication is implemented in the Turkish Math Book application using Supabase.

## Architecture Overview

The authentication system is built using:
- **Supabase Auth**: Backend authentication service
- **React Context API**: Global authentication state management
- **React Router**: Protected route handling
- **Direct Client Access**: No backend server required

## File Structure

```
src/
├── lib/
│   └── supabase.ts                    # Supabase client configuration
├── contexts/
│   └── AuthContext.tsx                # Authentication context provider
├── components/
│   └── auth/
│       ├── AuthForm.tsx               # Sign in/up form
│       ├── ProtectedRoute.tsx         # Route protection wrapper
│       └── UserMenu.tsx               # User dropdown menu
├── pages/
│   ├── Login.tsx                      # Login page
│   └── Index.tsx                      # Protected main page
└── hooks/
    └── useSupabase.ts                 # Custom hook for database access
```

## Core Components

### 1. Supabase Client (`src/lib/supabase.ts`)

Initializes the Supabase client with environment variables:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Configuration:**
- `autoRefreshToken`: Automatically refreshes expired tokens
- `persistSession`: Saves session to localStorage
- `detectSessionInUrl`: Handles OAuth redirects

### 2. Auth Context (`src/contexts/AuthContext.tsx`)

Provides authentication state and methods throughout the app:

**State:**
- `user`: Current user object (null if not authenticated)
- `session`: Current session object
- `loading`: Loading state during authentication checks

**Methods:**
- `signUp(email, password)`: Register a new user
- `signIn(email, password)`: Sign in existing user
- `signOut()`: Sign out current user
- `resetPassword(email)`: Send password reset email

**Usage:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, signIn, signOut } = useAuth();
  
  // Access user data or call auth methods
};
```

### 3. Protected Routes (`src/components/auth/ProtectedRoute.tsx`)

Wrapper component that protects routes from unauthenticated access:

**How it works:**
1. Checks if user is authenticated
2. Shows loading spinner while checking
3. Redirects to `/login` if not authenticated
4. Renders children if authenticated

**Usage:**
```typescript
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  }
/>
```

### 4. Auth Form (`src/components/auth/AuthForm.tsx`)

Provides sign in and sign up UI with tabs:

**Features:**
- Email/password authentication
- Form validation
- Loading states
- Error handling with toast notifications
- Password reset functionality
- Responsive design with shadcn/ui components

### 5. User Menu (`src/components/auth/UserMenu.tsx`)

Displays user avatar and dropdown menu:

**Features:**
- Shows user initials as avatar
- Displays user email
- Sign out button
- Extensible for profile settings

### 6. Supabase Hook (`src/hooks/useSupabase.ts`)

Custom hook for database operations:

**Methods:**
- `getData()`: Fetch data from tables
- `insertData()`: Insert new records
- `updateData()`: Update existing records
- `deleteData()`: Delete records
- `uploadFile()`: Upload to Supabase Storage
- `getFileUrl()`: Get public file URLs
- `deleteFile()`: Delete files from storage
- `executeQuery()`: Direct access to Supabase client

**Usage:**
```typescript
import { useSupabase } from '@/hooks/useSupabase';

const MyComponent = () => {
  const { getData, insertData } = useSupabase();
  
  const fetchData = async () => {
    const { data, error } = await getData('my_table');
    // Handle data
  };
};
```

## Authentication Flow

### Sign Up Flow

1. User enters email and password in `AuthForm`
2. `signUp()` method calls `supabase.auth.signUp()`
3. Supabase sends confirmation email (if enabled)
4. User clicks confirmation link in email
5. User is redirected to app and automatically signed in
6. `AuthContext` updates user state
7. User is redirected to protected routes

### Sign In Flow

1. User enters credentials in `AuthForm`
2. `signIn()` method calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials
4. On success, session is stored in localStorage
5. `AuthContext` updates user state
6. User is redirected to home page

### Sign Out Flow

1. User clicks "Sign Out" in `UserMenu`
2. `signOut()` method calls `supabase.auth.signOut()`
3. Session is cleared from localStorage
4. `AuthContext` updates user state to null
5. `ProtectedRoute` redirects to login page

### Password Reset Flow

1. User clicks "Forgot password?" in `AuthForm`
2. Enters email address
3. `resetPassword()` calls `supabase.auth.resetPasswordForEmail()`
4. Supabase sends password reset email
5. User clicks link in email
6. User is redirected to reset password page
7. User enters new password
8. User is signed in with new password

## Session Management

### Automatic Token Refresh

Supabase automatically refreshes access tokens before they expire:

```typescript
{
  auth: {
    autoRefreshToken: true,  // Enable auto-refresh
  }
}
```

### Session Persistence

Sessions are automatically saved to localStorage:

```typescript
{
  auth: {
    persistSession: true,  // Save to localStorage
  }
}
```

### Session State Listener

The `AuthContext` listens for authentication state changes:

```typescript
supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
});
```

This ensures the app stays synchronized with Supabase auth state.

## Security Best Practices

### Environment Variables

Never commit sensitive keys:
- Store in `.env` file (already in `.gitignore`)
- Use `VITE_` prefix for client-side variables
- Different keys for dev/staging/production

### Row Level Security (RLS)

When storing user data in Supabase:

```sql
-- Enable RLS on table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### Secure API Keys

- **Anon Key**: Safe for client-side use, respects RLS
- **Service Role Key**: NEVER use in client code
- Use environment variables, never hardcode

### Password Requirements

Supabase enforces minimum password length (6 characters by default). Consider:
- Requiring longer passwords (8-12+ characters)
- Adding password strength indicators
- Implementing password complexity rules

## Extending Authentication

### Adding OAuth Providers

To add Google, GitHub, or other OAuth providers:

1. Enable provider in Supabase dashboard
2. Configure provider credentials
3. Add sign-in button to `AuthForm`:

```typescript
const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

### Adding User Profiles

To store additional user data:

1. Create `user_profiles` table in Supabase
2. Add RLS policies
3. Create profile on sign up:

```typescript
const handleSignUp = async (email: string, password: string) => {
  const { data, error } = await signUp(email, password);
  
  if (!error && data.user) {
    await supabase.from('user_profiles').insert({
      user_id: data.user.id,
      email: data.user.email,
      created_at: new Date().toISOString(),
    });
  }
};
```

### Adding Multi-Factor Authentication

To enable MFA:

1. Enable MFA in Supabase dashboard
2. Implement enrollment UI
3. Add verification step during sign in

```typescript
// Enroll in MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
});

// Verify MFA code
const { error } = await supabase.auth.mfa.challenge({
  factorId: data.id,
});

const { error } = await supabase.auth.mfa.verify({
  factorId: data.id,
  challengeId: challenge.id,
  code: '123456', // User-entered code
});
```

### Adding Email Verification Check

To check if user has verified their email:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user } = useAuth();
  
  if (user && !user.email_confirmed_at) {
    return <div>Please verify your email address.</div>;
  }
  
  return <div>Welcome!</div>;
};
```

## Troubleshooting

### Common Issues

**Issue: "Invalid API key"**
- Check `.env` file has correct values
- Restart dev server after changing `.env`
- Verify no extra spaces in environment variables

**Issue: Users can't sign in after email confirmation**
- Check email confirmation is enabled in Supabase
- Verify redirect URLs in Supabase dashboard
- Check spam folder for confirmation email

**Issue: Session not persisting**
- Check localStorage is enabled in browser
- Verify `persistSession: true` in Supabase config
- Check for conflicting session management code

**Issue: Infinite redirect loop**
- Check `ProtectedRoute` logic
- Verify `useEffect` dependencies in `Login` page
- Check for conflicting navigation logic

### Debug Tips

1. **Check Supabase logs:**
   - Go to Supabase dashboard → Authentication → Logs
   - View recent auth events and errors

2. **Inspect localStorage:**
   - Open DevTools → Application → Local Storage
   - Look for `supabase.auth.token` key

3. **Check network requests:**
   - Open DevTools → Network tab
   - Filter for Supabase API calls
   - Check request/response payloads

4. **Console logging:**
   ```typescript
   useEffect(() => {
     supabase.auth.onAuthStateChange((event, session) => {
       console.log('Auth event:', event);
       console.log('Session:', session);
     });
   }, []);
   ```

## Testing Authentication

### Manual Testing Checklist

- [ ] Sign up with new email
- [ ] Receive confirmation email
- [ ] Confirm email and sign in
- [ ] Sign out
- [ ] Sign in with existing account
- [ ] Access protected route when not authenticated (should redirect)
- [ ] Access protected route when authenticated (should work)
- [ ] Reset password
- [ ] Receive password reset email
- [ ] Reset password and sign in with new password
- [ ] Session persists after page refresh

### Test Users

For development, you can create test users in Supabase dashboard:
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. User can immediately sign in (bypasses confirmation)

## Performance Considerations

### Token Refresh

Supabase automatically refreshes tokens, but you can optimize:
- Token refresh happens in background
- No user interaction required
- Minimal performance impact

### Session Caching

Sessions are cached in memory and localStorage:
- Fast authentication checks
- No extra API calls on page load
- Automatic synchronization

### Lazy Loading

Consider lazy loading auth components:
```typescript
const Login = lazy(() => import('./pages/Login'));
```

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [React Context API](https://react.dev/reference/react/useContext)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Support

For issues or questions:
- Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
- Review Supabase documentation
- Check Supabase Discord community
- Open an issue in the project repository