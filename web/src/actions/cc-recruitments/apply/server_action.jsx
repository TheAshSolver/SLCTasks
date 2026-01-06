"use server";

import { getClient } from "gql/client";
import { APPLY_FOR_CC } from "gql/mutations/recruitments";

export async function ccRecruitmentsApply(ccRecruitmentInput) {
  const response = { ok: false, error: null };

  const { error } = await getClient().mutation(APPLY_FOR_CC, {
    ccRecruitmentInput,
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
