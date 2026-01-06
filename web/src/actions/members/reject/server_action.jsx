"use server";

import { getClient } from "gql/client";
import { REJECT_MEMBER } from "gql/mutations/members";

export async function rejectMemberAction(memberInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(REJECT_MEMBER, { memberInput });
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
