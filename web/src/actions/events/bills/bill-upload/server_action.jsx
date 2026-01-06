"use server";

import { getClient } from "gql/client";
import { ADD_BILL } from "gql/mutations/events";

export async function eventBillUpload(details) {
  const response = { ok: false, data: null, error: null };

  const { error } = await getClient().mutation(ADD_BILL, {
    details,
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
