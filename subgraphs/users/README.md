# Users Microservice

This microservice is built using **FastAPI**, **Strawberry (GraphQL)**,
and **MongoDB**. It serves as a subgraph for managing **user-related
data and operations**, providing queries and mutations to handle user
details and activities.

## Features

-   **GraphQL API**: Provides queries and mutations for user management.
-   **User Operations**: Supports creating, updating, and retrieving
    user details.
-   **Database Integration**: Uses MongoDB for storage.
-   **Efficient Data Handling**: Optimized for managing user-related
    data efficiently.

## Usage

This microservice is meant to be ran with the docker-compose script, the
source code for this can be found in the
[`services repo`](https://github.com/Clubs-Council-IIITH/services).

1.  Go to [Clubs-Council-IIITH Services
    Repository](https://github.com/Clubs-Council-IIITH/setup).
2.  Follow the setup instructions provided there.

## Developer Info

-   **GraphQL Endpoint**: `http://users/graphql` (Accessible via the
    gateway)

### Available GraphQL Operations:

#### Queries

-   Queries to get the user metadata (stored in database) and user
    profile (stored in ldap).
-   Queries to get users given an input, like role, batch and list of
    uids.

#### Mutations

-   There are only update mutations to update some user meta like roles,
    phone number or user data as a whole.

#### Utils

Contains scripts to perform ldapsearch and get user info.
