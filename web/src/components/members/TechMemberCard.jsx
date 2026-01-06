import Link from "next/link";

import { Box, Card, CardActionArea, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER_PROFILE } from "gql/queries/users";

import Icon from "components/Icon";
import UserImage from "components/users/UserImage";
import { getUserNameFromUID } from "utils/users";

import { techMembersGithubIds } from "constants/techmembersGithubIds";

export default async function TechMemberCard({ uid, poc, roles }) {
  const { data: { userProfile, userMeta } = {} } = await getClient().query(
    GET_USER_PROFILE,
    {
      userInput: {
        uid: uid,
      },
    },
  );

  if (userMeta === null) {
    return null;
  }

  let user = { ...userMeta, ...userProfile };
  if (userProfile === null) {
    const name = getUserNameFromUID(uid);
    const userProfile1 = {
      firstName: name.firstName,
      lastName: name.lastName,
      email: null,
      gender: null,
    };
    user = { ...userMeta, ...userProfile1 };
  }

  return (
    <Card
      variant="outlined"
      raised={false}
      sx={{
        backgroundColor: "inherit",
        border: "none",
        boxShadow: 0,
        justifyContent: "flex-start",
        alignItems: "center",
        display: "flex",
      }}
    >
      {/* <CardActionArea
        component={ButtonLink}
        href={`/profile/${uid}`}
        disabled={userProfile === null}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          p: 2.5,
        }}
      > */}
      {/* User Image */}
      <Box sx={{ flexShrink: 0, mr: 2 }}>
        <UserImage
          image={user.img}
          name={user.firstName}
          gender={user.gender}
          width={150}
          height={150}
          sx={{ borderRadius: "50%" }}
        />
      </Box>
      {/* User Details */}
      <Box sx={{ textAlign: "left" }}>
        <Typography
          variant="h5"
          sx={{
            textTransform: "capitalize",
            fontWeight: "bold",
            mb: 1,
          }}
        >
          {`${user.firstName} ${user.lastName}`.toLowerCase()}
        </Typography>

        <Box
          sx={{
            width: "30%",
            height: "3px",
            backgroundColor: "primary.main",
            mb: 3,
          }}
        />

        {roles
          ?.sort((a, b) => {
            // Sort roles logic
            if (a.endYear === null && b.endYear !== null) {
              return -1;
            } else if (a.endYear !== null && b.endYear === null) {
              return 1;
            } else {
              return b.endYear - a.endYear;
            }
          })
          .map((role, key) => (
            <Typography key={key} variant="body1" sx={{ mb: 0.5 }}>
              <Box
                component="span"
                sx={{ color: "text.primary", fontWeight: 500 }}
              >
                {role.name}
              </Box>{" "}
              <Box component="span" sx={{ color: "text.secondary" }}>
                ({role.startYear} - {role.endYear || "present"})
              </Box>
            </Typography>
          ))}

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Box sx={{ mr: 1.5 }}>
              <Link
                href={`/profile/${uid}`}
                passHref
                aria-label={"Profile link of " + user.firstName}
              >
                <Box
                  sx={{
                    p: 0.5,
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    variant="assignment-ind-outline"
                    color="primary.main"
                    width={25}
                  />
                </Box>
              </Link>
            </Box>
            {techMembersGithubIds.find((member) => member.uid === uid) && (
              <Link
                href={`https://github.com/${
                  techMembersGithubIds.find((member) => member.uid === uid)
                    ?.github
                }`}
                passHref
                target="_blank"
                rel="noopener noreferrer"
                aria-label={"GitHub profile of " + user.firstName}
              >
                <Box
                  sx={{
                    p: 0.5,
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    variant="ri:github-fill"
                    external
                    color="primary.main"
                    width={25}
                  />
                </Box>
              </Link>
            )}
          </Box>
        </Box>
      </Box>
      {/* </CardActionArea> */}
    </Card>
  );
}
