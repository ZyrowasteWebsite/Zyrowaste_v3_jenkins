# Stage 1 — build Vite app
FROM node:18 as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2 — nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# 👇 ADD THIS LINE
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]