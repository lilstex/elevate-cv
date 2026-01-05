# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /app
# We only need production dependencies here
COPY --from=builder /app/package*.json ./
RUN npm install --only=production --legacy-peer-deps
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]