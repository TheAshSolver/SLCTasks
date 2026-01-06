import { Divider, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_MEMBERS } from "gql/queries/members";

import LocalUsersGrid from "components/users/LocalUsersGrid";

export const dynamic = "force-dynamic";

export default async function MembersGrid({ clubid, onlyCurrent = false }) {
  const { data: { members } = {} } = await getClient().query(GET_MEMBERS, {
    clubInput: {
      cid: clubid,
    },
  });

  const currentYear = (new Date().getFullYear() + 1).toString();

  // construct dict of { year: [members] } where each year is a key
  const targetMembers = members
    ? members.reduce((acc, member) => {
        const latestYear = extractLatestYear(member);
        if (!acc[latestYear]) {
          acc[latestYear] = [];
        }
        acc[latestYear].push(member);
        return acc;
      }, {})
    : {};

  return members?.length ? (
    Object.keys(targetMembers)
      ?.filter((year) => (onlyCurrent ? year === currentYear : true))
      ?.sort((a, b) => parseInt(b) - parseInt(a))
      ?.map((year) => (
        <div key={year}>
          {!onlyCurrent ? (
            <Divider textAlign="left" sx={{ mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  textTransform: "uppercase",
                }}
              >
                {year === currentYear ? "Current Members" : year}
              </Typography>
            </Divider>
          ) : null}
          <LocalUsersGrid users={targetMembers[year]} />
        </div>
      ))
  ) : (
    <center>
      <h2>No Members Found!</h2>
    </center>
  );
}

// get the last year a member was in the club
// if member is still present, return current year + 1
export function extractLatestYear(member) {
  return Math.max(
    ...member.roles.map((r) =>
      !r.endYear ? new Date().getFullYear() + 1 : r.endYear,
    ),
  );
}

// get the first year a member was in the club
// if member is still present, return -1
export function extractFirstYear(member) {
  return Math.min(...member.roles.map((r) => (!r.endYear ? -1 : r.startYear)));
}
