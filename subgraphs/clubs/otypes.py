"""
Types and Inputs for clubs subgraph
"""

import json
from functools import cached_property
from typing import Dict, List, Optional, Union

import strawberry
from strawberry.fastapi import BaseContext
from strawberry.types import Info as _Info
from strawberry.types.info import RootValueType

from models import Club, PyObjectId, Social


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
@strawberry.experimental.pydantic.type(model=Social)
class SocialsType:
    """
    Type used for return of social media handles of a club.

    Attributes:
        website (Optional[str]): Club Website URL. Defaults to None.
        instagram (Optional[str]): Club Instagram handle. Defaults to None.
        facebook (Optional[str]): Club Facebook. Defaults to None.
        youtube (Optional[str]): Club YouTube handle. Defaults to None.
        twitter (Optional[str]): Club Twitter handle. Defaults to None.
        linkedin (Optional[str]): Club LinkedIn handle. Defaults to None.
        discord (Optional[str]): Club Discord handle. Defaults to None.
        whatsapp (Optional[str]): Club WhatsApp handle. Defaults to None.
        other_links (Optional[List[str]]): List of other social handles
                                     Defaults to None.
    """

    website: Optional[str] = strawberry.UNSET
    instagram: Optional[str] = strawberry.UNSET
    facebook: Optional[str] = strawberry.UNSET
    youtube: Optional[str] = strawberry.UNSET
    twitter: Optional[str] = strawberry.UNSET
    linkedin: Optional[str] = strawberry.UNSET
    discord: Optional[str] = strawberry.UNSET
    whatsapp: Optional[str] = strawberry.UNSET
    other_links: Optional[List[str]] = strawberry.UNSET


@strawberry.experimental.pydantic.type(
    Club,
    fields=[
        "id",
        "cid",
        "code",
        "state",
        "category",
        "email",
        "logo",
        "banner",
        "banner_square",
        "name",
        "tagline",
    ],
)
class SimpleClubType:
    """
    Type used for return of user-provided club details except social handles.

    Attributes:
        id (models.PyObjectId): The ID of the club's document.
        cid (str): the Club ID.
        code (str): Unique Short Code of Club.
        state (models.EnumStates): State of the Club.
        category (models.EnumCategories): Category of the Club.
        email (str): Email of the Club.
        logo (Optional[str]): Club Logo URL. Defaults to None.
        banner (Optional[str]): Club Banner URL. Defaults to None.
        banner_square (Optional[str]): Club SquareBanner URL. Defaults to None.
        name (str): Name of the Club.
        tagline (Optional[str]): Tagline of the Club. Defaults to None.
    """

    pass


@strawberry.experimental.pydantic.type(
    model=Club,
    fields=[
        "id",
        "cid",
        "code",
        "state",
        "category",
        "logo",
        "banner",
        "banner_square",
        "name",
        "email",
        "tagline",
        "description",
        "socials",
    ],
)
class FullClubType:
    """
    Type used for return of all user-provided club details.

    Attributes:
        id (models.PyObjectId): The ID of the club's document.
        cid (str): the Club ID.
        code (str): Unique Short Code of Club.
        state (models.EnumStates): State of the Club.
        category (models.EnumCategories): Category of the Club.
        logo (Optional[str]): Club Logo URL. Defaults to None.
        banner (Optional[str]): Club Banner URL. Defaults to None.
        banner_square (Optional[str]): Club SquareBanner URL. Defaults to None.
        name (str): Name of the Club.
        email (str): Email of the Club.
        tagline (Optional[str]): Tagline of the Club. Defaults to None.
        description (Optional[str]): Club Description. Defaults to None.
        socials (SocialsType): Social Handles of the Club.
    """

    # socials: SocialsType
    pass


# CLUBS INPUTS
@strawberry.experimental.pydantic.input(model=Social, all_fields=True)
class SocialsInput:
    """
    Input used for input of social media handles of a club.
    """

    pass


@strawberry.input
class SimpleClubInput:
    """
    Input used for input of cid (Club id) of a club.

    Attributes:
        cid (str): the Club ID.
    """

    cid: str


@strawberry.experimental.pydantic.input(
    model=Club,
    fields=[
        "cid",
        "code",
        "name",
        "email",
        "category",
        "tagline",
        "description",
        "socials",
    ],
)
class FullClubInput:
    """
    Input used for input of all user-provided club details, pictures are
    optional to fill.

    Attributes:
        logo (Optional[str]): Club Logo URL. Defaults to None.
        banner (Optional[str]): Club Banner URL. Defaults to None.
        banner_square (Optional[str]): Club Square Banner URL.Defaults to None.

    """

    logo: Optional[str] = strawberry.UNSET
    banner: Optional[str] = strawberry.UNSET
    banner_square: Optional[str] = strawberry.UNSET
