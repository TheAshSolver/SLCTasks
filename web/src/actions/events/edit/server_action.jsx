"use server";

import { getClient } from "gql/client";
import { EDIT_EVENT } from "gql/mutations/events";

export async function editEventAction(details, eventid) {
  const response = { ok: false, data: null, error: null };

  const { data, error } = await getClient().mutation(EDIT_EVENT, {
    details: { ...details, eventid },
  });
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = data.editEvent;
  }

  return response;
}
