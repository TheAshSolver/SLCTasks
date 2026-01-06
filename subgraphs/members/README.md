# Members Microservice

This microservice is built using **FastAPI**, **Strawberry (GraphQL)**,
and **MongoDB**. It serves as a subgraph for managing **member-related
data and operations**, providing queries and mutations to handle member
details and activities.

## Features

-   **GraphQL API**: Provides queries and mutations for member
    management.
-   **Member Operations**: Supports creating, updating, and retrieving
    member details.
-   **Database Integration**: Uses MongoDB for storage.
-   **Efficient Data Handling**: Optimized for managing member-related
    data efficiently.

## Usage

This microservice is meant to be ran with the docker-compose script, the
source code for this can be found in the
[`services repo`](https://github.com/Clubs-Council-IIITH/services).

1.  Go to [Clubs-Council-IIITH Services
    Repository](https://github.com/Clubs-Council-IIITH/setup).
2.  Follow the setup instructions provided there.

## Developer Info

-   **GraphQL Endpoint**: `http://members/graphql` (Accessible via the
    gateway)

### Available GraphQL Operations:

#### Queries

-   Queries involve fetching the specific member details.
-   Some queries like PendingMembers and CurrentMembers return uids of
    such members.
-   There are other queries to get specific info about members like
    roles.

#### Mutations

Other than the CRUD operations, there is updateMemberCid if the member
club cid changes and we have reject and approve members used by Clubs
Council.
