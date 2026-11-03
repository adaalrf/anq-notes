FROM docker.io/library/node:26-alpine@sha256:c6ad9e9c1d80f6eb607c26b4b0a132ff7a2344fad1c78ea3baa2a7d4c8de6d94 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY src/ src/
COPY site.config.ts tsconfig.json ./
COPY content/ content/
COPY styles/ styles/
COPY templates/ templates/
COPY assets/ assets/
ARG SITE_URL
RUN SITE_URL="$SITE_URL" npm run build

FROM docker.io/library/caddy:2.11-alpine@sha256:e70b164da81ef698b3ad19af799ea6086ce6d9e48ed4079eb9fe26f6fbf14ee5
RUN setcap -r /usr/bin/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/public/ /srv/site/
ENV XDG_CONFIG_HOME=/tmp/config XDG_DATA_HOME=/tmp/data
USER 1000:1000
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
