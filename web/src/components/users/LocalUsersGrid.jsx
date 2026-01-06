import React from "react";

import { Grid } from "@mui/material";

import MemberCard from "components/members/MemberCard";
import TechMemberCard from "components/members/TechMemberCard";

export default async function LocalUsersGrid({ users, techMembers = false }) {
  return (
    <Grid
      container
      spacing={techMembers ? 4 : 2}
      sx={{
        mb: 3,
      }}
    >
      {users?.map((member) => (
        <React.Fragment key={member.uid}>
          {techMembers ? (
            <Grid
              size={{
                xs: 12,
                md: 6,
                lg: 6,
              }}
            >
              <TechMemberCard
                uid={member.uid}
                poc={member.poc}
                roles={member.roles}
              />
            </Grid>
          ) : (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 2.4,
              }}
            >
              <MemberCard
                uid={member.uid}
                poc={member.poc}
                roles={member.roles}
              />
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
}
