# cache dependencies
FROM node:22-slim AS node_cache
WORKDIR /cache/
COPY package*.json .
RUN npm install --prefer-offline --no-audit --progress=true --loglevel verbose --omit=dev

# build and start
FROM node:22-slim AS build
ARG ENV=production
ENV NEXT_PUBLIC_ENV=$ENV

WORKDIR /web

COPY --from=node_cache /cache/ .
COPY entrypoint.sh /cache/
COPY . .

RUN chmod +x /cache/entrypoint.sh
RUN npm run build

ENTRYPOINT [ "/cache/entrypoint.sh" ]
CMD [ "npm", "start" ]
