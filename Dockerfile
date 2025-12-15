# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Define build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WEBHOOK_URL

# Set as environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_WEBHOOK_URL=$VITE_WEBHOOK_URL

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage (Node.js instead of Nginx)
FROM node:20-alpine

WORKDIR /app

# Copy package files for production dependency installation
COPY package*.json ./

# Install ONLY production dependencies (express, cors, etc.)
RUN npm ci --only=production

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server.js .

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 7893

# Start server
CMD ["node", "server.js"]
