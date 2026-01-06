import os
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx

inter_communication_secret = os.getenv("INTER_COMMUNICATION_SECRET")

ist = ZoneInfo("Asia/Kolkata")
"""IST timezone"""

utc = ZoneInfo("UTC")
"""UTC timezone"""


async def delete_file(filename) -> str:
    """
    Makes a request to delete a file from the files service

    Args:
        filename (str): The name of the file to delete

    Returns:
        (str): The response from the files service

    Raises:
        Exception: If the response is not successful
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://files/delete-file",
            params={
                "filename": filename,
                "inter_communication_secret": inter_communication_secret,
                "static_file": "true",
            },
        )

    if response.status_code != 200:
        raise Exception(response.text)

    return response.text


def get_utc_time() -> datetime:
    """
    Current time according to UTC timezone.

    Returns:
        datetime: Current UTC time
    """
    return datetime.now(utc)


def get_curr_time_str() -> str:
    """
    Current IST time in YYYY-MM-DD HH:MM:SS format.

    Returns:
        str: Current IST time as a formatted string
    """
    return datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S")
