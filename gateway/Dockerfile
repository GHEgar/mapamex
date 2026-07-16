# syntax=docker/dockerfile:1
FROM node:24-alpine AS widget_builder

WORKDIR /app

COPY --from=visor widget/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY --from=visor widget/ .

RUN npm run build && cp dist/visor.v1.js dist/visor.js

FROM node:24-alpine AS spa_builder

WORKDIR /app

COPY --from=visor frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY --from=visor frontend/ .

ARG VITE_BASE_PATH=/
ARG VITE_BACKEND_API_HOST=/visor/api/
ARG VITE_GEOSERVER_URL=/geoserver/
ARG VITE_SITE_URL=
ARG VITE_NODE_ENV=production
ARG VITE_APP_ENV=production
ARG VITE_STORAGE_ORIGIN=

ENV VITE_BASE_PATH=$VITE_BASE_PATH \
    VITE_BACKEND_API_HOST=$VITE_BACKEND_API_HOST \
    VITE_GEOSERVER_URL=$VITE_GEOSERVER_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_NODE_ENV=$VITE_NODE_ENV \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_STORAGE_ORIGIN=$VITE_STORAGE_ORIGIN

RUN npm run build

FROM nginx:1.28.2-alpine

RUN apk add --no-cache gettext \
    && rm -f /etc/nginx/conf.d/default.conf

COPY nginx/templates/ /etc/nginx/templates/
COPY nginx/conf.d/ /etc/nginx/templates/conf.d/
COPY nginx/includes/ /etc/nginx/includes/
COPY nginx/error-pages/ /etc/nginx/error-pages/
COPY nginx/static/ /usr/share/nginx/html/
COPY --from=spa_builder /app/dist /usr/share/nginx/visor
COPY --from=widget_builder /app/dist /usr/share/nginx/visor/widget/v1

RUN mkdir -p /etc/nginx/certs /var/cache/nginx/geoserver

EXPOSE 80 443

CMD ["/bin/sh", "-c", \
    "envsubst '${REAL_IP_FROM}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf && \
    for f in /etc/nginx/templates/conf.d/*; do \
        envsubst '${GEOSERVER_HOST}' < \"$f\" > /etc/nginx/conf.d/$(basename \"${f%.template}\"); \
    done && \
    envsubst '${PORTAL_HOST} ${VISOR_BACKEND_HOST} ${VISOR_MCP_HOST} ${STORAGE_HOST} ${CMS_HOST} ${GEOSERVER_HOST} ${APP_DOMAIN} ${SSL_CERTIFICATE} ${SSL_CERTIFICATE_KEY} ${GTM_ID} ${SEO_ENABLED}' \
        < /etc/nginx/templates/gateway.conf.template > /etc/nginx/conf.d/gateway.conf && \
    if [ -n \"$GTM_ID\" ]; then envsubst '${GTM_ID}' < /etc/nginx/includes/gtm.inc.template > /etc/nginx/includes/gtm.inc; else : > /etc/nginx/includes/gtm.inc; fi && \
    nginx -g 'daemon off;'"]
