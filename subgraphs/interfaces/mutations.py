"""
Mutation Resolvers
"""

import os
import re

import strawberry
from fastapi.encoders import jsonable_encoder

from db import ccdb, docsstoragedb
from mailing import send_mail
from mailing_templates import (
    APPLICANT_CONFIRMATION_BODY,
    APPLICANT_CONFIRMATION_SUBJECT,
    CC_APPLICANT_CONFIRMATION_BODY,
    CC_APPLICANT_CONFIRMATION_SUBJECT,
)
from models import CCRecruitment, StorageFile

# import all models and types
from otypes import (
    CCRecruitmentInput,
    Info,
    MailInput,
    StorageFileInput,
    StorageFileType,
)
from utils import get_curr_time_str

inter_communication_secret_global = os.getenv("INTER_COMMUNICATION_SECRET")


# sample mutation
@strawberry.mutation
async def sendMail(
    info: Info,
    mailInput: MailInput,
    inter_communication_secret: str | None = None,
) -> bool:
    """
    Resolver that initiates the sending of an email.

    Args:
        info (otypes.Info): contains the user's context information.
        mailInput (otypes.MailInput): The input data for sending an email.
        inter_communication_secret (str): The secret key
                                for inter-communication. Defaults to None.

    Returns:
        (bool): True if the email is sent successfully, False otherwise.

    Raises:
        Exception: Not logged in!
        Exception: Not Authenticated to access this API!!
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    if user.get("role", None) not in ["cc", "club", "slo", "slc", "email_bot"]:
        raise Exception("Not Authenticated to access this API!!")

    if inter_communication_secret != inter_communication_secret_global:
        raise Exception("Authentication Error! Invalid secret!")

    mail_input = jsonable_encoder(mailInput.to_pydantic())

    if mail_input["uid"] is None:
        mail_input["uid"] = user["uid"]

    # send mail as background task
    info.context.background_tasks.add_task(
        send_mail,
        mail_input["subject"],
        mail_input["body"],
        mail_input["to_recipients"],
        mail_input["cc_recipients"],
        None,
        mail_input["html_body"],
    )

    # send_mail(mail_input["subject"], mail_input["body"],
    # mail_input["to_recipients"], mail_input["cc_recipients"]):

    #     created_sample = Mails.model_validate(
    #         db.mails.find_one({"_id": 0}, {"_id": 0}))
    # else:
    #     # add to database
    #     created_id = db.mails.insert_one(mail_input).inserted_id
    #
    #     # query from database
    #     created_sample = Mails.model_validate(
    #         db.mails.find_one({"_id": created_id}, {"_id": 0}))
    #
    # return MailReturnType.from_pydantic(created_sample)

    return True


@strawberry.mutation
async def ccApply(ccRecruitmentInput: CCRecruitmentInput, info: Info) -> bool:
    """
    This method is used to apply for CC

    This method is invoked when a user applies for CC.
    It send mails to the user and the CC admins regarding the application.

    Args:
        ccRecruitmentInput (otypes.CCRecruitmentInput): The input data while
                                                 applying for CC.
        info (otypes.Info): contains the user's context information.

    Returns:
        (bool): True if the application is successful, False otherwise.

    Raises:
        Exception: Not logged in!
        Exception: Not Authenticated to access this API!!
        Exception: You have already applied for CC!!
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    if user.get("role", None) not in ["public"]:
        raise Exception("Not Authenticated to access this API!!")

    cc_recruitment_input = jsonable_encoder(ccRecruitmentInput.to_pydantic())
    curr_year = int(get_curr_time_str()[:4])

    # Check if the user has already applied
    if await ccdb.find_one(
        {"email": cc_recruitment_input["email"], "apply_year": curr_year}
    ):
        raise Exception("You have already applied for CC!!")

    cc_recruitment_input["apply_year"] = curr_year

    # add to database
    created_id = (await ccdb.insert_one(cc_recruitment_input)).inserted_id
    created_sample = CCRecruitment.model_validate(
        await ccdb.find_one({"_id": created_id})
    )

    # Send emails
    info.context.background_tasks.add_task(
        send_mail,
        APPLICANT_CONFIRMATION_SUBJECT.safe_substitute(),
        APPLICANT_CONFIRMATION_BODY.safe_substitute(),
        [created_sample.email],
    )
    info.context.background_tasks.add_task(
        send_mail,
        CC_APPLICANT_CONFIRMATION_SUBJECT.safe_substitute(),
        CC_APPLICANT_CONFIRMATION_BODY.safe_substitute(
            uid=created_sample.uid,
            email=created_sample.email,
            teams=", ".join(created_sample.teams),
            why_this_position=created_sample.why_this_position,
            why_cc=created_sample.why_cc,
            good_fit=created_sample.good_fit,
            ideas1=created_sample.ideas1,
            ideas=created_sample.ideas,
            other_bodies=created_sample.other_bodies,
            design_experience=created_sample.design_experience or "N/A",
        ),
        ["clubs@iiit.ac.in"],
    )

    return True


# StorageFile related mutations
@strawberry.mutation
async def createStorageFile(
    details: StorageFileInput, info: Info
) -> StorageFileType:
    """
    Enables CC to create of a new storagefile

    Args:
        details (otypes.StorageFileInput): The details of the storagefile to be
                                    created.
        info (otypes.Info): contains the user's context information.

    Returns:
        (otypes.StorageFileType): The created storagefile.

    Raises:
        ValueError: You do not have permission to access this resource.
        ValueError: A storagefile already exists with this name.

    """
    user = info.context.user

    if user is None or user.get("role") != "cc":
        raise ValueError("You do not have permission to access this resource.")

    storagefile = StorageFile(
        title=details.title,
        filename=details.filename,
        filetype=details.filetype,
    )

    # Check if any storagefile with same title already exists
    if await docsstoragedb.find_one(
        {"title": {"$regex": f"^{re.escape(details.title)}$", "$options": "i"}}
    ):
        raise ValueError("A storagefile already exists with this name.")

    created_id = (
        await docsstoragedb.insert_one(jsonable_encoder(storagefile))
    ).inserted_id
    created_storagefile = await docsstoragedb.find_one({"_id": created_id})

    return StorageFileType.from_pydantic(
        StorageFile.model_validate(created_storagefile)
    )


@strawberry.mutation
async def updateStorageFile(id: str, version: int, info: Info) -> bool:
    """
    Enables CC to update an existing storagefile

    Args:
        id (str): The id of the storagefile to be updated.
        version (int): The new version of the storagefile.
        info (otypes.Info): contains the user's context information.

    Returns:
        (bool): True if the storagefile is updated successfully, False
              otherwise.

    Raises:
        ValueError: You do not have permission to access this resource.
        ValueError: StorageFile not found.
    """
    user = info.context.user

    if user is None or user.get("role") != "cc":
        raise ValueError("You do not have permission to access this resource.")

    storagefile = await docsstoragedb.find_one({"_id": id})
    if storagefile is None:
        raise ValueError("StorageFile not found.")

    updated_storagefile = StorageFile(
        _id=id,
        title=storagefile["title"],
        filename=storagefile["filename"],
        filetype=storagefile["filetype"],
        modified_time=get_curr_time_str(),
        creation_time=storagefile["creation_time"],
        latest_version=version,
    )

    await docsstoragedb.find_one_and_update(
        {"_id": id}, {"$set": jsonable_encoder(updated_storagefile)}
    )
    return True


@strawberry.mutation
async def deleteStorageFile(id: str, info: Info) -> bool:
    """
    Enables CC to delete an existing storagefile

    Args:
        id (str): The id of the storagefile to be deleted.
        info (otypes.Info): contains the user's context information.

    Returns:
        (bool): True if the storagefile is deleted successfully, False
              otherwise.

    Raises:
        ValueError: You do not have permission to access this resource.
        ValueError: StorageFile not found.
    """
    user = info.context.user

    if user is None or user.get("role") != "cc":
        raise ValueError("You do not have permission to access this resource.")

    storagefile = await docsstoragedb.find_one({"_id": id})
    if storagefile is None:
        raise ValueError("StorageFile not found.")

    # delete the file from storage
    # delete_file(storagefile["filename"])

    await docsstoragedb.delete_one({"_id": id})
    return True


# register all mutations
mutations = [
    sendMail,
    ccApply,
    createStorageFile,
    updateStorageFile,
    deleteStorageFile,
]
