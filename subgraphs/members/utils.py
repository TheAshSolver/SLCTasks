import asyncio
import os
from datetime import datetime, timedelta

from cachetools import TTLCache
from httpx import AsyncClient

from db import membersdb
from models import Member
from otypes import MemberType

inter_communication_secret = os.getenv("INTER_COMMUNICATION_SECRET")
CACHE_TTL = int(timedelta(days=10).total_seconds())

club_category_cache = TTLCache(maxsize=100, ttl=CACHE_TTL)
cache_lock = asyncio.Lock()


async def non_deleted_members(member_input) -> MemberType:
    """
    Returns a member with his non-deleted roles

    Args:
        member_input (dict): json serialised FullMemberInput.

    Returns:
        (otypes.MemberType): Contains the details of the member.

    Raises:
        Exception: No such Record
    """

    updated_sample = await membersdb.find_one(
        {
            "$and": [
                {"cid": member_input["cid"]},
                {"uid": member_input["uid"]},
            ]
        },
        {"_id": 0},
    )
    if updated_sample is None:
        raise Exception("No such Record")

    roles = []
    for i in updated_sample["roles"]:
        if i["deleted"] is True:
            continue
        roles.append(i)
    updated_sample["roles"] = roles

    return MemberType.from_pydantic(Member.model_validate(updated_sample))


async def unique_roles_id(uid, cid):
    """
    Generates unique role ids for a member's roles

    Args:
        uid (str): The uid of the user.
        cid (str): The cid of the club.
    """
    pipeline = [
        {
            "$set": {
                "roles": {
                    "$map": {
                        "input": {"$range": [0, {"$size": "$roles"}]},
                        "in": {
                            "$mergeObjects": [
                                {"$arrayElemAt": ["$roles", "$$this"]},
                                {
                                    "rid": {
                                        "$toString": {
                                            "$add": [
                                                {"$toLong": datetime.now()},
                                                "$$this",
                                            ]
                                        }
                                    }
                                },
                            ]
                        },
                    }
                }
            }
        }
    ]
    await membersdb.update_one(
        {
            "$and": [
                {"cid": cid},
                {"uid": uid},
            ]
        },
        pipeline,
    )


async def getUser(uid, cookies=None) -> dict | None:
    """
    Query request to the Users microservice to fetch user details.

    Args:
        uid (str): The uid of the user.
        cookies (dict): The cookies of the user. Defaults to None.

    Returns:
        (dict | None): The details of the user.
    """

    try:
        query = """
            query GetUserProfile($userInput: UserInput!) {
                userProfile(userInput: $userInput) {
                    firstName
                    lastName
                    email
                    rollno
                    batch
                }
            }
        """
        variables = {"userInput": {"uid": uid}}
        async with AsyncClient(cookies=cookies) as client:
            result = await client.post(
                "http://gateway/graphql",
                json={"query": query, "variables": variables},
            )
        return result.json()["data"]["userProfile"]
    except Exception:
        return None


async def getUsersByList(uids: list, cookies=None) -> dict | None:
    """
    Query to Users Microservice to get user details in bulk,
    returns a dict with keys of user uids
    and value of user details

    Args:
        uids (list): list of uids of the users
        cookies (dict): The cookies of the user. Defaults to None.

    Returns:
        (dict | None): keys of user uids and value of user details
    """
    userProfiles = {}

    try:
        query = """
            query usersByList($userInputs: [UserInput!]!) {
                usersByList(userInputs: $userInputs) {
                    firstName
                    lastName
                    email
                    rollno
                    batch
                }
            }
        """
        variables = {"userInputs": [{"uid": uid} for uid in uids]}
        async with AsyncClient(cookies=cookies) as client:
            result = await client.post(
                "http://gateway/graphql",
                json={"query": query, "variables": variables},
            )
        for i in range(len(uids)):
            userProfiles[uids[i]] = result.json()["data"]["usersByList"][i]

        return userProfiles
    except Exception:
        return None


async def getUsersByBatch(
    batch: int, ug: bool = True, pg: bool = True, cookies=None
) -> dict | None:
    """
    Query to Users Microservice to get all
    users belonging to a particular batch

    Args:
        batch (int): batch year of the users
        cookies (dict): The cookies of the user. Defaults to None.

    Returns:
        (dict | None): keys of user uids and value of user details
    """
    try:
        batchDetails = dict()
        query = """
            query GetUsersByBatch($batchYear: Int!, $ug: Boolean, $pg: Boolean) {
                usersByBatch(batchYear: $batchYear, ug: $ug, pg: $pg) {
                    uid
                    firstName
                    lastName
                    rollno
                    batch
                    email
                }
            }
        """  # noqa: E501
        variables = {"batchYear": batch, "ug": ug, "pg": pg}
        async with AsyncClient(cookies=cookies) as client:
            result = await client.post(
                "http://gateway/graphql",
                json={"query": query, "variables": variables},
            )
        for user in result.json()["data"]["usersByBatch"]:
            batchDetails[user["uid"]] = user
        return batchDetails
    except Exception:
        return dict()


# get club name from club id
async def getClubDetails(
    clubid: str,
    cookies,
) -> dict | None:
    """
    Query to Clubs Microservice to get club details from club id

    Args:
        clubid (str): club id
        cookies (dict): The cookies of the user. Defaults to None.

    Returns:
        (dict | None): the club details
    """

    try:
        query = """
            query Club($clubInput: SimpleClubInput!) {
                club(clubInput: $clubInput) {
                    cid
                    category
                }
            }
        """
        variables = {"clubInput": {"cid": clubid}}
        async with AsyncClient(cookies=cookies) as client:
            result = await client.post(
                "http://gateway/graphql",
                json={"query": query, "variables": variables},
            )
        return result.json()["data"]["club"]
    except Exception:
        return {}


async def getClubs(cookies=None) -> list:
    """
    Query to Clubs Microservice to call the all clubs query

    Args:
        cookies (dict): The cookies of the user. Defaults to None.

    Returns:
        (dict | None): list of all clubs
    """
    try:
        query = """
            query AllClubs {
                allClubs {
                    cid
                    name
                }
            }
        """
        async with AsyncClient(cookies=cookies) as client:
            result = await client.post(
                "http://gateway/graphql",
                json={"query": query},
            )
        return result.json()["data"]["allClubs"]
    except Exception:
        return []


async def clubCategory(cid: str, cookies: dict | None = None) -> str:
    """
    Get the category of a club from its cid.
    Uses caching to reduce repeated calls.

    Args:
        cid (str): club id
        cookies (dict | None): The cookies of the user. Defaults to None.
    Returns:
        (str): category of the club
    """
    async with cache_lock:
        if cid in club_category_cache:
            return club_category_cache[cid]

    club_details = await getClubDetails(cid, cookies)

    if not club_details or "category" not in club_details:
        raise Exception(f"Club with cid {cid} not found.")

    category = club_details["category"]
    async with cache_lock:
        club_category_cache[cid] = category

    return category
