# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
# Limit Node memory (CRITICAL for low-RAM CI)
ENV NODE_OPTIONS=--max-old-space-size=512
# Copy only dependency files first
COPY package*.json ./
# Deterministic, faster, lower memory
RUN npm ci --legacy-peer-deps --no-audit --no-fund
# Copy source
COPY . .
# Build
RUN npm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=256

# Copy production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 2200
CMD ["node", "dist/main"]