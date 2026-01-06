"use server";

import { getClient } from "gql/client";
import { GET_USER_LIST_BY_ROLE } from "gql/queries/users";

export async function getUserByRole(role = "slc") {
  const response = { ok: false, data: null, error: null };

  const { error, data: { usersByRole } = {} } = await getClient().query(
    GET_USER_LIST_BY_ROLE,
    { role: role },
  );
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = usersByRole;
  }

  return response;
}
