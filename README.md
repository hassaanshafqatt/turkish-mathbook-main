# MathBook Content Generator

AI-powered tool for generating interactive mathbook content with custom typography and voice narration.

## Features

- Upload PDF documents for processing
- Custom Google Fonts selection
- AI voice narration configuration
- Multi-language support (English/Turkish)
- n8n webhook integration

## Setup

### Installation

```bash
npm install
```

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

1. Click the settings icon (bottom-left) to configure:
   - **Webhook**: Set your n8n webhook URL (if not set via environment variable)
   - **Voices**: Add AI voices for narration
   - **Language**: Choose between English and Turkish

2. Upload a PDF document
3. Select a Google Font
4. Choose a narration voice
5. Click "Generate MathBook Content"

## Environment Variables

- `VITE_WEBHOOK_URL`: Permanent webhook URL (optional, overrides user settings)

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
docker build -t mathbook-app .
```

Or with build arguments:

```bash
docker build --build-arg VITE_WEBHOOK_URL=https://your-webhook-url.com/webhook/... -t mathbook-app .
```

2. **Run the container:**

```bash
docker run -d -p 7893:80 --name mathbook-app mathbook-app
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
