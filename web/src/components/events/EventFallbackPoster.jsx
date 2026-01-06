import { getClient } from "gql/client";
import { GET_CLUB } from "gql/queries/clubs";

import EventPoster from "components/events/EventPoster";

export default async function EventFallbackPoster({ clubid, width, height }) {
  const { data: { club } = {} } = await getClient().query(GET_CLUB, {
    clubInput: { cid: clubid },
  });

  return (
    <EventPoster
      name={club.name}
      poster={club?.bannerSquare || club?.logo}
      width={width}
      height={height}
      style={{
        filter: "blur(0.3em)",
      }}
    />
  );
}
