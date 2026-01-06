import dayjs from "dayjs";

import { shortDescription } from "app/layout";
import EventDetails, { getEventLocation } from "components/events/EventDetails";
import { getEvent } from "utils/fetchData";
import { getFile, PUBLIC_URL } from "utils/files";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;

  const event = await getEvent(id);
  const img = event.poster
    ? getFile(event.poster, true)
    : `${PUBLIC_URL}/og-image.png`;
  const alt = event.poster ? event.name + " Poster" : "Common Poster";

  const time = dayjs(event.datetimeperiod[0]).format("dddd h A");

  return {
    title: `${event.name} | Life @ IIITH`,
    description: event.description ? event.description : shortDescription,
    openGraph: {
      title: `${event.name} (Time: ${time}, Location: ${getEventLocation(
        event,
      )}) | Life @ IIITH`,
      siteName: "Life @ IIITH",
      images: [
        {
          url: img,
          secure_url: img,
          width: 256,
          height: 256,
          alt: alt,
        },
      ],
    },
  };
}

export default async function Event(props) {
  const params = await props.params;
  const { id } = params;
  const event = await getEvent(id);

  return <EventDetails event={event} />;
}
