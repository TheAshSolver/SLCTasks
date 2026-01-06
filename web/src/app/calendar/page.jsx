import { getClient } from "gql/client";
import { GET_ALL_CLUB_IDS } from "gql/queries/clubs";
import { GET_ALL_EVENTS_FOR_CALENDAR } from "gql/queries/events";
import { GET_HOLIDAYS } from "gql/queries/holidays";

import FullCalendar from "components/Calendar";

export const metadata = {
  title: "Calendar | Life @ IIIT-H",
};

export default async function Calendar() {
  const { data: { allClubs } = {} } = await getClient().query(GET_ALL_CLUB_IDS);

  const { data: { calendarEvents } = {} } = await getClient().query(
    GET_ALL_EVENTS_FOR_CALENDAR,
    {
      clubid: null,
    },
  );

  const { data: { holidays } = {} } = await getClient().query(GET_HOLIDAYS);

  return (
    <FullCalendar
      events={calendarEvents}
      holidays={holidays}
      allClubs={allClubs}
    />
  );
}
