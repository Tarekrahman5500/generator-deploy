# --- Builder Stage ---
FROM node:20 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 300000
COPY . .
RUN yarn build

# --- Production Stage ---
FROM caddy:2 AS production
WORKDIR /app

# Copy built files to Caddy web root
COPY --from=builder /app/dist /usr/share/caddy
COPY --from=builder /app/public /usr/share/caddy

# Copy your Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
