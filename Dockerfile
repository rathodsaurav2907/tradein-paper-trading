# Multi-stage build for production-ready Node.js container
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies based on package.json
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5002

EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/health || exit 1

CMD ["node", "src/server.js"]
