import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_EVENT_STATUS } from "gql/queries/events";
import { GET_CLASHING_EVENTS } from "gql/queries/events";
import { GET_MEMBERS } from "gql/queries/members";

import EventActionTabs from "components/events/EventActionTabs";
import { extractFirstYear } from "components/members/MembersGrid";

import { techTeamWords } from "constants/ccMembersFilterWords";

export const metadata = {
  title: "Approve/Reject Event | CC",
};

export default async function ApproveEventCC(props) {
  const params = await props.params;
  const { id } = params;

  const { data: { event } = {} } = await getClient().query(GET_EVENT_STATUS, {
    eventid: id,
  });
  const { data: { clashingEvents } = {} } = await getClient().query(
    GET_CLASHING_EVENTS,
    {
      eventId: id,
    },
  );

  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };

  const { data: { members } = {} } = await getClient().query(GET_MEMBERS, {
    clubInput: {
      cid: "clubs",
    },
  });
  const ccMembers = members
    ?.map((member) => {
      const { roles } = member;
      const techTeamRoles = filterRoles(roles, techTeamWords);
      const newMember = { ...member, roles: techTeamRoles };
      return newMember;
    })
    ?.filter((member) => {
      return member.roles.length > 0;
    });

  // construct dict of { year: [members] } where each year is a key
  const currentccMembers = ccMembers
    ? ccMembers.filter((member) => {
        const latestYear = extractFirstYear(member);
        if (latestYear === -1) {
          return true;
        }
        return false;
      })
    : [];

  const clashFlag = clashingEvents?.length > 0;

  return (
    user?.role !== "cc" && redirect("/404"),
    event?.status?.state !== "pending_cc" && redirect("/404"),
    (
      <Container>
        <center>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              mb: 3,
            }}
          >
            Approve or Reject Event | Clubs Council
          </Typography>
        </center>
        <EventActionTabs
          eventid={event._id}
          members={currentccMembers}
          clashFlag={clashFlag}
        />
      </Container>
    )
  );
}

const filterRoles = (roles, filterWords) => {
  return roles?.filter((role) => {
    const { name } = role;
    const lowercaseName = name.toLowerCase();
    return !filterWords.some((word) => lowercaseName.includes(word));
  });
};
