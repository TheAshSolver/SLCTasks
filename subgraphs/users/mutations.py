"""
Mutations for Users Microservice
"""

import os

import strawberry
from fastapi.encoders import jsonable_encoder

from db import db
from models import User

# import all models and types
from otypes import Info, PhoneInput, RoleInput, UserDataInput

inter_communication_secret = os.getenv("INTER_COMMUNICATION_SECRET")


# update role of user with uid
@strawberry.mutation
async def updateRole(roleInput: RoleInput, info: Info) -> bool:
    """
    This method is used to update the role of a user by CC.

    Args:
        roleInput (otypes.RoleInput): Contains the uid and role of the user.
        info (otypes.Info): Contains the user details.

    Returns:
        (bool): True if the role is updated successfully, False otherwise.

    Raises:
        Exception: Not logged in!
        Exception: Authentication Error! Only admins can assign roles!
        Exception: Authentication Error! Invalid secret!
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    roleInputData = jsonable_encoder(roleInput)

    # check if user is admin
    if user.get("role", None) not in ["cc"]:
        raise Exception("Authentication Error! Only admins can assign roles!")

    # check if the secret is correct
    if (
        roleInputData.get("inter_communication_secret", None)
        != inter_communication_secret
    ):
        raise Exception("Authentication Error! Invalid secret!")

    await db.users.update_one(
        {"uid": roleInputData["uid"]},
        {
            "$set": {"role": roleInputData["role"]},
            "$setOnInsert": {"uid": roleInputData["uid"]},
        },
        upsert=True,
    )

    return True


@strawberry.mutation
async def updateUserPhone(userDataInput: PhoneInput, info: Info) -> bool:
    """
    This method is used to update the phone number of a user by the cc and
    user.

    Args:
        userDataInput (otypes.PhoneInput): Contains the uid and
                                         phone number of the user.
        info (otypes.Info): Contains the user details.

    Returns:
        (bool): True if the phone number is updated successfully,
            False otherwise.

    Raises:
        Exception: Not logged in!
        Exception: Invalid phone number!
        Exception: You are not allowed to perform this action!
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    userData = jsonable_encoder(userDataInput)

    # Validate the data by putting in the model
    try:
        User(**userData)
    except Exception:
        raise Exception("Invalid phone number!")

    # check if user has access
    if not (
        user.get("role", None) in ["cc", "club"]
        or user.get("uid", None) == userData["uid"]
    ):
        raise Exception("You are not allowed to perform this action!")

    await db.users.update_one(
        {"uid": userData["uid"]},
        {"$set": {"phone": userData["phone"]}},
    )

    return True


@strawberry.mutation
async def updateUserData(userDataInput: UserDataInput, info: Info) -> bool:
    """
    Used to update the data of a user by CC and the User

    Args:
        userDataInput (otypes.UserDataInput): Contains the uid, image and phone
                                       number of the user.
        info (otypes.Info): Contains the user details.

    Returns:
        (bool): True if the data is updated successfully, False otherwise.

    Raises:
        Exception: Not logged in!
        Exception: You are not allowed to perform this action!
    """

    user = info.context.user
    if not user:
        raise Exception("Not logged in!")

    userData = jsonable_encoder(userDataInput)

    # check if user has access
    if (
        user.get("role", None) not in ["cc"]
        and user.get("uid", None) != userData["uid"]
    ):
        raise Exception("You are not allowed to perform this action!")

    # Validate the data by putting in the model
    User(**userData)

    await db.users.update_one(
        {"uid": userData["uid"]},
        {"$set": {"img": userData["img"], "phone": userData["phone"]}},
    )

    return True


# register all mutations
mutations = [
    updateRole,
    updateUserPhone,
    updateUserData,
]
