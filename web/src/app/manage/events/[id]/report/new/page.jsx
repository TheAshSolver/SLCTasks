import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_FULL_EVENT } from "gql/queries/events";

import EventReportForm from "components/events/report/EventReportForm";

export const metadata = {
  title: "Create Event Report",
};

function transformEvent(event) {
  return {
    ...event,
    datetimeperiod: [
      new Date(event?.datetimeperiod[0]),
      new Date(event?.datetimeperiod[1]),
    ],
    budget:
      event?.budget?.map((budget, key) => ({
        ...budget,
        id: budget?.id || key,
      })) || [],
    population: parseInt(event?.population || 0),
    additional: event?.additional || "",
    equipment: event?.equipment || "",
    poc: event?.poc,
    collabclubs: event?.collabclubs || [],
  };
}

export default async function NewEventReport(props) {
  const params = await props.params;
  const { id } = params;
  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };

  try {
    const { data: { event } = {} } = await getClient().query(GET_FULL_EVENT, {
      eventid: id,
    });
    if (
      !event ||
      event?.eventReportSubmitted ||
      user?.uid !== event.clubid ||
      event.status.state !== "approved"
    ) {
      return redirect("/404");
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
          Create Event Report
        </Typography>
        <EventReportForm
          id={id}
          defaultValues={transformEvent(event)}
          action="create"
        />
      </Container>
    );
  } catch (error) {
    return redirect("/404");
  }
}
