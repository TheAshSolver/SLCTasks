"use server";

import { getClient } from "gql/client";
import { CREATE_CLUB } from "gql/mutations/clubs";

export async function createClubAction(clubInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(CREATE_CLUB, { clubInput });
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
