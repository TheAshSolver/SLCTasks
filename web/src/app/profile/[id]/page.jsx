import { notFound, redirect } from "next/navigation";

import { Container, Grid, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_CLUB, GET_MEMBERSHIPS } from "gql/queries/clubs";

import ActionPalette from "components/ActionPalette";
import { EditUser } from "components/profile/UserActions";
import UserDetails from "components/profile/UserDetails";
import UserMemberships from "components/profile/UserMemberships";
import UserImage from "components/users/UserImage";
import { getCurrentUser, getUserProfile } from "utils/fetchData";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;
  const user = await getUserProfile(id);

  return {
    title: `${user.firstName} ${user.lastName}`,
  };
}

export default async function Profile(props) {
  const params = await props.params;
  const { id } = params;

  // get currently logged in user
  const currentUser = await getCurrentUser();

  // get target user
  const user = await getUserProfile(id);

  // if user is a club, display the club's logo as profile picture
  let club = null;
  if (user?.role === "club") {
    const { data: { club: targetClub } = {} } = await getClient().query(
      GET_CLUB,
      { clubInput: { cid: user.uid } },
    );
    club = targetClub;
  }

  const fetchMemberships =
    user?.role === "public" ||
    user?.email?.includes("@students.") ||
    user?.email?.includes("@research.");

  // get memberships if user is a person
  let memberships = [];
  if (fetchMemberships) {
    const {
      data: { memberRoles },
    } = await getClient().query(GET_MEMBERSHIPS, {
      uid: user.uid,
    });

    // get list of memberRoles.roles along with member.cid
    memberships = memberRoles.reduce(
      (cv, m) => cv.concat(m.roles.map((r) => ({ ...r, cid: m.cid }))),
      [],
    );

    if (memberships?.length > 0) {
      if (club) club = null;
    } else {
      if (!club && currentUser?.uid !== user.uid) notFound();
    }
  }

  if (user?.role === "cc") redirect("/clubs-council");
  if (club) redirect(`/clubs/${club.cid}`);

  return (
    <Container>
      {/*
        show action palette only
        1. if current user is CC, or
        2. if current user is viewing their own profile and is not a club
      */}
      {currentUser?.role === "cc" ||
      (memberships?.length !== 0 && currentUser?.uid === user?.uid) ? (
        <ActionPalette right={[EditUser]} rightJustifyMobile="flex-end" />
      ) : null}
      <Grid
        container
        spacing={2}
        sx={{
          mt: 4,
        }}
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={4}
            sx={{
              alignItems: "center",
            }}
          >
            <UserImage
              image={user.img}
              name={user.firstName}
              gender={user.gender}
              width={150}
              height={150}
            />
            <Stack direction="column" spacing={1}>
              <Typography
                variant="h2"
                sx={{
                  textAlign: { xs: "center", lg: "left" },
                  textAlign: { xs: "center", lg: "left" },
                  fontSize: { xs: 25, lg: 38 },
                  wordBreak: "break-word",
                }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontFamily: "monospace",
                  textAlign: { xs: "center", lg: "left" },
                  color: "text.secondary",
                  fontFamily: "monospace",
                  textAlign: { xs: "center", lg: "left" },
                  fontSize: { xs: 14, lg: 20 },
                }}
              >
                {user.email}
              </Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Show user details only for students */}
        {user?.batch?.toLowerCase()?.includes("2k") ? ( // hacky way to exclude faculty and staff
          <>
            <Grid
              container
              spacing={2}
              sx={{
                mt: 5,
              }}
              size="grow"
            >
              <UserDetails user={user} />
            </Grid>
            <Grid
              sx={{
                mt: { xs: 2, lg: 5 },
              }}
              size={{
                xs: 12,
                lg: 9,
              }}
            >
              <Stack direction="column" spacing={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    textTransform: "uppercase",
                  }}
                >
                  Memberships
                </Typography>
                <UserMemberships rows={memberships} />
              </Stack>
            </Grid>
          </>
        ) : null}
      </Grid>
    </Container>
  );
}
