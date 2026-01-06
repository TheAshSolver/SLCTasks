"use server";

import { getClient } from "gql/client";
import { UPDATE_USERDATA } from "gql/mutations/users";

export async function updateUserDataAction(userDataInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(UPDATE_USERDATA, {
    userDataInput,
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
