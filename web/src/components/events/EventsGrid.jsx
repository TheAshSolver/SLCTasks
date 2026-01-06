import { getClient } from "gql/client";
import { GET_CLUB } from "gql/queries/clubs";
import { GET_ALL_EVENTS } from "gql/queries/events";

import { EventCards } from "./EventCards";

export default async function EventsGrid({
  type = "recent", // must be one of: {recent, club}
  clubid = null,
  limit = undefined,
  filter = () => true,
  events = null,
}) {
  if (type === "club" && !clubid) {
    throw new Error('clubid is required when type is "club"');
  } else if (type === "recent" && clubid) {
    clubid = null;
  }

  let data;
  if (events) {
    data = { data: { events } };
  } else {
    data = await getClient().query(GET_ALL_EVENTS, {
      clubid,
      limit: limit || 12,
      public: true,
    });
  }
  const uniqueClubIds = Array.from(
    new Set(data?.data?.events?.map((event) => event?.clubid)),
  );
  const clubDataMap = {};
  await Promise.all(
    uniqueClubIds.map(async (clubid) => {
      const { data: { club } = {} } = await getClient().query(GET_CLUB, {
        clubInput: { cid: clubid },
      });
      clubDataMap[clubid] = club;
    }),
  );

  const updatedEvents = await Promise.all(
    (data?.data?.events || []).map(async (event) => {
      if (!event.poster || event.poster == null) {
        const club = clubDataMap[event?.clubid];
        event.clubbanner = club?.banner || club?.logo;
      }
      return event;
    }),
  );

  return (
    <EventCards
      events={updatedEvents?.filter(filter)?.slice(0, limit)}
      loading={false}
      noEventsMessage="No events found."
    />
  );
}
