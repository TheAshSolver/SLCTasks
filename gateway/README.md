# GraphQL API Gateway

This project is an **Apollo Gateway** that unifies multiple GraphQL
microservices into a single federated endpoint. It acts as the central
entry point for handling and routing GraphQL queries.

## Features

-   **Federated GraphQL**: Combines multiple GraphQL services into a
    single API.
-   **Efficient Query Routing**: Directs queries to the appropriate
    subgraphs.
-   **Scalability**: Supports modular service expansion.
-   **Containerized Deployment**: Includes a `Dockerfile` for easy
    deployment.

## Project Structure

-   **`src/server.mjs`** – The main server handling GraphQL queries.
-   **`supergraph.yml`** – Defines the subgraphs for federation.
-   **`Dockerfile`** – Configures the containerized environment.
-   **`entrypoint.sh`** – Startup script for running the service.

## Running the Gateway

- Recommended to run this with other services in [`services repo`](https://github.com/clubs-council-iiith/gateway)

To start the service locally:

``` sh
npm install
npm start
```

Or, using Docker:

``` sh
docker build -t graphql-gateway .
docker run -p 4000:4000 graphql-gateway
```

This gateway provides a seamless way to interact with multiple GraphQL
microservices under a unified schema.
