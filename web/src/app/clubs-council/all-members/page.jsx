import { Container, Divider, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_MEMBERS } from "gql/queries/members";

import { extractFirstYear } from "components/members/MembersGrid";
import LocalUsersGrid from "components/users/LocalUsersGrid";

import { techTeamWords } from "constants/ccMembersFilterWords";

export const metadata = {
  title: "Members | Clubs Council @ IIIT-H",
};

export default async function AllMembers() {
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

  // const currentYear = (new Date().getFullYear() + 1).toString();

  // construct dict of { year: [members] } where each year is a key
  const targetMembers = ccMembers
    ? ccMembers.reduce((acc, member) => {
        const latestYear = extractFirstYear(member);
        if (!acc[latestYear]) {
          acc[latestYear] = [];
        }
        acc[latestYear].push(member);
        return acc;
      }, {})
    : {};

  return (
    <Container>
      <center>
        <Typography
          variant="h3"
          sx={{
            mb: 4,
          }}
        >
          Executive Board & Extended Team
        </Typography>
      </center>
      {ccMembers?.length ? (
        Object.keys(targetMembers)
          ?.sort((a, b) => {
            if (a === -1) {
              return -1;
            } else if (b === -1) {
              return 1;
            } else {
              return parseInt(a) - parseInt(b);
            }
          })
          ?.map((year) => (
            <div key={year}>
              <div key={year}>
                <Divider textAlign="left" sx={{ mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      textTransform: "uppercase",
                    }}
                  >
                    {year == -1 ? "Current Members" : year}
                  </Typography>
                </Divider>
                <LocalUsersGrid users={targetMembers[year]} />
              </div>
            </div>
          ))
      ) : (
        <center>
          <h2>No Members Found!</h2>
        </center>
      )}
    </Container>
  );
}

const filterRoles = (roles, filterWords) => {
  return roles?.filter((role) => {
    const { name } = role;
    const lowercaseName = name.toLowerCase();
    return !filterWords.some((word) => lowercaseName.includes(word));
  });
};
