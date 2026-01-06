"use server";

import { getClient } from "gql/client";
import { CREATE_STORAGEFILE } from "gql/mutations/storagefiles";

export async function createStorageFile(details) {
  const response = { ok: false, data: null, error: null };

  const { data, error } = await getClient().mutation(CREATE_STORAGEFILE, {
    details,
  });

  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = data.createStorageFile;
  }

  return response;
}
