import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7893;
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize settings file if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
    const initialSettings = {
        webhooks: [], // Array of { id: string, name: string, url: string, active: boolean }
        voices: [],   // Array of { id: string, name: string }
        language: 'en'
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2));
}

// API Routes
app.get('/api/settings', (req, res) => {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            return res.json({ webhooks: [], voices: [], language: 'en' });
        }
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const newSettings = req.body; // Expects full settings object
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
        res.json({ success: true, settings: newSettings });
    } catch (error) {
        console.error('Error writing settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Handle React routing (serve index.html for all non-API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
