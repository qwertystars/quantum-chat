# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only vite for preview server (lightweight)
RUN npm install --only=production vite

# Create necessary directories for tmpfs
RUN mkdir -p /tmp /app/.vite

EXPOSE 3000

# Use vite preview for serving built files (production mode)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
