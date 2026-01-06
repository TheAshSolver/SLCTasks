"use server";

import { getClient } from "gql/client";
import { UPDATE_STORAGEFILE } from "gql/mutations/storagefiles";

export async function updateStorageFile(fileId, version) {
  const response = { ok: false, error: null };

  try {
    const result = await getClient().mutation(UPDATE_STORAGEFILE, {
      fileId,
      version,
    });

    // Handle case where result is null or undefined
    if (!result) {
      response.error = {
        title: "GraphQL Error",
        messages: ["No response received from server"],
      };
      return response;
    }

    // Safe destructuring with fallback
    const { error, data } = result;

    if (error) {
      response.error = {
        title: error.name || "GraphQL Error",
        messages: error?.graphQLErrors?.map((ge) => ge?.message) || [
          "Unknown error occurred",
        ],
      };
    } else {
      // Safely access updateStorageFile from data
      response.ok = data?.updateStorageFile ?? false;
    }
  } catch (err) {
    response.error = {
      title: "Unexpected Error",
      messages: [err.message],
    };
  }

  return response;
}
