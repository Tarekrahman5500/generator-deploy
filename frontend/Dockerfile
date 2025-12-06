# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Use faster registry
RUN yarn config set registry https://registry.npmmirror.com

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["yarn", "preview"]
