# Clubs Microservice

This microservice is built using **FastAPI**, **Strawberry (GraphQL)**, and **MongoDB**. It serves as a subgraph for managing **club-related data and operations**, providing queries and mutations to handle club details and activities.

## Features

- **GraphQL API**: Provides queries and mutations for club management.
- **Club Operations**: Supports creating, updating, and retrieving club details.
- **Database Integration**: Uses MongoDB for storage.
- **Efficient Data Handling**: Optimized for managing club-related data efficiently.

## Usage

This microservice is meant to be run with the docker-compose script, the source code for this can be found in the [`services repo`](https://github.com/Clubs-Council-IIITH/services).

1. Go to [Clubs-Council-IIITH Services Repository](https://github.com/Clubs-Council-IIITH/setup).
2. Follow the setup instructions provided there.

## Developer Info

- **GraphQL Endpoint**: `http://clubs/graphql` (Accessible via the gateway)

### Available GraphQL Operations:

#### Queries
- Retrieve club details and related information.

#### Mutations
- Create, update, and manage club data.
