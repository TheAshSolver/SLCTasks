from datetime import datetime
from enum import StrEnum, auto
from typing import Any, List

import strawberry
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic_core import core_schema

from utils import get_curr_time_str, get_utc_time


class PyObjectId(ObjectId):
    """
    Class for handling MongoDB document ObjectIds for 'id' fields in Models.
    """

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler):
        return core_schema.union_schema(
            [
                # check if it's an instance first before doing any further work
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_plain_validator_function(cls.validate),
            ],
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# sample pydantic model
class Mails(BaseModel):
    """
    Model for Mails

    Attributes:
        id (PyObjectId): Unique ObjectId of the document.
        uid (str): User id. Defaults to None.
        subject (str): Subject of the mail.
        body (str): Body of the mail.
        to_recipients (List[pydantic.networks.EmailStr]): List
                                                         of 'to' recipients.
        cc_recipients (List[pydantic.networks.EmailStr]): List
                                                         of 'cc' recipients.
        html_body (bool): Whether the body is in HTML or not.
        sent_time (datetime): Time when the mail was sent.
    """

    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    uid: str | None = None
    subject: str = Field(..., max_length=100)
    body: str = Field(...)
    to_recipients: List[EmailStr] = Field(...)
    cc_recipients: List[EmailStr] = Field([])
    html_body: bool = Field(default=False)

    sent_time: datetime = Field(default_factory=get_utc_time, frozen=True)

    @field_validator("to_recipients")
    @classmethod
    # validates the to_recipients field
    def validate_unique_to(cls, value):
        """
        Validates the 'to_recipients' field to check for duplicate emails.
        """
        if len(value) != len(set(value)):
            raise ValueError(
                "Duplicate Emails are not allowed in 'to_recipients'"
            )
        return value

    @field_validator("cc_recipients")
    @classmethod
    # validates the cc_recipients field
    def validate_unique_cc(cls, value):
        """
        Validates the 'cc_recipients' field to check for duplicate emails.
        """
        if len(value) != len(set(value)):
            raise ValueError(
                "Duplicate Emails are not allowed in 'cc_recipients'"
            )
        return value

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        extra="forbid",
        str_strip_whitespace=True,
        validate_assignment=True,
    )


# Enum for storing category of the team for the recruit
@strawberry.enum
class Team(StrEnum):
    """
    Enum for storing category of team for the recruit.
    """

    Design = auto()
    Finance = auto()
    Logistics = auto()
    Stats = auto()
    Corporate = auto()


class CCRecruitment(BaseModel):
    """
    Model for CC Recruitment form

    Attributes:
        id (PyObjectId): Unique ObjectId of the document.
        uid (str): User id.
        email (pydantic.networks.EmailStr): Email of the user.
        teams (List[Team]): List of teams the user wants to apply for.
        design_experience (str): Design experience of the user. Defaults to
                                 None.
        why_this_position (str): Why the user wants this position.
        why_cc (str): Why the user wants to join CC.
        ideas1 (str): reasons for not participating in a event.
        ideas (str): Ideas the user has for CC.
        other_bodies (str): Other bodies the user is a part of. Defaults to
                            None.
        good_fit (str | None): Why the user is a good fit for CC.
        sent_time (datetime): Time when the form was submitted.
        apply_year (int): Year of application. Defaults to 2024.
    """

    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    uid: str = Field(..., max_length=100)
    email: EmailStr = Field(...)

    teams: List[Team] = []
    design_experience: str | None = None

    why_this_position: str = Field()
    why_cc: str = Field()
    ideas1: str = Field("")
    ideas: str = Field(None)
    other_bodies: str | None = None
    good_fit: str = Field()

    sent_time: datetime = Field(default_factory=get_utc_time, frozen=True)
    apply_year: int = 2024

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        extra="forbid",
        str_strip_whitespace=True,
        validate_assignment=True,
    )


class StorageFile(BaseModel):
    """
    Model for files being stored

    Attributes:
        id (PyObjectId): Unique ObjectId of the document.
        title (str): Title of the file.
        filename (str): Name of the file.
        filetype (str): Type of the file.
        latest_version (int): Latest version of the file.
        modified_time (str): Time when the file was last modified.
        creation_time (str): Time when the file was created.
    """

    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str = Field(
        ...,
        max_length=100,
        min_length=2,
    )

    filename: str = Field(
        ...,
        max_length=125,
        min_length=2,
    )
    filetype: str = "pdf"
    latest_version: int = 1

    modified_time: str = Field(default_factory=get_curr_time_str)
    creation_time: str = Field(default_factory=get_curr_time_str, frozen=True)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        extra="forbid",
        str_strip_whitespace=True,
        validate_assignment=True,
    )
