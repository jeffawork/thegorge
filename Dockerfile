# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development dependencies
FROM base AS dev-deps
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Copy source code and dependencies
COPY --from=dev-deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy environment file template
COPY .env.example .env

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/app.js"]
