import { redirect } from "next/navigation";

import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_EVENT_BILLS_STATUS, GET_EVENT_BUDGET } from "gql/queries/events";

import BillsStatusForm from "components/events/bills/EditBillsStatus";
import FinanceHeader from "components/events/bills/FinanceHeader";
import EventBudget from "components/events/EventBudget";
import ButtonLink from "components/Link";

export const metadata = {
  title: "Edit Bill Status",
};

export default async function EditFinance(props) {
  const params = await props.params;
  const { id } = params;

  const { data: { event } = {} } = await getClient().query(GET_EVENT_BUDGET, {
    eventid: id,
  });

  const { data, error } = await getClient().query(GET_EVENT_BILLS_STATUS, {
    eventid: id,
  });

  if (error && !error.message.includes("no bills status")) {
    return (
      <Container>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mt: 5,
            px: 2,
          }}
        >
          Error: {error.message.slice(10)}
        </Typography>
        <Stack
          direction="column"
          sx={{
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            component={ButtonLink}
            href={`/manage/finances`}
          >
            <Typography variant="button" color="opposite">
              Go Back
            </Typography>
          </Button>
        </Stack>
      </Container>
    );
  }

  const defaultValues = {
    state: null,
    sloComment: null,
  };

  const eventBills = data?.eventBills || defaultValues;

  if (eventBills.state === "not_submitted" || eventBills.state === "rejected") {
    redirect("/404");
  }

  return (
    <Container>
      {eventBills.state === "submitted" ? (
        <FinanceHeader
          id={id}
          eventTitle={event.name}
          filename={eventBills?.filename}
        />
      ) : null}
      <Box
        sx={{
          mb: 5,
        }}
      >
        <BillsStatusForm id={id} defaultValues={eventBills} />
      </Box>
      <EventBudget
        rows={event?.budget?.map((b, key) => ({
          ...b,
          id: b?.id || key,
        }))} // add ID to each budget item if it doesn't exist (MUI requirement)
        editable={false}
        billViewable={true}
      />
    </Container>
  );
}
