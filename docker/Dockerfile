FROM node:current-alpine3.20 as build

WORKDIR /app

COPY . ./

# ---
FROM fholzer/nginx-brotli:latest

WORKDIR /etc/nginx
ADD nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
# "nginx" implied by base image
CMD ["-g", "daemon off;"]