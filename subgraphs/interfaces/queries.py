"""
Query Resolvers
"""

import json
import os
from typing import List

import httpx
import strawberry

from db import ccdb, docsstoragedb
from models import CCRecruitment, StorageFile

# import all models and types
from otypes import (
    CCRecruitmentType,
    Info,
    SignedURL,
    SignedURLInput,
    StorageFileType,
)
from utils import get_curr_time_str

inter_communication_secret = os.getenv("INTER_COMMUNICATION_SECRET")


# fetch signed url from the files service
@strawberry.field
async def signedUploadURL(details: SignedURLInput, info: Info) -> SignedURL:
    """
    Uploads file to the files service by any user.

    Args:
        details (otypes.SignedURLInput): contains the details of the file to be
                                  uploaded
        info (otypes.Info): contains the user's context information.

    Returns:
        (otypes.SignedURL): Signed URL for uploading files to the files service

    Raises:
        Exception: Not logged in!
        Exception: If the request failed.
    """
    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    async with httpx.AsyncClient() as client:
        # make request to files api
        response = await client.get(
            "http://files/signed-url",
            params={
                "user": json.dumps(user),
                "static_file": "true" if details.static_file else "false",
                "filename": details.filename,
                "inter_communication_secret": inter_communication_secret,
                "max_sizeMB": details.max_size_mb,
            },
        )

    # error handling
    if response.status_code != 200:
        raise Exception(response.text)

    return SignedURL(url=response.text)


@strawberry.field
async def ccApplications(
    info: Info,
    year: int = 2024,
) -> List[CCRecruitmentType]:
    """
    Returns list of all CC Applications for CC.

    Args:
        info (otypes.Info): contains the user's context information.
        year (int): The year of application. Defaults to 2024.

    Returns:
        (List[otypes.CCRecruitmentType]): List of all CC Applications
                                     for the given year.

    Raises:
        Exception: Not logged in!
        Exception: Not Authenticated to access this API!!
        Exception: Invalid year
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    if user.get("role", None) not in ["cc"]:
        raise Exception("Not Authenticated to access this API!!")

    if year < 2024:
        raise Exception("Invalid year")

    results = await ccdb.find().to_list(length=None)
    applications = [
        CCRecruitmentType.from_pydantic(CCRecruitment.model_validate(result))
        for result in results
        if result.get("apply_year", 2024) == year
    ]

    return applications


@strawberry.field
async def haveAppliedForCC(info: Info, year: int | None = None) -> bool:
    """
    Finds whether any logged in user has applied for CC.

    Args:
        info (otypes.Info): contains the user's context information.
        year (int): The year of application. Defaults to None.

    Returns:
        (bool): True if the user has applied for CC, False otherwise.

    Raises:
        Exception: Not logged in!
        Exception: Not Authenticated to access this API!!
        Exception: Invalid year
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    if user.get("role", None) not in ["public"]:
        raise Exception("Not Authenticated to access this API!!")

    if year is None:
        year = int(get_curr_time_str()[:4])

    if year < 2024:
        raise Exception("Invalid year")

    # check if user already applied in the same year
    results = await ccdb.find({"uid": user["uid"]}).to_list(length=None)
    for result in results:
        if result.get("apply_year", 2024) == year:
            return True
    return False


# Storagefile queries


@strawberry.field
async def storagefiles(filetype: str) -> List[StorageFileType]:
    """
    Gets all the storage files, has public access

    Args:
        filetype (str): The type of file to get.

    Returns:
        (List[otypes.StorageFileType]): List of storage files of the given type
    """
    storage_files = await docsstoragedb.find({"filetype": filetype}).to_list(
        length=None
    )
    return [
        StorageFileType.from_pydantic(StorageFile.model_validate(storage_file))
        for storage_file in storage_files
    ]


@strawberry.field
async def storagefile(file_id: str) -> StorageFileType:
    """
    Gets a single storage file by id, has public access

    Args:
        file_id (str): The id of the file to get

    Returns:
        (otypes.StorageFileType): The storage file with the given id
    """
    storage_file = await docsstoragedb.find_one({"_id": file_id})
    return StorageFileType.from_pydantic(
        StorageFile.model_validate(storage_file)
    )


# register all queries
queries = [
    signedUploadURL,
    ccApplications,
    haveAppliedForCC,
    storagefiles,
    storagefile,
]
