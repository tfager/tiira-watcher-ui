FROM node:25.0-alpine AS build

WORKDIR /app
# "dev" or "production". Note, GHA always puts env-specific settings to .production.env
ARG BUILD_ENV="production" 

COPY . ./
RUN npm install
RUN npm run build:${BUILD_ENV}

# ---
FROM fholzer/nginx-brotli:latest

WORKDIR /etc/nginx
ADD nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# "nginx" implied by base image
CMD ["-g", "daemon off;"]
