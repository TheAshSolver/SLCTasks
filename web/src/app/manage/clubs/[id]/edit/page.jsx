import { notFound } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_CLUB } from "gql/queries/clubs";

import ClubForm from "components/clubs/ClubForm";

export const metadata = {
  title: "Edit Club",
};

export default async function EditClub(props) {
  const params = await props.params;
  const { id } = params;

  let userMeta, club;

  try {
    const { data: { userMeta: fetchedUserMeta } = {} } =
      await getClient().query(GET_USER, {
        userInput: null,
      });
    userMeta = fetchedUserMeta;

    const { data: { club: fetchedClub } = {} } = await getClient().query(
      GET_CLUB,
      {
        clubInput: {
          cid: id === encodeURIComponent("~mine") ? userMeta.uid : id,
        },
      },
    );
    club = fetchedClub;
  } catch (error) {
    notFound();
  }

  return (
    <Container>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        Edit Club Details
      </Typography>
      <ClubForm defaultValues={club} action="edit" />
    </Container>
  );
}
