"use server";

import { getClient } from "gql/client";
import { CREATE_HOLIDAY } from "gql/mutations/holidays";

export async function createHolidays(details) {
  const response = { ok: false, data: null, error: null };

  const { data, error } = await getClient().mutation(CREATE_HOLIDAY, {
    details,
  });

  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = data.createHoliday;
  }

  return response;
}
