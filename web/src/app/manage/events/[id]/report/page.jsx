import { redirect } from "next/navigation";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_ACTIVE_CLUBS } from "gql/queries/clubs";
import { GET_EVENT_REPORT, GET_FULL_EVENT } from "gql/queries/events";

import { EventReportDetails } from "components/events/report/EventReportDetails";

import { getFullUser } from "actions/users/get/full/server_action";

export default async function EventReport(props) {
  const params = await props.params;
  const { id } = params;

  try {
    const { data: { event } = {} } = await getClient().query(GET_FULL_EVENT, {
      eventid: id,
    });

    const { data: { userMeta, userProfile } = {} } = await getClient().query(
      GET_USER,
      { userInput: null },
    );
    const user = { ...userMeta, ...userProfile };
    user?.role === "club" &&
      user?.uid !== event.clubid &&
      !event?.collabclubs.includes(user?.uid) &&
      redirect("/404");

    if (!event || !event?.eventReportSubmitted) {
      return redirect("/404");
    }

    const { data: { eventReport } = {} } = await getClient().query(
      GET_EVENT_REPORT,
      {
        eventid: id,
      },
    );

    const {
      data: { allClubs },
    } = await getClient().query(GET_ACTIVE_CLUBS);

    const submittedUserProfile = await getFullUser(eventReport?.submittedBy);
    if (!submittedUserProfile || !eventReport) {
      return redirect("/404");
    }

    return (
      <EventReportDetails
        event={event}
        eventReport={eventReport}
        submittedUser={submittedUserProfile}
        clubs={allClubs}
        user={user}
      />
    );
  } catch (error) {
    return redirect("/404");
  }
}
