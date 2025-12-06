# --- Builder Stage ---
FROM node:20 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 300000
COPY . .
RUN yarn build

# --- Production Stage ---
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Use faster registry
RUN yarn config set registry https://registry.npmmirror.com

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 300000

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["yarn", "preview"]
