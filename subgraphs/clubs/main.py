"""
Main module for the Clubs Microservice.

This module sets up the FastAPI application and integrates the Strawberry
GraphQL schema.
It includes the configuration for queries, mutations, and context.

Attributes:
    GLOBAL_DEBUG (str): Environment variable that Enables or Disables debug
                        mode. Defaults to "False".
    DEBUG (bool): Indicates whether the application is running in debug mode.
    gql_app (GraphQLRouter): The GraphQL router for handling GraphQL requests.
    app (FastAPI): The FastAPI application instance.
"""

from contextlib import asynccontextmanager
from os import getenv

import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from strawberry.tools import create_type

# override PyObjectId and Context scalars
from db import ensure_clubs_index
from models import PyObjectId
from mutations import mutations
from otypes import Context, PyObjectIdType

# import all queries and mutations
from queries import queries

# create query types
Query = create_type("Query", queries)

# create mutation types
Mutation = create_type("Mutation", mutations)


# Returns The custom context by overriding the context getter.
async def get_context() -> Context:
    return Context()


# initialize federated schema
schema = strawberry.federation.Schema(
    query=Query,
    mutation=Mutation,
    enable_federation_2=True,
    scalar_overrides={PyObjectId: PyObjectIdType},
)

# check whether running in debug mode
DEBUG = getenv("GLOBAL_DEBUG", "False").lower() in ("true", "1", "t")

# serve API with FastAPI router
gql_app = GraphQLRouter(schema, graphiql=True, context_getter=get_context)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await ensure_clubs_index()
    yield
    # Shutdown


app = FastAPI(
    debug=DEBUG,
    title="CC Clubs Microservice",
    desciption="Handles Data of Clubs",
    lifespan=lifespan,
)
app.include_router(gql_app, prefix="/graphql")
