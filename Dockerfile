# Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Install PostgreSQL client libraries
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev libpq-dev

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

# Install PostgreSQL client libraries in production
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev libpq-dev

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 