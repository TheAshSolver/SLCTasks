"use server";

import { getClient } from "gql/client";
import { UPDATE_USERPHONE } from "gql/mutations/users";

export async function saveUserPhone(userDataInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(UPDATE_USERPHONE, {
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
