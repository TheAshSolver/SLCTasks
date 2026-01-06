"""
MongoDB Initialization Module.

This module sets up the connection to the MongoDB database.
It ensures that the required indexes are created.

Attributes:
    MONGO_USERNAME (str): An environment variable having MongoDB username.
                          Defaults to "username".
    MONGO_PASSWORD (str): An environment variable having MongoDB password.
                          Defaults to "password".
    MONGO_PORT (str): MongoDB port. Defaults to "27017".
    MONGO_URI (str): MongoDB URI.
    MONGO_DATABASE (str): MongoDB database name.
    client (pymongo.AsyncMongoClient): MongoDB async client.
    db (pymongo.asynchronous.database.AsyncDatabase): MongoDB database.
    clubsdb (pymongo.asynchronous.collection.AsyncCollection): MongoDB
                                                             clubs collection.
"""

from os import getenv

from pymongo import AsyncMongoClient

# get mongodb URI and database name from environment variale
MONGO_URI = "mongodb://{}:{}@mongo:{}/".format(
    getenv("MONGO_USERNAME", default="username"),
    getenv("MONGO_PASSWORD", default="password"),
    getenv("MONGO_PORT", default="27017"),
)
MONGO_DATABASE = getenv("MONGO_DATABASE", default="default")

# instantiate mongo client
client = AsyncMongoClient(MONGO_URI)

# get database
db = client[MONGO_DATABASE]
clubsdb = db.clubs


async def ensure_clubs_index():
    try:
        indexes = await clubsdb.index_information()
        if "unique_clubs" in indexes:
            print("The clubs index exists.")
        else:
            await clubsdb.create_index(
                [("cid", 1)], unique=True, name="unique_clubs"
            )
            print("The clubs index was created.")
        print(await clubsdb.index_information())
    except Exception:
        pass
