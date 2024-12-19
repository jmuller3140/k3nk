# Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Install PostgreSQL client libraries
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev libpq-dev

# Copy package files
COPY package*.json ./
COPY drizzle.config.ts ./

# Install dependencies (skip postinstall script during build)
RUN npm install --ignore-scripts

# Copy application code
COPY . .

# Generate drizzle migrations with a dummy DATABASE_URL
ENV DATABASE_URL="postgresql://postgres:vbmSawuWmhiWUuQbDnOWHKLDWYcxmPUy@autorack.proxy.rlwy.net:46322/railway"
RUN npm run db:generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

# Install PostgreSQL client libraries and Python in production
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev libpq-dev python3 python-is-python3 make g++

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy migration files and scripts
COPY --from=builder /app/app/db/migrate.ts ./app/db/
COPY --from=builder /app/app/db/schema.ts ./app/db/
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/drizzle.config.ts ./

# Install production dependencies including tsx (skip postinstall script)
RUN npm install --production --ignore-scripts && \
    npm install tsx --ignore-scripts

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run migrations and start the application
CMD ["sh", "-c", "npx tsx app/db/migrate.ts && node server.js"]