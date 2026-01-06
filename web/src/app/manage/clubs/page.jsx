import { Button, Container, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_ALL_CLUBS } from "gql/queries/clubs";

import ClubsTable from "components/clubs/ClubsTable";
import Icon from "components/Icon";
import ButtonLink from "components/Link";

export const metadata = {
  title: "Manage Clubs",
};

export default async function ManageClubs() {
  const { data: { allClubs: clubs } = {} } =
    await getClient().query(GET_ALL_CLUBS);

  return (
    <Container>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Manage Clubs & Student Bodies
        </Typography>

        <Button
          component={ButtonLink}
          href="/manage/clubs/new"
          variant="contained"
          startIcon={<Icon variant="add" />}
        >
          New Club/Body
        </Button>
      </Stack>
      <ClubsTable clubs={clubs} />
    </Container>
  );
}
