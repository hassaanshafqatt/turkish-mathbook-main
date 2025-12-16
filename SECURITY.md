# Security Guidelines

## Overview

This document outlines the security measures implemented in the Questioneer application to protect against various vulnerabilities, including command injection, XSS, CSRF, and other common attack vectors.

## Implemented Security Measures

### 1. **Dependency Vulnerabilities**

All dependencies are regularly audited and updated to patch known vulnerabilities:

```bash
npm audit
npm audit fix --legacy-peer-deps
```

**Current Status**: ✅ 0 known vulnerabilities

### 2. **HTTP Security Headers (Helmet.js)**

The application uses Helmet.js to set various HTTP headers that protect against common web vulnerabilities:

- **Content Security Policy (CSP)**: Restricts sources for scripts, styles, and other resources
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-Frame-Options**: Protects against clickjacking
- **X-XSS-Protection**: Enables XSS filtering in older browsers
- **Strict-Transport-Security**: Forces HTTPS connections

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
    },
  },
})
```

### 3. **Rate Limiting**

Protection against brute-force attacks and DDoS:

- **General API Endpoints**: 100 requests per 15 minutes per IP
- **Authentication Endpoints**: 5 requests per 15 minutes per IP

```javascript
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Auth endpoints rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

### 4. **Input Validation & Sanitization**

All user inputs are validated and sanitized before processing:

#### Email Validation
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

#### Input Sanitization
```javascript
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  // Remove potential command injection characters
  return input.replace(/[;&|`$(){}[\]<>]/g, "");
};
```

#### URL Validation
```javascript
const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
```

#### UUID Validation
```javascript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

### 5. **Role-Based Access Control (RBAC)**

Three-tier permission system:

- **Owner**: Full system access (can only be created via SQL)
- **Admin**: Can manage users and create accounts
- **User**: Basic application access

**Security Feature**: Owner accounts CANNOT be created via API - only through direct database manipulation.

```javascript
// Prevent creating owner accounts via API
if (role === "owner") {
  return res.status(403).json({
    error: "Owner accounts can only be created manually via SQL for security reasons",
  });
}
```

### 6. **Request Body Size Limiting**

Prevents memory exhaustion attacks:

```javascript
app.use(express.json({ limit: "10mb" }));
```

### 7. **File Upload Security**

- File type validation (PDF only)
- File size limits enforced
- Files are processed server-side, not directly executed

### 8. **Database Security (Supabase)**

- Row Level Security (RLS) policies enabled
- Service role key stored server-side only
- Parameterized queries (no SQL injection)
- Security definer functions to prevent infinite recursion

### 9. **Authentication Security**

- Secure password requirements (min 6 chars, max 128 chars)
- Email verification required
- Session management via Supabase Auth
- JWT tokens with expiration
- Rate limiting on auth endpoints

### 10. **Webhook Security**

- URL validation before saving
- Webhook URLs sanitized
- HTTPS enforcement for webhook URLs recommended
- No direct command execution from webhook responses

## Protected Attack Vectors

### ✅ Command Injection (React2Shell)
- All user inputs are sanitized
- Special shell characters removed: `; & | $ ( ) { } [ ] < >`
- No `eval()` or `Function()` calls in codebase
- File paths use `path.join()` to prevent directory traversal

### ✅ XSS (Cross-Site Scripting)
- React's built-in XSS protection (automatic escaping)
- CSP headers configured
- No `dangerouslySetInnerHTML` except in safe, static contexts
- User inputs sanitized before storage

### ✅ SQL Injection
- Supabase client uses parameterized queries
- No raw SQL with string concatenation
- RLS policies enforce data access rules

### ✅ CSRF (Cross-Site Request Forgery)
- JWT authentication tokens required
- CORS configured appropriately
- SameSite cookie attributes

### ✅ Path Traversal
- All file operations use `path.join()`
- Directory access restricted to specific folders
- No direct user input in file paths

### ✅ DDoS/Brute Force
- Rate limiting on all endpoints
- Stricter limits on authentication endpoints
- Request body size limits

### ✅ Prototype Pollution
- Dependencies updated to patch known vulnerabilities
- No unsafe object merging from user input

## Environment Variables Security

**Never commit these to version control:**

```env
# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BOOKS_WEBHOOK_URL=https://your-webhook.com
STATS_WEBHOOK_URL=https://your-webhook.com

# Client-side (safe to expose)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Security Notes:**
- Service role key has full database access - keep it secret
- Store in `.env` file (gitignored)
- Use environment variables in production (not .env files)
- Rotate keys periodically

## Best Practices

### For Developers

1. **Always validate user input** before processing
2. **Never trust client-side validation** - always validate on server
3. **Use parameterized queries** - never concatenate SQL
4. **Keep dependencies updated** - run `npm audit` regularly
5. **Follow principle of least privilege** - grant minimum required permissions
6. **Log security events** - monitor for suspicious activity
7. **Use HTTPS in production** - never send credentials over HTTP
8. **Sanitize all user inputs** - even if they seem safe

### For Administrators

1. **Keep service role key secret** - never commit to git
2. **Enable 2FA** for admin accounts when possible
3. **Regularly review user roles** and permissions
4. **Monitor rate limit triggers** for potential attacks
5. **Keep the application updated** - apply security patches promptly
6. **Use strong passwords** - minimum 12 characters recommended
7. **Limit admin accounts** - only create when necessary
8. **Audit logs regularly** - check for suspicious activity

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email the security team with details
3. Include steps to reproduce
4. Allow reasonable time for a fix before disclosure

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set correctly
- [ ] Service role key is stored securely (not in code)
- [ ] HTTPS is configured and enforced
- [ ] Rate limiting is enabled
- [ ] Dependencies are up to date (`npm audit`)
- [ ] RLS policies are enabled in Supabase
- [ ] Admin accounts are properly secured
- [ ] Webhook URLs use HTTPS
- [ ] CSP headers are configured
- [ ] Logs are monitored regularly
- [ ] Backups are configured
- [ ] Owner role is set via SQL only

## Security Updates

Last security audit: December 2024

### Recent Improvements
- ✅ Updated React to v19.2.3
- ✅ Updated Vite to v7.3.0
- ✅ Fixed glob vulnerability (command injection)
- ✅ Fixed js-yaml vulnerability (prototype pollution)
- ✅ Added Helmet.js for security headers
- ✅ Added express-rate-limit for DDoS protection
- ✅ Implemented comprehensive input validation
- ✅ Added webhook URL validation
- ✅ Enforced password strength requirements
- ✅ Added UUID validation for user operations

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## Version History

- **v1.1.0** (Dec 2024) - Comprehensive security hardening
- **v1.0.0** - Initial release with basic security measures