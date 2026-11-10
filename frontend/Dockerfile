
# Stage 1: Build React frontend
FROM docker.io/library/node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install exact dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build production files
RUN npm run build

# Stage 2: Serve using Nginx
FROM docker.io/library/nginx:alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
