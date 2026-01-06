"""
Types and Inputs
"""

import json
from functools import cached_property
from typing import Dict, List, Optional, Union

import strawberry
from strawberry.fastapi import BaseContext
from strawberry.types import Info as _Info
from strawberry.types.info import RootValueType

from models import Member, PyObjectId, Roles


# custom context class
class Context(BaseContext):
    """
    Class provides user metadata and cookies from request headers, has
    methods for doing this.
    """

    @cached_property
    def user(self) -> Union[Dict, None]:
        if not self.request:
            return None

        user = json.loads(self.request.headers.get("user", "{}"))
        return user

    @cached_property
    def cookies(self) -> Union[Dict, None]:
        if not self.request:
            return None

        cookies = json.loads(self.request.headers.get("cookies", "{}"))
        return cookies


Info = _Info[Context, RootValueType]
"""custom info Type for user metadata"""

PyObjectIdType = strawberry.scalar(
    PyObjectId, serialize=str, parse_value=lambda v: PyObjectId(v)
)
"""A scalar Type for serializing PyObjectId, used for id field"""


# TYPES
@strawberry.experimental.pydantic.type(model=Roles, all_fields=True)
class RolesType:
    """
    Type used to return all the details regarding a role of a club member
    """

    pass


@strawberry.experimental.pydantic.type(
    model=Member,
    fields=[
        "id",
        "cid",
        "uid",
        "roles",
        "poc",
        "creation_time",
        "last_edited_time",
    ],
)
class MemberType:
    """
    Type used to return all the details of a club member
    """

    pass


# INPUTS
@strawberry.experimental.pydantic.input(
    model=Roles, fields=["name", "start_year", "end_year"]
)
class RolesInput:
    """
    Input used to take a role's name, start and end year
    """

    pass


@strawberry.experimental.pydantic.input(
    model=Member, fields=["cid", "uid", "roles"]
)
class FullMemberInput:
    """
    Input used to take a member's cid, uid, roles and poc(optional) fields.

    Attributes:
    poc (Optional[bool]): point of contact of the member. Defaults to None.
    """

    poc: Optional[bool] = strawberry.UNSET


@strawberry.input
class SimpleMemberInput:
    """
    Input used to take a member's cid, uid and rid(optional) fields

    Attributes:
    cid (str): member's cid.
    uid (str): member's uid.
    rid (str): member's rid.
    """

    cid: str
    uid: str
    rid: Optional[str]


@strawberry.input
class SimpleClubInput:
    """
    Input used to take a club's cid

    Attributes:
    cid (str): club's cid.
    """

    cid: str


@strawberry.input
class MemberInputDataReportDetails:
    """
    Input used to take in search parameters for the member data report

    Attributes:
    clubid (List[str]): List of club ids to filter members by.
        If None, no filtering by club ids is applied.
    fields (List[str]): List of member fields to include in the report.
    typeMembers (str): Type of members to be included in report.
    typeRoles (str): Type of roles to be included in report.Default is None.
    batchFiltering (List[str]): Batch based search to be included in the fetch.
    batchFilteringType (List[str]): Type of filter, seperate for ug and pg.
    dateRoles (List[int]): date filters for the roles of the members.
    """

    clubid: List[str] | None
    fields: List[str]
    typeMembers: str
    typeRoles: str | None
    batchFiltering: List[str]
    batchFilteringType: List[str] = strawberry.field(
        default_factory=lambda: ["ug", "pg"]
    )
    dateRoles: List[int] | None

    def __post_init__(self):
        if len(self.batchFilteringType) > 2:
            raise ValueError("Invalid Batch Types added.")

        allowed_values = ["ug", "pg"]
        if not set(self.batchFilteringType).issubset(allowed_values):
            raise ValueError(
                f"batchFilteringType must be a subset of {allowed_values}"
            )


@strawberry.type
class MemberCSVResponse:
    """
    Type used to return the csv file and the operation message

    Attributes:
    csvFile (str): the csv file as a string.
    successMessage (str): message in case of successful operation.
    errorMessage (str): message in case of error.
    """

    csvFile: str
    successMessage: str
    errorMessage: str
