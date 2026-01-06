"use server";

import { getClient } from "gql/client";
import { GET_AVAILABLE_LOCATIONS } from "gql/queries/events";

export async function eventsVenues(data) {
  const response = { ok: false, data: null, error: null };
  const { startDate, endDate, eventid } = data;

  const { data: outputData, error } = await getClient().query(
    GET_AVAILABLE_LOCATIONS,
    {
      timeslot: [startDate, endDate],
      eventid: eventid,
    },
  );
  if (error) {
    response.error = {
      title: error.name,
      messages: error?.graphQLErrors?.map((ge) => ge?.message),
    };
  } else {
    response.ok = true;
    response.data = outputData?.availableRooms?.locations;
  }

  return response;
}
