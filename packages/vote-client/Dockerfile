FROM node:lts-slim AS install
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --include dev --silent && mv node_modules ../

FROM install AS build
ARG BACKEND_ENDPOINT=https://realtime.myplanningpoker.dev
ENV VITE_BACKEND_ENDPOINT=$BACKEND_ENDPOINT

COPY . .
RUN npm run build

FROM caddy:2.10 AS runtime
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/build/client /srv/app
