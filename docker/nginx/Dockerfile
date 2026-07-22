# Combines React dist + Laravel public/ + Nginx config (no bind mounts)
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_BASE_URL=/api
ARG VITE_REVERB_APP_KEY=changeme-reverb-key
ARG VITE_REVERB_HOST=127.0.0.1
ARG VITE_REVERB_PORT=80
ARG VITE_REVERB_SCHEME=http

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY \
    VITE_REVERB_HOST=$VITE_REVERB_HOST \
    VITE_REVERB_PORT=$VITE_REVERB_PORT \
    VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY public /var/www/html/public
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Healthcheck helper
RUN apk add --no-cache curl

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=10s \
    CMD curl -f http://127.0.0.1/healthz || exit 1
