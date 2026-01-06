"use server";

import { getClient } from "gql/client";
import { UPDATE_BILLS_STATUS } from "gql/mutations/events";

export async function eventBillStatus(details) {
  const response = { ok: false, data: null, error: null };

  const { data = {}, error } = await getClient().mutation(UPDATE_BILLS_STATUS, {
    details,
  });
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = data.updateBillsStatus;
  }

  return response;
}
