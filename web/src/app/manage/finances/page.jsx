import { Container, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_ALL_EVENTS_BILLS_STATUS } from "gql/queries/events";

import FinancesTable from "components/events/bills/FinancesTable";

export const metadata = {
  title: "Manage Finances",
};

export default async function ManageBills() {
  const response = await getClient().query(GET_ALL_EVENTS_BILLS_STATUS);
  const allEventsBills = response?.data?.allEventsBills || [];

  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };

  const filterEventsbyState = (states) =>
    allEventsBills.filter((event) =>
      states.includes(event?.billsStatus?.state),
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
          Event Finances
        </Typography>
      </Stack>
      {user?.role === "slo" ? (
        <>
          <Stack
            direction={"row"}
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                mt: 3,
              }}
            >
              Submitted
            </Typography>
            <Typography variant="body2" color="secondary">
              (Clicking on event takes you to approval page)
            </Typography>
          </Stack>
          <FinancesTable
            events={filterEventsbyState(["submitted"])}
            role={user?.role}
          />{" "}
        </>
      ) : null}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mt: 3,
        }}
      >
        Pending
      </Typography>
      <FinancesTable
        events={filterEventsbyState(["not_submitted", "rejected"])}
        role={user?.role}
      />
      {user?.role !== "slo" ? (
        <>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              mt: 3,
            }}
          >
            Submitted
          </Typography>
          <FinancesTable
            events={filterEventsbyState(["submitted"])}
            role={user?.role}
          />{" "}
        </>
      ) : null}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mt: 3,
        }}
      >
        Accepted
      </Typography>
      <FinancesTable
        events={filterEventsbyState(["accepted"])}
        role={user?.role}
      />
    </Container>
  );
}
