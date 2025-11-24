# Multi-stage build for minimal final image
FROM node:18-alpine AS builder

LABEL maintainer="GRC Suite Team"
LABEL description="GRC Suite - Portable Edition"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application (if using TypeScript/bundler)
# RUN npm run build

# ---------------------------------------------------
# Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    sqlite \
    tzdata && \
    rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p \
    /app/data \
    /app/backups \
    /app/logs \
    /app/config \
    /app/templates && \
    chown -R appuser:appuser /app

# Copy from builder
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/package*.json ./

# Copy application files
COPY --chown=appuser:appuser . .

# Copy templates and configuration
COPY --chown=appuser:appuser templates ./templates
COPY --chown=appuser:appuser config ./config

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/app/data/grc.db \
    LOG_LEVEL=info

# Volume for persistent data
VOLUME ["/app/data", "/app/backups", "/app/logs"]

# Start command
# Note: Replace with actual entry point for your application
# If using a compiled binary, use: CMD ["./grc-suite"]
# If using Node.js, use: CMD ["node", "server.js"]
CMD ["node", "index.js"]
