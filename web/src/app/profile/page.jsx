import { notFound, redirect } from "next/navigation";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";

export default async function Profile() {
  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };

  if (user.uid == null) {
    notFound();
  }

  // redirect to user's profile page
  redirect(`/profile/${user.uid}`);
}
