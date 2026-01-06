import { Box, Button, Typography } from "@mui/material";

import ClubLogo from "components/clubs/ClubLogo";
import ButtonLink from "components/Link";

export default async function ClubBox({ club }) {
  if (!club) return null;

  return (
    <Box>
      <Button
        component={ButtonLink}
        href={`/clubs/${club.cid}`}
        variant="outlined"
        color="secondary"
        display="flex"
        alignItems="center"
      >
        <ClubLogo
          name={club.name}
          logo={club.logo}
          width={18}
          height={18}
          mr={1}
          style={{
            border: "2px solid lightgray",
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
          }}
        >
          {club.name}
        </Typography>
      </Button>
    </Box>
  );
}
