# Stage 1: Build the application
FROM node:24-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json to cache dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies cleanly using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the client with relative path (/api/v1) for Caddy routing
ENV VITE_API_BASE_URL=/api/v1
RUN pnpm build

# Stage 2: Serve the application using Caddy
FROM caddy:latest-alpine

# Set default backend URL environment variable
ENV BACKEND_URL=http://localhost:4040

# Copy Caddyfile configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy build artifacts to Caddy's default directory
COPY --from=builder /app/dist /srv

EXPOSE 80
