"""
Types and Inputs
"""

import json
from functools import cached_property
from typing import Dict, Optional, Union

import strawberry
from strawberry.fastapi import BaseContext
from strawberry.types import Info as _Info
from strawberry.types.info import RootValueType

from models import PyObjectId, User


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
"""A scalar Type for serializing PyObjectId, used for id field"""

PyObjectIdType = strawberry.scalar(
    PyObjectId, serialize=str, parse_value=lambda v: PyObjectId(v)
)
"""A scalar Type for serializing PyObjectId, used for id field"""


# user profile type
@strawberry.type
class ProfileType:
    """
    Type used for returning user details stored in LDAP server.

    Attributes:
        uid (str): User ID, can be None.
        firstName (str): User's first name.
        lastName (str): User's last name.
        email (str): User's email address
        gender (str): User's gender, can be None.
        batch (str): User's batch, can be None.
        stream (str): User's stream, can be None.
        rollno (str): User's roll number, can be None.
    """

    uid: str | None
    firstName: str
    lastName: str
    email: str
    gender: str | None
    batch: str | None
    stream: str | None
    rollno: str | None


# authenticated user details type
@strawberry.experimental.pydantic.type(model=User)
class UserMetaType:
    """
    Type used for returning user details stored in the database.

    Attributes:
        uid (str): User ID.
        role (str): User's role in management level.
        img (str): user's profile image, can be None.
        phone (str): User's phone number, can be None.
    """

    uid: strawberry.auto
    role: strawberry.auto
    img: strawberry.auto
    phone: strawberry.auto


# user id input
@strawberry.input
class UserInput:
    """
    Input used to take user id as input.

    Attributes:
        uid (str): User ID.
    """

    uid: str


# user role input
@strawberry.input
class RoleInput:
    """
    Input used to take user id and role as input.

    Attributes:
        uid (str): User ID.
        role (str): User's role in management level.
        inter_communication_secret (str): Secret for inter-service
                                    communication. Defaults to None.
    """

    uid: str
    role: str
    inter_communication_secret: Optional[str] = None


# user phone input type
@strawberry.input
class PhoneInput:
    """
    Input used to take user id and phone number as input.

    Attributes:
        uid (str): User ID.
        phone (str): User's phone number.
    """

    uid: str
    phone: str


# user data input
@strawberry.input
class UserDataInput:
    """
    Input used to take user id, image and phone number as input.

    Attributes:
        uid (str): User ID.
        img (str): User's profile image, can be None.
        phone (str): User's phone number.
    """

    uid: str
    img: Optional[str] = None
    phone: Optional[str]
