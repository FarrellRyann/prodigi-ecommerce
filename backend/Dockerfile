FROM node:24.13.0-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y openssl ca-certificates netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy ONLY package files first
COPY package*.json ./
RUN npm install

# Copy everything else (Protected by .dockerignore)
COPY . .

# Start the dev server
CMD ["npm", "run", "dev"]