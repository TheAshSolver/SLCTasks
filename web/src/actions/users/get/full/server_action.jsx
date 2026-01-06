"use server";

import { getClient } from "gql/client";
import { GET_USER_PROFILE } from "gql/queries/users";

export async function getFullUser(uid) {
  const response = { ok: false, data: null, error: null };

  const { error, data: { userMeta, userProfile } = {} } =
    await getClient().query(GET_USER_PROFILE, { userInput: { uid } });
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = { ...userMeta, ...userProfile };
  }

  return response;
}
