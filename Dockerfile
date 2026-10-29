FROM docker.io/library/node@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build
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

FROM docker.io/library/caddy@sha256:04913b1da43339a40ad1ea87827d70a576ac5aa6cf674c6e24fdca675887533a
RUN setcap -r /usr/bin/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/public/ /srv/site/
ENV XDG_CONFIG_HOME=/tmp/config XDG_DATA_HOME=/tmp/data
USER 1000:1000
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
