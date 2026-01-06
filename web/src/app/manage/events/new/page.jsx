import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import {
  GET_REPORTS_SUBMISSION_STATUS,
  GET_UNFINISHED_EVENTS,
} from "gql/queries/events";

import EventForm from "components/events/EventForm";

export const metadata = {
  title: "New Event",
};

export default async function NewEvent() {
  // default form values
  const defaultValues = {
    clubid: "",
    collabclubs: [],
    name: "",
    datetimeperiod: [null, null],
    description: "",
    audience: [],
    poster: "",
    budget: [],
    sponsor: [],
    mode: "online",
    link: "",
    location: [],
    population: 0,
    additional: "",
    equipment: "",
    poc: "",
  };

  const { data: { events } = {} } = await getClient().query(
    GET_UNFINISHED_EVENTS,
    {
      clubid: null,
      public: false,
      excludeCompleted: true,
    },
  );

  const { data: { userMeta } = {} } = await getClient().query(GET_USER, {
    userInput: null,
  });

  const { data: { isEventReportsSubmitted } = {} } = await getClient().query(
    GET_REPORTS_SUBMISSION_STATUS,
    {
      clubid: userMeta?.role === "club" ? userMeta.uid : null,
    },
  );

  return (
    <Container>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        Create a New Event
      </Typography>
      <EventForm
        defaultValues={defaultValues}
        existingEvents={events}
        action="create"
        isReportSubmitted={isEventReportsSubmitted}
      />
    </Container>
  );
}
