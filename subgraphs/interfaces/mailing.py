"""
Program to send email via Microsoft Graph API

Attributes:
    TENANT_ID (str): Tenant ID for Microsoft Graph API.
    CLIENT_ID (str): Client ID for Microsoft Graph API.
    CLIENT_SECRET (str): Client Secret for Microsoft Graph API.
    CLIENT_EMAIL (str): Client Email for Microsoft Graph API.
"""

import os

import httpx
import msal

TENANT_ID = os.environ.get("AD_TENANT_ID")
CLIENT_ID = os.environ.get("AD_CLIENT_ID")
CLIENT_SECRET = os.environ.get("AD_CLIENT_SECRET")
CLIENT_EMAIL = os.environ.get("AD_CLIENT_EMAIL")


def acquire_token():
    """
    Returns token aquired via MSAL
    """

    authority_url = f"https://login.microsoftonline.com/{TENANT_ID}/"
    app = msal.ConfidentialClientApplication(
        authority=authority_url,
        client_id=f"{CLIENT_ID}",
        client_credential=f"{CLIENT_SECRET}",
    )
    token = app.acquire_token_for_client(
        scopes=["https://graph.microsoft.com/.default"]
    )
    return token


async def send_mail(
    subject: str,
    body: str,
    to: list,
    cc: list = [],
    reply_to: str | None = None,
    html_body: bool | None = False,
) -> bool:
    """
    Method to send email

    Args:
        subject (str): subject for an email.
        body (str): body of the email.
        to (list): The list of recipients for an email.
        cc (list, optional): The list of recipients for an email. Default is
                             empty.
        html_body (bool, optional): Whether the body is HTML or not.
                                    Defaults to False.

    Returns:
        (bool): Whether the email was sent successfully or not.
    """
    token = acquire_token()
    if token is None or "access_token" not in token:
        raise ValueError("Failed to acquire access token")
    token = token["access_token"]

    url = f"https://graph.microsoft.com/v1.0/users/{CLIENT_EMAIL}/sendMail"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    message = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML" if html_body else "Text",
                "content": body,
            },
            "toRecipients": [
                {"emailAddress": {"address": recip}} for recip in to
            ],
            "ccRecipients": [
                {"emailAddress": {"address": recip}} for recip in cc
            ],
        },
        "saveToSentItems": "false",
    }

    if reply_to is not None:
        message["message"]["replyTo"] = [
            {"emailAddress": {"address": reply_to}}
        ]

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=message)
        return response.status_code == 202
