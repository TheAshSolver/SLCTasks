import { notFound, redirect } from "next/navigation";

import { getClient } from "gql/client";
import { GET_EVENT_ID_FROM_CODE } from "gql/queries/events";

export default async function EventByCode(props) {
  const params = await props.params;
  const { code } = params;

  const { data = {}, error } = await getClient().query(GET_EVENT_ID_FROM_CODE, {
    code,
  });
  if (error || !data?.eventid) notFound();

  redirect(`/manage/events/${data.eventid}`);
}
