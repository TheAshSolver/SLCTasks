"use server";

import { getClient } from "gql/client";
import { DELETE_MEMBER } from "gql/mutations/members";

export async function deleteMemberAction(memberInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(DELETE_MEMBER, { memberInput });
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
