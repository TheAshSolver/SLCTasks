"use server";

import { getClient } from "gql/client";
import { EDIT_CLUB } from "gql/mutations/clubs";

export async function editClubAction(clubInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(EDIT_CLUB, { clubInput });
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
