# Interfaces Microservice

This microservice is built using **FastAPI**, **Strawberry (GraphQL)**,
and **MongoDB**. It serves as a subgraph for managing **some useful
interfaces (specifically linking to external services)**, providing 
queries and mutations to handle things like mailing and file upload.

## Features

-   **GraphQL API**: Provides queries and mutations for file management
-   **Database Integration**: Uses MongoDB for storage.
-   **File Management**: Can perform CRUD Operations on Storage Files
    and generate URLs when downloading
-   **Mailing Support:** We have interfaces for sending HTML emails for
    various purposes.

## Usage

This microservice is meant to be run with the docker-compose script, the
source code for this can be found in the
[`services repo`](https://github.com/Clubs-Council-IIITH/services).

1.  Go to [Clubs-Council-IIITH Services
    Repository](https://github.com/Clubs-Council-IIITH/setup).
2.  Follow the setup instructions provided there.

## Developer Info

-   **GraphQL Endpoint**: `http://interfaces/graphql` (Accessible via
    the gateway)

### Available GraphQL Operations:

#### Queries

-   Handles CC Recruitment. Gets the list of applications, and checks
    whether a user has applied to CC.
-   All storagefiles or individual storagefile by id can be fetched.

#### Mutations

-   Contains mutations related to application submission
-   Contains CRUD operations on the storagefiles.
-   Contains mutations to send mail to CC applicants.
-   Send Mail mutation which is used by other subgraphs like events, clubs etc too.
