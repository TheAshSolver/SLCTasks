"use server";

import { getClient } from "gql/client";
import { CREATE_MEMBER } from "gql/mutations/members";

export async function createMemberAction(memberInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(CREATE_MEMBER, { memberInput });
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
