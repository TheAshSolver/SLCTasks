# cache dependencies
FROM node:22-slim AS node_cache
WORKDIR /cache/
COPY package*.json .
RUN npm install --prefer-offline --no-audit --progress=true --loglevel verbose

# build and start
FROM node:22-slim AS build
ARG ENV=development
ENV NEXT_PUBLIC_ENV=$ENV
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /web

COPY --from=node_cache /cache/ /cache/
COPY entrypoint.sh /cache/

RUN chmod +x /cache/entrypoint.sh

ENTRYPOINT [ "/cache/entrypoint.sh" ]
CMD [ "npm", "run", "dev" ]
