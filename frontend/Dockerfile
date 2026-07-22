# ── Stage 1: Vite build ─────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first (layer-cached when only source changes)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build


# ── Stage 2: nginx static server ────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
