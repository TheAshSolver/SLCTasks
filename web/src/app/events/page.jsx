import { Box } from "@mui/material";

import { getClient } from "gql/client";
import { GET_ALL_CLUBS } from "gql/queries/clubs";
import { GET_ALL_EVENTS } from "gql/queries/events";

import EventsFilter from "components/events/EventsFilter";
import PaginatedEventsGrid from "components/events/PaginatedEventGrid";

export const metadata = {
  title: "Events | Life @ IIIT-H",
};

async function query(querystring) {
  "use server";

  const { data = {}, error } = await getClient().query(GET_ALL_EVENTS, {
    clubid: querystring["targetClub"],
    name: querystring["targetName"],
    public: true,
    paginationOn: querystring["paginationOn"],
    skip: querystring["skip"],
    limit: querystring["limit"],
  });

  if (error) {
    console.error(error);
    return [];
  }

  return data?.events || [];
}

export default async function Events(props) {
  const searchParams = await props.searchParams;
  const targetName = searchParams?.name;
  const targetClub = searchParams?.club;

  let targetState = ["upcoming", "completed"];
  targetState = targetState.filter(
    (state) => searchParams?.[state] !== "false",
  );

  const { data: { allClubs } = {} } = await getClient().query(GET_ALL_CLUBS);

  return (
    <Box>
      <Box
        sx={{
          mt: 2,
        }}
      >
        <EventsFilter name={targetName} club={targetClub} state={targetState} />
      </Box>
      <PaginatedEventsGrid
        query={query}
        clubs={allClubs}
        targets={[targetName, targetClub, targetState]}
      />
    </Box>
  );
}
