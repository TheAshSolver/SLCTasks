"use server";

import { getClient } from "gql/client";
import { REMIND_SLO } from "gql/mutations/events";

export async function eventReminder(data) {
  const response = { ok: false, error: null };
  const { eventid } = data;

  const { error } = await getClient().mutation(REMIND_SLO, {
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
