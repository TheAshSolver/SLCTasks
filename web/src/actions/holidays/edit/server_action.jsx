"use server";

import { getClient } from "gql/client";
import { EDIT_HOLIDAY } from "gql/mutations/holidays";

export async function editHolidays(holidayId, details) {
  const response = { ok: false, data: null, error: null };

  const { data = {}, error } = await getClient().mutation(EDIT_HOLIDAY, {
    details,
    holidayId,
  });
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = data.editHoliday;
  }

  return response;
}
