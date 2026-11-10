
# Backend Dockerfile for LanceHub
FROM docker.io/library/node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Start Express backend
CMD ["npm", "start"]
