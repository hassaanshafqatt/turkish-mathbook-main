# Questioneer Content Generator

AI-powered tool for generating interactive educational content with custom typography and voice narration.

## Features

- 🔐 **Supabase Authentication** - Secure user authentication with email/password
- 📄 **PDF Upload** - Upload PDF documents for processing
- 🎨 **Custom Fonts** - Google Fonts selection with live preview
- 🎤 **AI Voice Narration** - Configure ElevenLabs voices with custom instructions
- 🎨 **Background Colors** - Choose from 4 predefined colors (white, light blue, light yellow, gray)
- 📝 **Voice Instructions** - Optional field for customizing AI narration tone and style
- 📚 **Uploaded Books View** - See your previously uploaded books at a glance
- ✨ **Animation Controls** - Toggle hand and options animations
- 🌐 **Multi-language Support** - Full English/Turkish translation
- 🔗 **n8n Webhook Integration** - Flexible webhook configuration

## Setup

### Installation

```bash
npm install
```

### Authentication Setup

This application uses Supabase for authentication. Follow these steps:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your API credentials** from Settings → API
3. **Create a `.env` file** in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Configure authentication** in your Supabase dashboard:
   - Enable Email provider in Authentication → Providers
   - Set Site URL and Redirect URLs in Authentication → URL Configuration

📚 **Detailed Setup Guide:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete instructions

📖 **Implementation Details:** See [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) for technical documentation

### Configuration

#### Permanent Webhook URL

To set a permanent webhook URL that will be used by default, create a `.env` file in the root directory:

```env
VITE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

**Note:** 
- The environment variable takes priority over user-configured webhook URLs
- If `VITE_WEBHOOK_URL` is set, the webhook input in settings will be disabled
- If not set, users can configure their own webhook URL via the settings dialog (stored in localStorage)

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Click the settings icon to configure:
   - **Webhook**: Set your n8n webhook URL (if not set via environment variable)
   - **Voices**: Add AI voices for narration
   - **Language**: Choose between English and Turkish

2. Upload a PDF document
3. Select a Google Font
4. Choose a narration voice
5. Select a background color (white, light blue, light yellow, or gray)
6. (Optional) Add voice generation instructions to customize the AI narration
7. Toggle animation settings as desired
8. Click "Generate Content"

### Form Data Sent to Webhook

When submitting, the following data is sent:
- `pdf`: PDF file
- `googleFont`: Font name
- `voiceId`: ElevenLabs voice ID
- `backgroundColor`: Color name (white, light-blue, light-yellow, gray)
- `voiceInstructions`: Optional custom instructions for voice generation
- `showHandAnimation`: Boolean (true/false)
- `showOptionsAnimation`: Boolean (true/false)

### Uploaded Books

If `BOOKS_WEBHOOK_URL` is configured in your `.env` file, a sidebar section will display your uploaded books. This webhook should return:

```json
{
  "books": [
    {
      "id": "unique-id",
      "name": "Book Name",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Note:** This webhook URL can only be set via environment variables for security reasons, not through the UI.

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL (required for authentication)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (required for authentication)
- `VITE_WEBHOOK_URL`: Permanent webhook URL (optional, overrides user settings)
- `BOOKS_WEBHOOK_URL`: Webhook URL for fetching uploaded books list (optional, server-side only)
- `PORT`: Server port (optional, defaults to 7893)

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed

### Quick Start

1. **Build and run with Docker Compose:**

```bash
docker-compose up -d
```

The app will be available at `http://localhost:7893`

2. **Set permanent webhook URL (optional):**

Create a `.env` file in the project root:

```env
VITE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

Then rebuild:

```bash
docker-compose build
docker-compose up -d
```

### Manual Docker Build

1. **Build the Docker image:**

```bash
docker build -t questioneer-app .
```

Or with build arguments:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project-id.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key-here \
  --build-arg VITE_WEBHOOK_URL=https://your-webhook-url.com/webhook/... \
  -t questioneer-app .
```

2. **Run the container:**

```bash
docker run -d -p 7893:7893 --name questioneer-app questioneer-app
```

### Docker Commands

- **View logs:**
  ```bash
  docker-compose logs -f
  ```

- **Stop the container:**
  ```bash
  docker-compose down
  ```

- **Rebuild after changes:**
  ```bash
  docker-compose build --no-cache
  docker-compose up -d
  ```

- **Check container status:**
  ```bash
  docker-compose ps
  ```

### Production Deployment

For production, consider:

1. **Using a reverse proxy** (nginx, Traefik, etc.) in front of the container
2. **Setting up SSL/TLS** certificates (Let's Encrypt)
3. **Using environment-specific build args** for different webhook URLs
4. **Monitoring and logging** (Docker logs, health checks are already configured)

### Health Check

The container includes a health check endpoint at `/health`. You can verify it's running:

```bash
curl http://localhost:7893/health
```
