import asyncio
import re
from typing import List

import ldap

# import all models and types
from otypes import ProfileType

# instantiate LDAP client
LDAP = ldap.initialize("ldap://ldap.iiit.ac.in")


async def ldap_search(filterstr: str) -> List[tuple]:
    """
    Fetchs details from LDAP server of user matching the filters.

    Args:
        filterstr (str): LDAP filter string.

    Returns:
        (List[tuple]): List of tuples containing the details of the user.
    """
    global LDAP
    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(
            None,
            lambda: LDAP.search_s(
                "ou=Users,dc=iiit,dc=ac,dc=in",
                ldap.SCOPE_SUBTREE,
                filterstr,
            ),
        )
    except ldap.SERVER_DOWN:
        # Reconnect to LDAP server and retry the search
        LDAP = ldap.initialize("ldap://ldap.iiit.ac.in")
        result = await loop.run_in_executor(
            None,
            lambda: LDAP.search_s(
                "ou=Users,dc=iiit,dc=ac,dc=in",
                ldap.SCOPE_SUBTREE,
                filterstr,
            ),
        )

    return result


def get_profile(ldap_result: List) -> ProfileType:
    """
    Fetches user's ProfileType from the result of the request to LDAP server.

    Args:
        ldap_result (List): List of tuples containing the details of the user.

    Returns:
        (otypes.ProfileType): Contains the profile of the user.
    """

    dn, details = ldap_result
    ous = re.findall(
        r"ou=\w.*?,", dn
    )  # get list of OUs the current DN belongs to
    if "cn" in details:
        fullNameList = details["cn"][0].decode().split()
        firstName = fullNameList[0]
        lastName = " ".join(fullNameList[1:])
    elif "givenName" in details and "sn" in details:
        firstName = details["givenName"][0].decode()
        lastName = details["sn"][0].decode()
    else:
        small_fn, small_ln = details["uid"].split(".")
        firstName = small_fn.capitalize()
        lastName = small_ln.capitalize()

    email = None
    if "mail" in details:
        email = details["mail"][0].decode()

    # extract optional attributes
    gender = None
    if "gender" in details:
        gender = details["gender"][0].decode()

    rollno = None
    if "uidNumber" in details:
        rollno = details["uidNumber"][0].decode()
    elif "sambaSID" in details:
        rollno = details["sambaSID"][0].decode()

    batch = None
    if len(ous) > 1:
        # extract batch code from OUs
        batch = re.sub(r"ou=(.*)?,", r"\1", ous[1])
        # remove the 'dual' suffix if it exists
        batch = re.sub(r"dual$", "", batch, flags=re.IGNORECASE)

    stream = None
    if len(ous) > 0:
        # extract stream code from OUs
        stream = re.sub(r"ou=(.*)?,", r"\1", ous[0])

    uid = None
    if "uid" in details:
        uid = details["uid"][0].decode()

    profile = ProfileType(
        uid=uid,
        firstName=firstName,
        lastName=lastName,
        email=email,
        gender=gender,
        batch=batch,
        stream=stream,
        rollno=rollno,
    )

    return profile
