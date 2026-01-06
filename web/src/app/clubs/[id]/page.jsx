import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { Box, Button, Card, Divider, Stack, Typography } from "@mui/material";

import ClubBanner from "components/clubs/ClubBanner";
import ClubInfo from "components/clubs/ClubInfo";
import ClubSocials from "components/clubs/ClubSocials";
import EventsGrid from "components/events/EventsGrid";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import MembersGrid from "components/members/MembersGrid";
import { getClub } from "utils/fetchData";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;

  const club = await getClub(id);

  if (club?.category == "body")
    return permanentRedirect(`/student-bodies/${id}`);

  return {
    title: club.name,
  };
}

export default async function Club(props) {
  const params = await props.params;
  const { id } = params;
  const club = await getClub(id);

  return (
    <Box>
      <Card variant="none" sx={{ boxShadow: 0 }}>
        <ClubBanner
          name={club.name}
          banner={club?.banner}
          width={640}
          height={480}
          priority={true}
        />
      </Card>
      <Box
        sx={{
          my: 4,
        }}
      >
        <ClubInfo
          name={club.name}
          logo={club.logo}
          tagline={club.tagline}
          description={club.description}
        />
      </Box>
      <ClubSocials socials={club.socials} email={club.email} />
      <Divider sx={{ borderStyle: "dashed", mt: 3 }} />
      <Stack
        direction="column"
        sx={{
          mx: 2,
        }}
      >
        <Box
          sx={{
            my: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon variant="local-activity-outline-rounded" sx={{ mr: 1 }} />
              <Typography variant="h4">Events</Typography>
            </Box>
            <Button
              variant="none"
              color="secondary"
              component={ButtonLink}
              href={`/events?club=${id}`}
            >
              <Typography
                variant="button"
                sx={{
                  color: "text.primary",
                }}
              >
                View all
              </Typography>
              <Icon variant="chevron-right" />
            </Button>
          </Box>
          <EventsGrid type="club" clubid={id} limit={4} />
        </Box>

        <Box
          sx={{
            my: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon variant="group-outline-rounded" sx={{ mr: 1 }} />
              <Typography variant="h4">Members</Typography>
            </Box>
            <Button
              variant="none"
              color="secondary"
              component={ButtonLink}
              href={`/${
                club?.category == "body" ? "student-bodies" : "clubs"
              }/${id}/members`}
            >
              <Typography
                variant="button"
                sx={{
                  color: "text.primary",
                }}
              >
                View all
              </Typography>
              <Icon variant="chevron-right" />
            </Button>
          </Box>
          <MembersGrid onlyCurrent clubid={id} />
        </Box>
      </Stack>
    </Box>
  );
}
