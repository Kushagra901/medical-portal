# ============================================
# Backend API (Express + MongoDB)
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source code
COPY config/ ./config/
COPY controllers/ ./controllers/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY routes/ ./routes/
COPY server.js ./

EXPOSE 5000

CMD ["node", "server.js"]
