import { Button, Container, Divider, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import {
  GET_ALL_EVENTS,
  GET_PENDING_EVENTS,
  GET_REPORTS_SUBMISSION_STATUS,
} from "gql/queries/events";

import EventsTable from "components/events/EventsTable";
import Icon from "components/Icon";
import ButtonLink from "components/Link";

export const metadata = {
  title: "Manage Events",
};

async function getalleventsquery(querystring) {
  "use server";

  const { data = {}, error } = await getClient().query(GET_ALL_EVENTS, {
    clubid: querystring["targetClub"],
    public: false,
    pastEventsLimit: querystring["pastEventsLimit"],
  });

  if (error) {
    console.error(error);
    return [];
  }

  return data?.events || [];
}

export default async function ManageEvents() {
  const { data: { userMeta } = {} } = await getClient().query(GET_USER, {
    userInput: null,
  });

  const { data: { pendingEvents } = {} } = await getClient().query(
    GET_PENDING_EVENTS,
    { clubid: userMeta?.role === "club" ? userMeta.uid : null },
  );

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
          Manage Events
        </Typography>

        {["cc", "club"].includes(userMeta?.role) ? (
          <Button
            component={ButtonLink}
            href="/manage/events/new"
            variant="contained"
            startIcon={<Icon variant="add" />}
          >
            New Event
          </Button>
        ) : null}
      </Stack>
      {/* only pending events */}
      {pendingEvents.length ? (
        <>
          <EventsTable
            events={pendingEvents}
            scheduleSort="asc"
            hideClub={userMeta?.role === "club"} // hide club column if accessed by a club
          />
          {/* separator */}
          <Divider sx={{ my: 4 }} /> {/* marginY=4 for spacing */}
        </>
      ) : null}
      {/* all events */}
      <EventsTable
        query={getalleventsquery}
        clubid={userMeta?.role === "club" ? userMeta.uid : null}
        scheduleSort="desc"
        hideClub={userMeta?.role === "club"} // hide club column if accessed by a club
      />
    </Container>
  );
}
