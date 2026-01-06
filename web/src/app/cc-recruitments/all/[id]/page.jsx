import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_MEMBERSHIPS } from "gql/queries/clubs";
import { GET_ALL_RECRUITMENTS } from "gql/queries/recruitment";

import ButtonLink from "components/Link";
import UserDetails from "components/profile/UserDetails";
import UserMemberships from "components/profile/UserMemberships";
import UserImage from "components/users/UserImage";
import { getUserProfile } from "utils/fetchData";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;
  const user = await getUserProfile(id);

  return {
    title: `${user.firstName} ${user.lastName}`,
  };
}

export default async function CCApplicantDetails(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { id } = params;
  const year = parseInt(searchParams?.year) || new Date().getFullYear();

  const { data: { ccApplications } = {} } = await getClient().query(
    GET_ALL_RECRUITMENTS,
    {
      year: year,
    },
  );

  let currentApplicant = ccApplications.find(
    (applicant) => applicant.uid === id,
  );

  // get target user
  const user = await getUserProfile(id);

  // get memberships if user is a person
  let memberships = [];
  const {
    data: { memberRoles },
  } = await getClient().query(GET_MEMBERSHIPS, {
    uid: user.uid,
  });
  // get list of memberRoles.roles along with member.cid
  memberships = memberRoles.reduce(
    (cv, m) => cv.concat(m.roles.map((r) => ({ ...r, cid: m.cid }))),
    [],
  );

  return (
    <Container>
      <Grid
        container
        spacing={2}
        sx={{
          mt: 4,
        }}
      >
        <Grid size={12}>
          <Stack
            direction="column"
            sx={{
              alignItems: "end",
              mt: 2,
              justifyContent: "right",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              component={ButtonLink}
              href={`/cc-recruitments/all?year=${year}`}
            >
              <Typography variant="button" color="opposite">
                Go Back
              </Typography>
            </Button>
          </Stack>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={4}
            sx={{
              alignItems: "center",
            }}
          >
            <UserImage
              image={user.img}
              name={user.firstName}
              gender={user.gender}
              width={150}
              height={150}
            />
            <Stack direction="column" spacing={1}>
              <Typography
                variant="h2"
                sx={{
                  textAlign: { xs: "center", lg: "left" },
                  fontSize: { xs: 25, lg: 38 },
                  wordBreak: "break-word",
                }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontFamily: "monospace",
                  textAlign: { xs: "center", lg: "left" },
                  fontSize: { xs: 14, lg: 20 },
                }}
              >
                {user.email}
              </Typography>
            </Stack>
          </Stack>
        </Grid>

        <Grid
          container
          spacing={2}
          sx={{
            mt: 5,
          }}
          size="grow"
        >
          <UserDetails user={user} />
        </Grid>

        <Grid
          sx={{
            mt: { xs: 2, lg: 5 },
          }}
          size={{
            xs: 12,
            lg: 9,
          }}
        >
          <Stack direction="column" spacing={2}>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: "uppercase",
              }}
            >
              Memberships
            </Typography>
            <UserMemberships rows={memberships} />
          </Stack>
        </Grid>
      </Grid>
      <Box
        sx={{
          mt: 5,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Application Details
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Teams:
          </Typography>
          <Typography variant="body1">
            {currentApplicant?.teams?.map((team, index) => (
              <span key={index}>
                {team.charAt(0).toUpperCase() + team.slice(1)}
                {index !== currentApplicant?.teams?.length - 1 ? ", " : ""}
              </span>
            ))}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Why these teams:
          </Typography>
          <Typography variant="body1">
            {currentApplicant?.whyThisPosition}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Why CC:
          </Typography>
          <Typography variant="body1">{currentApplicant?.whyCc}</Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Good Fit:
          </Typography>
          <Typography variant="body1">
            {currentApplicant?.goodFit || "N/A"}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Participation Obstacles:
          </Typography>
          <Typography variant="body1">
            {currentApplicant?.ideas1 || "-"}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            New Ideas:
          </Typography>
          <Typography variant="body1">{currentApplicant?.ideas}</Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Other Bodies:
          </Typography>
          <Typography variant="body1">
            {currentApplicant?.otherBodies || "N/A"}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Design Experience:
          </Typography>
          <Typography variant="body1">
            {currentApplicant?.designExperience || "N/A"}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Time of Submission:
          </Typography>
          <Typography variant="body1">
            {new Date(currentApplicant.sentTime).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
