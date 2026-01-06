"use server";

import { getClient } from "gql/client";
import { DELETE_CLUB } from "gql/mutations/clubs";

export async function deleteClubAction(cid) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(DELETE_CLUB, {
    clubInput: { cid },
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
