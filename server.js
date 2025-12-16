import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7893;

// Supabase Admin Client (using service role key for admin operations)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log("Supabase admin client initialized");
} else {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY not configured - admin user creation will not work",
  );
}

// Security Middleware
app.use(
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
  }),
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Limit request body size
app.use(apiLimiter);

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  // Remove potential command injection characters
  return input.replace(/[;&|`$(){}[\]<>]/g, "");
};

const validateRole = (role) => {
  return ["owner", "admin", "user"].includes(role);
};

const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

// Admin API - Create User (with rate limiting)
app.post("/api/admin/users", authLimiter, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error:
          "Admin service not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env",
      });
    }

    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Missing required fields: email, password, role",
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        error: "Password is too long",
      });
    }

    // Validate role
    if (!validateRole(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be owner, admin, or user",
      });
    }

    // Prevent creating owner accounts via API (security measure)
    if (role === "owner") {
      return res.status(403).json({
        error:
          "Owner accounts can only be created manually via SQL for security reasons",
      });
    }

    // Create user with Supabase Admin API
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("Error creating user:", authError);
      return res.status(400).json({
        error: authError.message,
      });
    }

    // Update the user's role in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Error updating profile role:", profileError);
      // User was created but role assignment failed
      return res.status(500).json({
        error:
          "User created but role assignment failed: " + profileError.message,
        userId: authData.user.id,
      });
    }

    res.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Error in user creation:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Admin API - Delete User (with rate limiting)
app.delete("/api/admin/users/:userId", authLimiter, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: "Admin service not configured",
      });
    }

    const { userId } = req.params;

    // Validate userId format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        error: "Invalid user ID format",
      });
    }

    // Delete user via Supabase Admin API
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error);
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error in user deletion:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Handle React routing (serve index.html for all non-API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (BOOKS_WEBHOOK_URL) {
    console.log(`Books webhook URL configured: ${BOOKS_WEBHOOK_URL}`);
  } else {
    console.log(
      "Books webhook URL not configured (set BOOKS_WEBHOOK_URL in .env)",
    );
  }
  if (STATS_WEBHOOK_URL) {
    console.log(`Stats webhook URL configured: ${STATS_WEBHOOK_URL}`);
  } else {
    console.log(
      "Stats webhook URL not configured (set STATS_WEBHOOK_URL in .env)",
    );
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "⚠️  SUPABASE_SERVICE_ROLE_KEY not configured - admin user creation disabled",
    );
  }
});
