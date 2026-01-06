import { Box, Card } from "@mui/material";

import ActionPalette from "components/ActionPalette";
import {
  DeleteClub,
  EditClub,
  UnDeleteClub,
} from "components/clubs/ClubActions";
import ClubBanner from "components/clubs/ClubBanner";
import ClubInfo from "components/clubs/ClubInfo";
import ClubSocials from "components/clubs/ClubSocials";
import { getClub, getCurrentUser } from "utils/fetchData";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;

  const user = await getCurrentUser();
  const club = await getClub(
    id === encodeURIComponent("~mine") ? user.uid : id,
  );

  return {
    title: club.name,
  };
}

export default async function ManageClub(props) {
  const params = await props.params;
  const { id } = params;

  const user = await getCurrentUser();
  const club = await getClub(
    id === encodeURIComponent("~mine") ? user.uid : id,
  );

  return (
    <Box>
      <ActionPalette right={getActions(club, user)} />
      <Card variant="none" sx={{ boxShadow: 0 }}>
        <ClubBanner
          name={club.name}
          banner={club.banner}
          width={640}
          height={480}
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
    </Box>
  );
}

// set conditional actions based on club status and user role
function getActions(club, user) {
  /*
   * Deleted - nothing
   */
  if (club?.state === "deleted") {
    return [UnDeleteClub];
  }

  /*
   * Club - edit
   */
  if (user?.role === "club") {
    return [EditClub];
  }

  /*
   * CC - edit, delete
   */
  if (user?.role === "cc") {
    return [EditClub, DeleteClub];
  }
}
