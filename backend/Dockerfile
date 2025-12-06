# --- Production Stage ---
FROM node:20 AS production
WORKDIR /app

# Use faster registry
RUN yarn config set registry https://registry.npmmirror.com

# Copy only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["node", "dist/main.js"]
