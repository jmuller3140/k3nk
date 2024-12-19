# Use Node.js LTS (Long Term Support) version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install PostgreSQL client libraries
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev libpq-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 