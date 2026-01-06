import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_ALL_CLUBS } from "gql/queries/clubs";

import BuzzSchedule from "components/buzz";
import { getStaticFile } from "utils/files";

export const metadata = {
  title: "Buzz Schedule | Felicity @ IIIT-H",
};

export default async function Managebuzz() {
  const event = await fetch(getStaticFile("buzz.json"), {
    next: { revalidate: 120 },
  });
  const events = await event.json();

  const { data: { allClubs } = {} } = await getClient().query(GET_ALL_CLUBS);

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        Felicity Buzz Schedule
      </Typography>
      <BuzzSchedule
        events={events.map((event, index) => ({
          ...event,
          id: index + 1,
        }))}
        allClubs={allClubs}
      />
    </Container>
  );
}
