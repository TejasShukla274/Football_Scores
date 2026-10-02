# Backend API image
# Secrets are NOT baked in - pass them at runtime (docker-compose env_file or -e API_KEY=...)
FROM node:22-alpine

WORKDIR /app

# Install dependencies first so this layer caches across code changes
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5001

ENV NODE_ENV=production

CMD ["node", "server.js"]
