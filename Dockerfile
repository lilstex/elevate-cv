# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=512
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /app

# 1. Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1-0-0 \
    libpangocairo-1-0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=1024 

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# If you have views/ejs files, ensure they are copied!
COPY --from=builder /app/views ./views 

EXPOSE 2200
CMD ["node", "dist/main"]