"use server";

import { getClient } from "gql/client";
import { GET_SIGNED_UPLOAD_URL } from "gql/queries/misc";

export async function getSignedUploadURL(details) {
  const response = { ok: false, error: null, data: null };

  try {
    const { data, error } = await getClient().query(GET_SIGNED_UPLOAD_URL, {
      details,
    });

    if (error) {
      response.error = {
        title: error.name,
        messages: error.graphQLErrors?.map((ge) => ge.message) || [
          error.message,
        ],
      };
    } else if (data) {
      response.ok = true;
      response.data = data.signedUploadURL;
    } else {
      response.error = {
        title: "Unexpected Error",
        messages: ["No data returned from GraphQL server."],
      };
    }
  } catch (error) {
    response.error = {
      title: "Request Error",
      messages: [error.message],
    };
  }

  return response;
}
