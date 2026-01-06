"""
Query resolvers
"""

import csv
import io
from datetime import datetime
from typing import List

import strawberry
from fastapi.encoders import jsonable_encoder

from db import membersdb
from models import Member

# import all models and types
from otypes import (
    Info,
    MemberCSVResponse,
    MemberInputDataReportDetails,
    MemberType,
    SimpleClubInput,
    SimpleMemberInput,
)
from utils import (
    getClubs,
    getUsersByBatch,
    getUsersByList,
)


@strawberry.field
async def member(memberInput: SimpleMemberInput, info: Info) -> MemberType:
    """
    Fetches details of a club member using the cid and uid given,
    for club and CC

    Args:
        memberInput (otypes.SimpleMemberInput): Contains the cid and
                                         uid of the member.
        info (otypes.Info): Contains the logged in user's details.

    Returns:
        (otypes.MemberType): Contains the details of the member.

    Raises:
        Exception: Not Authenticated
        Exception: Not Authenticated to access this API
        Exception: No such Record
    """

    user = {
       "role":"cc", 
       "uid":None
    }
    if user is None:
        raise Exception("Not Authenticated")

    uid = user["uid"]
    member_input = jsonable_encoder(memberInput)

    if (member_input["cid"] != uid or user["role"] != "club") and user[
        "role"
    ] != "cc":
        raise Exception("Not Authenticated to access this API")

    member = await membersdb.find_one(
        {
            "$and": [
                {"cid": member_input["cid"]},
                {"uid": member_input["uid"]},
            ]
        },
        {"_id": 0},
    )
    if member is None:
        raise Exception("No such Record")

    return MemberType.from_pydantic(Member.model_validate(member))


@strawberry.field
async def memberRoles(uid: str, info: Info) -> List[MemberType]:
    """
    Fetches a club memeber along with his roles

    A user can be part of many clubs and therefore have multiple roles,
    each in a different club hence each in a different document.
    This method searches for documents belonging to the same user.
    It returns the user's non-deleted and approved roles details in all
    clubs, for public.
    CC can also get unapproved roles.

    Args:
        uid (str): The uid of the user.
        info (otypes.Info): Contains the logged in user's details.

    Returns:
        (List[otypes.MemberType]): Contains a list of member's current roles.
    """

    user = {
       "role":"cc", 
       "uid":None
    }
    if user is None:
        role = "public"
    else:
        role = user["role"]

    results = await membersdb.find({"uid": uid}, {"_id": 0}).to_list(
        length=None
    )

    members = []
    for result in results:
        roles = result["roles"]
        roles_result = []
        for i in roles:
            if i["deleted"]:
                continue
            if role != "cc" and not i["approved"]:
                continue
            roles_result.append(i)
        if roles_result:
            result["roles"] = roles_result
            members.append(
                MemberType.from_pydantic(Member.model_validate(result))
            )

    return members


@strawberry.field
async def members(clubInput: SimpleClubInput, info: Info) -> List[MemberType]:
    """
    Returns all the members of a club.

    This method fetches all the members of a club.
    For CC and club, it returns all the members with their current
    non-deleted, approved and pending roles.
    For public, it returns all the members with their current non-deleted
    and approved roles.

    Args:
        clubInput (otypes.SimpleClubInput): Contains the cid of the club.
        info (otypes.Info): Contains the logged in user's details.

    Returns:
        (List[otypes.MemberType]): Contains a list of members.
    """
    user = {
       "role":"cc", 
       "uid":None
    }
    if user is None:
        role = "public"
    else:
        role = user["role"]

    club_input = jsonable_encoder(clubInput)

    role_conditions = [{"$ne": ["$$role.deleted", True]}]

    # for public users, only show approved roles
    if role == "public":
        role_conditions.append({"$eq": ["$$role.approved", True]})
    # for other clubs show only approved users
    elif role == "club" and user.get("uid") != club_input["cid"]:
        role_conditions.append({"$eq": ["$$role.approved", True]})
    # for CC and own club, show both approved and pending roles

    pipeline = [
        {"$match": {"cid": club_input["cid"]}},
        {
            "$addFields": {
                "roles": {
                    "$filter": {
                        "input": "$roles",
                        "as": "role",
                        "cond": {"$and": role_conditions},
                    }
                }
            }
        },
        {"$match": {"roles.0": {"$exists": True}}},
        {"$project": {"_id": 0}},
    ]

    members_cursor = await membersdb.aggregate(pipeline)
    members = [
        MemberType.from_pydantic(Member.model_validate(doc))
        async for doc in members_cursor
    ]
    return members


@strawberry.field
async def currentMembers(
    clubInput: SimpleClubInput, info: Info
) -> List[MemberType]:
    """
    Returns the current members of a club with their non-deleted,
    approved roles, for Public.

    Args:
        clubInput (otypes.SimpleClubInput): Contains the cid of the club.
        info (otypes.Info): Contains the logged in user's details.

    Returns:
        (List[otypes.MemberType]): Contains a list of members.

    Raises:
        Exception: Not Authenticated
    """
    club_input = jsonable_encoder(clubInput)

    pipeline = [
        {"$match": {"cid": club_input["cid"]}},
        {
            "$addFields": {
                "roles": {
                    "$filter": {
                        "input": "$roles",
                        "as": "role",
                        "cond": {
                            "$and": [
                                {"$ne": ["$$role.deleted", True]},
                                {"$eq": ["$$role.approved", True]},
                                {"$eq": ["$$role.end_year", None]},
                            ]
                        },
                    }
                }
            }
        },
        {"$match": {"roles.0": {"$exists": True}}},
        {"$project": {"_id": 0}},
    ]

    members_cursor = await membersdb.aggregate(pipeline)
    return [
        MemberType.from_pydantic(Member.model_validate(doc))
        async for doc in members_cursor
    ]


@strawberry.field
async def pendingMembers(info: Info) -> List[MemberType]:
    """
    Returns the pending members of all clubs with their non-deleted,
    pending roles for CC.
    Args:
        info (otypes.Info): Contains the logged in user's details.

    Returns:
        (List[otypes.MemberType]): Contains a list of members.

    Raises:
        Exception: Not Authenticated
    """
    user = {
       "role":"cc", 
       "uid":None
    }
    if user is None or user["role"] not in ["cc"]:
        raise Exception("Not Authenticated")
    pipeline = [
        {
            "$addFields": {
                "roles": {
                    "$filter": {
                        "input": "$roles",
                        "as": "role",
                        "cond": {
                            "$and": [
                                {"$ne": ["$$role.deleted", True]},
                                {"$eq": ["$$role.approved", False]},
                                {"$ne": ["$$role.rejected", True]},
                            ]
                        },
                    }
                }
            }
        },
        {"$match": {"roles.0": {"$exists": True}}},
        {"$project": {"_id": 0}},
    ]

    members_cursor = await membersdb.aggregate(pipeline)
    return [
        MemberType.from_pydantic(Member.model_validate(doc))
        async for doc in members_cursor
    ]


@strawberry.field
async def downloadMembersData(
    details: MemberInputDataReportDetails, info: Info
) -> MemberCSVResponse:
    """
    It returns the data of all members specific to the
    requested fields like batch and status in a CSV format at once.

    Args:
        details (otypes.MemberInputDataReportDetails): Contains the
                                                details of the report.
        info (otypes.Info): Contains the logged in user's details.

    Returns:
        (otypes.MemberCSVResponse): Contains the data of all members specific
             to the requested fields like batch and status in a CSV format.

    Raises:
        Exception: You do not have permission to access this resource.
    """
    user = {
       "role":"cc", 
       "uid":None
    }
    if user is None:
        raise Exception("You do not have permission to access this resource.")

    allClubs = await getClubs(info.context.cookies)
    if len(allClubs) == 0:
        raise Exception("No clubs found.")

    if "allclubs" not in details.clubid:
        clubList = details.clubid
    else:
        clubList = [club["cid"] for club in allClubs]
        curr_date = datetime.now()
        day = curr_date.day
        month = curr_date.month
        farewell_time = (month == 3 and day >= 15) or (
            month == 4 and day <= 15
        )
        if not farewell_time:
            details.typeMembers = "current"

    results = [
        doc
        async for doc in membersdb.find({"cid": {"$in": clubList}}, {"_id": 0})
    ]

    allMembers = []
    if "allBatches" not in details.batchFiltering:
        ug = "ug" in details.batchFilteringType
        pg = "pg" in details.batchFilteringType

        batchDetails = dict()
        for batch in details.batchFiltering:
            batch_users = await getUsersByBatch(
                int(batch), ug, pg, info.context.cookies
            )
            if batch_users is not None:
                batchDetails.update(batch_users)
    userDetailsList = dict()
    userIds = []
    for result in results:
        roles = result["roles"]
        roles_result = []
        currentMember = False
        withinTimeframe = False

        for i in roles:
            if i["deleted"] is True:
                continue
            if details.typeMembers == "current" and i["end_year"] is None:
                currentMember = True
            elif details.typeMembers == "past" and (
                (
                    details.dateRoles[1]
                    >= (2024 if i["end_year"] is None else int(i["end_year"]))
                    and details.dateRoles[0]
                    <= (2024 if i["end_year"] is None else int(i["end_year"]))
                )
                or (
                    details.dateRoles[1] >= int(i["start_year"])
                    and details.dateRoles[0] <= int(i["start_year"])
                )
            ):
                withinTimeframe = True

            roles_result.append(i)

        if len(roles_result) > 0:
            append = False
            result["roles"] = roles_result
            if details.typeMembers == "all":
                append = True
            elif details.typeMembers == "current" and currentMember:
                append = True
            elif details.typeMembers == "past" and withinTimeframe:
                append = True

            if "allBatches" not in details.batchFiltering and append:
                userDetails = batchDetails.get(result["uid"], None)
                if userDetails is not None:
                    userDetailsList[result["uid"]] = userDetails
                else:  # Member is not in specified batch
                    append = False

            if append:
                allMembers.append(result)
                userIds.append(result["uid"])

    # Get details of all members
    if "allBatches" in details.batchFiltering:
        userDetailsList = await getUsersByList(userIds, info.context.cookies)

    headerMapping = {
        "clubid": "Club Name",
        "uid": "Name",
        "rollno": "Roll No",
        "batch": "Batch",
        "email": "Email",
        "partofclub": "Is Part of Club",
        "roles": "Roles [Role, Start Year, End Year]",
        "poc": "Is POC",
    }

    # Prepare CSV content
    csvOutput = io.StringIO()

    fieldnames = []
    for field in (
        headerMapping
    ):  # Add fields in the order specified in the headerMapping
        if field in details.fields:
            fieldnames.append(headerMapping.get(field.lower(), field))

    csv_writer = csv.DictWriter(csvOutput, fieldnames=fieldnames)
    csv_writer.writeheader()

    # So that we don't have to query the club name for each member
    clubNames = dict()
    for club in allClubs:
        clubNames[club["cid"]] = club["name"]

    for member in allMembers:
        memberData = {}
        userDetails = userDetailsList.get(member["uid"])
        if userDetails is None:
            continue

        clubName = clubNames.get(member["cid"], "Unknown")

        for field in details.fields:
            value = ""
            mappedField = headerMapping.get(field.lower())
            if field == "clubid":
                value = clubName
            elif field == "uid":
                value = (
                    userDetails["firstName"] + " " + userDetails["lastName"]
                )
            elif field == "rollno":
                value = userDetails["rollno"]
            elif field == "batch":
                value = userDetails["batch"]
            elif field == "email":
                value = userDetails["email"]
            elif field == "partofclub":
                value = "No"
                for role in member["roles"]:
                    if role["end_year"] is None:
                        value = "Yes"
                        break
            elif field == "roles":
                listOfRoles = []
                for i in member["roles"]:
                    roleFormatting = [
                        i["name"],
                        int(i["start_year"]),
                        int(i["end_year"])
                        if i["end_year"] is not None
                        else None,
                    ]
                    if details.typeRoles == "all":
                        listOfRoles.append(roleFormatting)
                    elif details.typeRoles == "current":
                        if roleFormatting[2] is None:
                            listOfRoles.append(roleFormatting)
                value = str(listOfRoles)
            elif field == "poc":
                value = "Yes" if member["poc"] else "No"

            memberData[mappedField] = value
        csv_writer.writerow(memberData)

    csv_content = csvOutput.getvalue()
    csvOutput.close()

    return MemberCSVResponse(
        csvFile=csv_content,
        successMessage="CSV file generated successfully",
        errorMessage="",
    )


# register all queries
queries = [
    member,
    memberRoles,
    members,
    currentMembers,
    pendingMembers,
    downloadMembersData,
]
