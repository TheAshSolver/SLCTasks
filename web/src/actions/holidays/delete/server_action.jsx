"use server";

import { getClient } from "gql/client";
import { DELETE_HOLIDAY } from "gql/mutations/holidays";

export async function deleteHolidays(holidayId) {
  const response = { ok: false, error: null };

  const { error, data: { deleteHoliday } = {} } = await getClient().mutation(
    DELETE_HOLIDAY,
    {
      holidayId,
    },
  );
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = deleteHoliday;
  }

  return response;
}
