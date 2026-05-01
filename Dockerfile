# ============================================
# STAGE 1: Build the React Frontend
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY public/ ./public/
COPY src/ ./src/
COPY .babelrc ./

# Build the React app
RUN npm run build

# ============================================
# STAGE 2: Serve with Nginx
# ============================================
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
