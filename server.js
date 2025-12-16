import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7893;
const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// Books webhook URL from environment (read-only, not configurable via UI)
const BOOKS_WEBHOOK_URL = process.env.BOOKS_WEBHOOK_URL;
// Stats webhook URL from environment (read-only, not configurable via UI)
const STATS_WEBHOOK_URL = process.env.STATS_WEBHOOK_URL;

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

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize settings file if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
  const initialSettings = {
    webhooks: [], // Array of { id: string, name: string, url: string, active: boolean }
    voices: [], // Array of { id: string, name: string }
    language: "en",
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2));
}

// API Routes
app.get("/api/settings", (req, res) => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return res.json({ webhooks: [], voices: [], language: "en" });
    }
    const data = fs.readFileSync(SETTINGS_FILE, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading settings:", error);
    res.status(500).json({ error: "Failed to read settings" });
  }
});

app.post("/api/settings", (req, res) => {
  try {
    const newSettings = req.body; // Expects full settings object
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    res.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Error writing settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// Environment configuration endpoint (read-only)
app.get("/api/env", (req, res) => {
  try {
    res.json({
      booksWebhookUrl: BOOKS_WEBHOOK_URL || null,
      statsWebhookUrl: STATS_WEBHOOK_URL || null,
    });
  } catch (error) {
    console.error("Error reading environment config:", error);
    res.status(500).json({ error: "Failed to read environment configuration" });
  }
});

// Admin API - Create User
app.post("/api/admin/users", async (req, res) => {
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

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    if (!["owner", "admin", "user"].includes(role)) {
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

// Admin API - Delete User
app.delete("/api/admin/users/:userId", async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: "Admin service not configured",
      });
    }

    const { userId } = req.params;

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
