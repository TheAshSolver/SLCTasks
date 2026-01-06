# cache dependencies
FROM node:22-slim AS node_cache
WORKDIR /cache
COPY package*.json ./
RUN npm config set registry http://registry.npmjs.org/ --global
RUN npm install --prefer-offline --no-audit --progress=true --loglevel verbose

# build and start
FROM node:22-slim AS build
WORKDIR /gateway
ENV APOLLO_ELV2_LICENSE=accept
ENV APOLLO_TELEMETRY_DISABLED=1

COPY --from=node_cache /cache .
COPY . .

RUN tar -xvf ./composer/supergraph-v2.9.3-bin.tar.gz -C ./node_modules/@apollo/rover/binary/

ENTRYPOINT [ "./entrypoint.sh" ]