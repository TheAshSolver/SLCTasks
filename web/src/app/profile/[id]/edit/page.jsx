import { notFound, redirect } from "next/navigation";

import { Container } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_MEMBERSHIPS } from "gql/queries/clubs";
import { GET_USER_PROFILE } from "gql/queries/users";

import UserForm from "components/profile/UserForm";

export const metadata = {
  title: "Edit Profile",
};

export default async function EditProfile(props) {
  const params = await props.params;
  const { id } = params;

  // get currently logged in user
  const {
    data: { userMeta: currentUserMeta, userProfile: currentUserProfile } = {},
  } = await getClient().query(GET_USER, { userInput: null });
  const currentUser = { ...currentUserMeta, ...currentUserProfile };

  // get target user
  const { data: { userProfile, userMeta } = {} } = await getClient().query(
    GET_USER_PROFILE,
    {
      userInput: {
        uid: id,
      },
    },
  );
  const user = { ...userMeta, ...userProfile };

  let isClub = user?.role === "club";
  const isCC = user?.role === "cc";

  if (
    userProfile === null ||
    userMeta === null ||
    (currentUser?.uid !== user?.uid && currentUser?.role !== "cc") ||
    isCC
  )
    redirect("/404");

  // get memberships of the user
  const {
    data: { memberRoles },
  } = await getClient().query(GET_MEMBERSHIPS, {
    uid: id,
  });
  if (memberRoles?.length === 0) notFound();
  else {
    if (isClub) isClub = false;
  }

  // if user is a club, redirect to club edit page
  if (isClub) {
    redirect(`/manage/clubs/${user.uid}/edit`);
  }

  return (
    <Container>
      <UserForm defaultValues={user} action="save" />
    </Container>
  );
}
