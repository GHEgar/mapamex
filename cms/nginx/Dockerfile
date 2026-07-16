# syntax=docker/dockerfile:1
FROM node:24-alpine AS admin-builder
WORKDIR /app

COPY ./admin/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --fund=false

COPY ./admin/ .
ARG VITE_NODE_ENV=production
ARG VITE_ADMIN_API_URL=/api/administrador
ARG VITE_WEB_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL
ENV VITE_WEB_URL=$VITE_WEB_URL
ARG BUILD_STATS
ENV BUILD_STATS=$BUILD_STATS
RUN --mount=type=cache,target=/app/node_modules/.vite \
    --mount=type=cache,target=/root/.npm \
    npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/conf.d/cms.conf /etc/nginx/conf.d/cms.conf
COPY --from=admin-builder /app/dist /usr/share/nginx/html/cms
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
