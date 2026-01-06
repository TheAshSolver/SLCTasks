"use server";

import { getClient } from "gql/client";
import { GET_CURRENT_MEMBERS } from "gql/queries/members";

export async function currentMembersAction(clubInput) {
  const response = { ok: false, data: null, error: null };

  const {
    error,
    data: { currentMembers },
  } = await getClient().query(GET_CURRENT_MEMBERS, { clubInput });
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = [...currentMembers];
  }

  return response;
}
