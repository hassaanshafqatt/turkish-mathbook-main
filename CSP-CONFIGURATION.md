# Content Security Policy (CSP) Configuration

## Overview

This document explains the Content Security Policy (CSP) configuration for the Questioneer application and how to manage it when integrating new external services.

## What is CSP?

Content Security Policy (CSP) is a security feature that helps prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks. It works by specifying which domains the browser should consider valid sources for executable scripts, stylesheets, images, and other resources.

## Current CSP Configuration

The CSP is configured in `server.js` using the Helmet middleware. Here's the current configuration:

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://www.googleapis.com",
        "https://n8n.datavideocozum.com",
      ],
    },
  },
  crossOriginEmbedderPolicy: false,
})
```

## CSP Directives Explained

### `defaultSrc: ["'self'"]`
Default policy for all resource types. Only allows resources from the same origin.

### `scriptSrc: ["'self'", "'unsafe-inline'"]`
- `'self'`: JavaScript can only be loaded from the same origin
- `'unsafe-inline'`: Allows inline `<script>` tags (needed for Vite/React)

**Note:** In production, consider using nonces or hashes instead of `'unsafe-inline'` for better security.

### `styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]`
- Allows stylesheets from same origin
- Allows inline styles (needed for React styling)
- Allows Google Fonts stylesheets

### `fontSrc: ["'self'", "https://fonts.gstatic.com"]`
- Allows fonts from same origin
- Allows fonts from Google Fonts CDN

### `imgSrc: ["'self'", "data:", "https:"]`
- Same origin images
- Data URIs (base64 encoded images)
- Any HTTPS image source

### `connectSrc` (Most Important for External APIs)
Controls which URLs can be loaded using fetch, XMLHttpRequest, WebSocket, etc.

Current allowed domains:
- `'self'`: Same origin API calls
- `https://*.supabase.co`: Supabase authentication and database
- `https://www.googleapis.com`: Google Fonts API (for font list)
- `https://n8n.datavideocozum.com`: N8N webhook for books and stats

## Common CSP Violations and Solutions

### Error: "Refused to connect because it violates the document's Content Security Policy"

This error occurs when your JavaScript tries to fetch data from a domain not listed in `connectSrc`.

**Solution:**
1. Identify the blocked domain from the browser console
2. Add it to the `connectSrc` array in `server.js`
3. Rebuild and redeploy

**Example:**
```javascript
connectSrc: [
  "'self'",
  "https://*.supabase.co",
  "https://www.googleapis.com",
  "https://n8n.datavideocozum.com",
  "https://your-new-api.com",  // Add new domain here
],
```

## Adding New External Services

When integrating a new external API or service:

1. **Identify the domain**: Check the API documentation for the base URL
2. **Determine the directive**: 
   - Fetch/API calls → `connectSrc`
   - Fonts → `fontSrc`
   - Images → `imgSrc`
   - Stylesheets → `styleSrc`
   - Scripts → `scriptSrc`
3. **Update `server.js`**: Add the domain to the appropriate directive
4. **Test**: Check browser console for CSP violations
5. **Document**: Update this file with the new service

## Security Best Practices

### ✅ DO:
- Always use HTTPS URLs in CSP directives
- Be specific with domains (avoid wildcards when possible)
- Regularly audit and remove unused domains
- Test CSP changes in development before deploying
- Monitor browser console for CSP violations in production

### ❌ DON'T:
- Never use `'unsafe-eval'` unless absolutely necessary
- Avoid `*` (wildcard) which allows all domains
- Don't add HTTP URLs (only HTTPS for external resources)
- Avoid adding entire CDN domains if you only use specific resources

## Testing CSP Changes

### Local Development:
1. Update `server.js` with new CSP directives
2. Restart the server: `npm run dev` or `npm start`
3. Open browser DevTools → Console
4. Look for CSP violation messages
5. Verify all features work correctly

### Production:
1. Deploy changes to staging environment first
2. Test all functionality, especially:
   - Authentication (Supabase)
   - Font loading (Google Fonts)
   - Book fetching (N8N webhook)
   - Any new integrations
3. Monitor error logs for CSP violations
4. Deploy to production after verification

## CSP Reporting (Future Enhancement)

Consider adding CSP reporting to monitor violations:

```javascript
contentSecurityPolicy: {
  directives: {
    // ... existing directives
    reportUri: ['/api/csp-violation-report'],
  },
}
```

Then create an endpoint to log violations for analysis.

## Environment-Specific Configuration

For different environments, you can use environment variables:

```javascript
const isProduction = process.env.NODE_ENV === 'production';

const connectSrcDomains = [
  "'self'",
  "https://*.supabase.co",
  "https://www.googleapis.com",
  process.env.WEBHOOK_DOMAIN || "https://n8n.datavideocozum.com",
];

// Add development-only domains
if (!isProduction) {
  connectSrcDomains.push("http://localhost:*");
}
```

## Troubleshooting

### Issue: Font not loading
**Check:** Is the font domain in `fontSrc`? Is the stylesheet domain in `styleSrc`?

### Issue: API calls failing
**Check:** Is the API domain in `connectSrc`?

### Issue: Images not displaying
**Check:** Is the image domain in `imgSrc`?

### Issue: WebSocket connection blocked
**Check:** Add `wss://your-domain.com` to `connectSrc`

## Related Files

- `server.js` - Main CSP configuration
- `server/security.js` - Security utilities and helper CSP config (for reference)
- `SECURITY.md` - General security documentation

## References

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CSP Evaluator Tool](https://csp-evaluator.withgoogle.com/)

## Changelog

- **2025-01-XX**: Added `https://www.googleapis.com` and `https://n8n.datavideocozum.com` to `connectSrc` to fix font loading and webhook API calls
- **Initial Setup**: Base CSP configuration with Supabase support