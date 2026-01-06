"use server";

import { getClient } from "gql/client";
import { CREATE_EVENT } from "gql/mutations/events";

export async function createEventAction(details) {
  const response = { ok: false, data: null, error: null };

  try {
    const client = getClient();
    const result = await client.mutation(CREATE_EVENT, { details });

    if (result.error) {
      response.error = {
        title: result.error.name,
        messages: result.error.graphQLErrors?.map((ge) => ge.message) || [
          result.error.message,
        ],
      };
    } else if (result.data) {
      response.ok = true;
      response.data = result.data.createEvent;
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
