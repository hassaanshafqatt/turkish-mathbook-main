/**
 * Security Utilities Module
 *
 * This module provides security validation and sanitization functions
 * to protect against various attack vectors including:
 * - Command injection
 * - XSS attacks
 * - SQL injection
 * - Path traversal
 * - Prototype pollution
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Sanitizes input by removing potential command injection characters
 * Protects against shell command injection (React2Shell vulnerability)
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove potential command injection characters
  // ; & | ` $ ( ) { } [ ] < > are commonly used for command chaining
  let sanitized = input.replace(/[;&|`$(){}[\]<>]/g, "");

  // Remove null bytes (can cause issues in C-based systems)
  sanitized = sanitized.replace(/\0/g, "");

  // Limit length to prevent DoS
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized.trim();
};

/**
 * Validates user role
 * @param {string} role - Role to validate
 * @returns {boolean} - True if valid role
 */
export const validateRole = (role) => {
  const validRoles = ["owner", "admin", "user"];
  return validRoles.includes(role);
};

/**
 * Validates URL format and protocol
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const validateUrl = (url) => {
  if (typeof url !== "string") return false;

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // Prevent localhost/internal IP addresses in production
    const hostname = parsed.hostname.toLowerCase();
    const dangerousHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

    if (
      process.env.NODE_ENV === "production" &&
      dangerousHosts.includes(hostname)
    ) {
      return false;
    }

    // Check for private IP ranges
    if (process.env.NODE_ENV === "production") {
      if (
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.match(/^172\.(1[6-9]|2\d|3[01])\./)
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Validates UUID format (v4)
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid UUID
 */
export const validateUUID = (uuid) => {
  if (typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (typeof password !== "string") {
    return { valid: false, message: "Password must be a string" };
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return {
      valid: false,
      message: "Password is too long (max 128 characters)",
    };
  }

  // Check for common weak passwords
  const weakPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "password123",
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: "Password is too weak" };
  }

  return { valid: true, message: "Password is valid" };
};

/**
 * Validates language code
 * @param {string} lang - Language code to validate
 * @returns {boolean} - True if valid language
 */
export const validateLanguage = (lang) => {
  const validLanguages = ["en", "tr"];
  return validLanguages.includes(lang);
};

/**
 * Sanitizes filename to prevent path traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== "string") return "";

  // Remove path separators and special characters
  let sanitized = filename.replace(/[/\\]/g, "");

  // Remove dots at start (prevent hidden files)
  sanitized = sanitized.replace(/^\.+/, "");

  // Remove any remaining dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
};

/**
 * Validates webhook configuration object
 * @param {object} webhook - Webhook object to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateWebhook = (webhook) => {
  if (!webhook || typeof webhook !== "object") {
    return { valid: false, message: "Webhook must be an object" };
  }

  if (!webhook.id || typeof webhook.id !== "string") {
    return { valid: false, message: "Webhook must have a valid id" };
  }

  if (!webhook.name || typeof webhook.name !== "string") {
    return { valid: false, message: "Webhook must have a valid name" };
  }

  if (!webhook.url || typeof webhook.url !== "string") {
    return { valid: false, message: "Webhook must have a valid url" };
  }

  if (!validateUrl(webhook.url)) {
    return { valid: false, message: "Webhook URL is invalid" };
  }

  if (typeof webhook.active !== "boolean") {
    return { valid: false, message: "Webhook active field must be boolean" };
  }

  return { valid: true, message: "Webhook is valid" };
};

/**
 * Validates voice configuration object
 * @param {object} voice - Voice object to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateVoice = (voice) => {
  if (!voice || typeof voice !== "object") {
    return { valid: false, message: "Voice must be an object" };
  }

  if (!voice.id || typeof voice.id !== "string") {
    return { valid: false, message: "Voice must have a valid id" };
  }

  if (!voice.name || typeof voice.name !== "string") {
    return { valid: false, message: "Voice must have a valid name" };
  }

  // Voice ID should be alphanumeric
  if (!/^[a-zA-Z0-9_-]+$/.test(voice.id)) {
    return { valid: false, message: "Voice ID contains invalid characters" };
  }

  return { valid: true, message: "Voice is valid" };
};

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

/**
 * Checks if a value is a safe object (not null, not array, is object)
 * @param {any} value - Value to check
 * @returns {boolean} - True if safe object
 */
export const isSafeObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

/**
 * Security headers configuration for Helmet.js
 */
export const securityHeadersConfig = {
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
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
};

/**
 * Rate limit configurations
 */
export const rateLimitConfig = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  },

  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  },

  // Settings endpoints
  settings: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 requests per window
    message: "Too many settings changes, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  },
};

/**
 * Logs security events (for monitoring)
 * @param {string} event - Event type
 * @param {object} details - Event details
 */
export const logSecurityEvent = (event, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ...details,
  };

  // In production, send to logging service
  // For now, just console log with security prefix
  console.warn(`[SECURITY] ${timestamp} - ${event}:`, details);

  // TODO: Integrate with logging service (e.g., Winston, Sentry)
};
