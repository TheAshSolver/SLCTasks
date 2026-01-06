"use server";

import { getClient } from "gql/client";
import { DELETE_EVENT } from "gql/mutations/events";

export async function deleteEventAction(eventid) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(DELETE_EVENT, {
    eventid,
  });
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
  }

  return response;
}
