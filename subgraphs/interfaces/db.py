"""
MongoDB Initialization Module.

This module sets up the connection to the MongoDB database.

Attributes:
    MONGO_USERNAME (str): An environment variable having MongoDB username.
                          Defaults to "username".
    MONGO_PASSWORD (str): An environment variable having MongoDB password.
                          Defaults to "password".
    MONGO_PORT (str): MongoDB port. Defaults to "27017".
    MONGO_URI (str): MongoDB URI.
    MONGO_DATABASE (str): MongoDB database name.
    client (pymongo.AsyncMongoClient): MongoDB client.
    db (pymongo.asynchronous.database.AsyncDatabase): MongoDB database.
    ccdb (pymongo.asynchronous.collection.AsyncCollection): MongoDB Clubs
                                                        Council collection.
    docsstoragedb (pymongo.asynchronous.collection.AsyncCollection): MongoDB
                                                         documents collection.
"""

from os import getenv

from pymongo import AsyncMongoClient

# get mongodb URI and database name from environment variale
MONGO_URI = "mongodb://{}:{}@mongo:{}/".format(
    getenv("MONGO_USERNAME", default="username"),
    getenv("MONGO_PASSWORD", default="password"),
    getenv("MONGO_PORT", default="27107"),
)
MONGO_DATABASE = getenv("MONGO_DATABASE", default="default")

# instantiate mongo client
client = AsyncMongoClient(MONGO_URI)

# get database
db = client[MONGO_DATABASE]
ccdb = db.cc
docsstoragedb = db.docsstorage
