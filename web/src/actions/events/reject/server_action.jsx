"use server";

import { getClient } from "gql/client";
import { REJECT_EVENT } from "gql/mutations/events";

export async function rejectEventAction(data) {
  const { eventid, reason } = data;
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(REJECT_EVENT, {
    eventid,
    reason,
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
