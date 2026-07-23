# Multi-stage Docker build for MndAI

# Stage 1: Backend builder
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 2: Frontend builder
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY --from=backend-builder /app/node_modules ./backend/node_modules
COPY backend ./backend

# Install frontend dependencies and built files
COPY --from=frontend-builder /app/build ./public

# Copy environment file
copy .  .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "backend/src/app.js"]
