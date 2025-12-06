# --- Builder Stage ---
FROM node:20 AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmmirror.com
RUN yarn install --network-timeout 300000

# Copy source code and build
COPY . .
RUN yarn build

# --- Production Stage ---
FROM node:20 AS production
WORKDIR /app
ENV NODE_ENV=production

# Use faster registry
RUN yarn config set registry https://registry.npmmirror.com

# Copy only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production --network-timeout 300000

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["node", "dist/main.js"]
