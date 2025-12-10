# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

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
