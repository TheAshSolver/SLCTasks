import { Box, Typography } from "@mui/material";

import ClubsGrid from "components/clubs/ClubsGrid";
import Icon from "components/Icon";

export const metadata = {
  title: "Clubs @ IIIT-H",
};

export default async function Clubs() {
  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon variant="component-exchange" sx={{ mr: 1 }} />
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
          }}
        >
          Technical Clubs
        </Typography>
      </Box>
      <ClubsGrid category="technical" />
      <Box
        sx={{
          mb: 2,
          mt: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon variant="music-note-rounded" sx={{ mr: 1 }} />
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
          }}
        >
          Cultural Clubs
        </Typography>
      </Box>
      <ClubsGrid category="cultural" />
      <Box
        sx={{
          mb: 2,
          mt: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon variant="psychology-rounded" sx={{ mr: 1 }} />
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
          }}
        >
          Affinity Groups
        </Typography>
      </Box>
      <ClubsGrid category="affinity" />
    </Box>
  );
}
