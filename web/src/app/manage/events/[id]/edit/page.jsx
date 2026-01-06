import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import {
  GET_FULL_EVENT,
  GET_REPORTS_SUBMISSION_STATUS,
  GET_UNFINISHED_EVENTS,
} from "gql/queries/events";

import EventForm from "components/events/EventForm";

export const metadata = {
  title: "Edit Event",
};

function transformEvent(event) {
  return {
    ...event,
    // parse datetime strings to date objects
    datetimeperiod: [
      new Date(event?.datetimeperiod[0]),
      new Date(event?.datetimeperiod[1]),
    ],
    budget:
      event?.budget?.map((budget, key) => ({
        ...budget,
        id: budget?.id || key,
      })) || [],
    sponsor:
      event?.sponsor?.map((sponsor, key) => ({
        ...sponsor,
        id: sponsor?.id || key,
      })) || [],
    // parse population as int
    population: parseInt(event?.population || 0),
    // default fallbacks for text fields
    additional: event?.additional || "",
    equipment: event?.equipment || "",
    poc: event?.poc,
    collabclubs: event?.collabclubs || [],
  };
}

export default async function EditEvent(props) {
  const params = await props.params;
  const { id } = params;
  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };

  const { data: { isEventReportsSubmitted } = {} } = await getClient().query(
    GET_REPORTS_SUBMISSION_STATUS,
    {
      clubid: userMeta?.role === "club" ? userMeta.uid : null,
    },
  );

  const { data: { events } = {} } = await getClient().query(
    GET_UNFINISHED_EVENTS,
    {
      clubid: null,
      public: false,
      excludeCompleted: true,
    },
  );

  try {
    const { data: { event } = {} } = await getClient().query(GET_FULL_EVENT, {
      eventid: id,
    });
    return (
      user?.role === "club" && user?.uid !== event.clubid && redirect("/404"),
      (
        <Container>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              mb: 3,
            }}
          >
            Edit Event Details
          </Typography>
          <EventForm
            id={id}
            defaultValues={transformEvent(event)}
            existingEvents={events.filter((e) => e._id !== id)}
            action="edit"
            isReportSubmitted={isEventReportsSubmitted}
          />
        </Container>
      )
    );
  } catch (error) {
    redirect("/404");
  }
}
