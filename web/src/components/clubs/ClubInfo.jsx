"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import ClubLogo from "components/clubs/ClubLogo";

export default function ClubInfo({ name, logo, tagline, description }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 3,
          mb: 2,
        }}
      >
        <ClubLogo
          name={name}
          logo={logo}
          width={isDesktop ? 100 : 48}
          height={isDesktop ? 100 : 48}
          mr={isDesktop ? 3 : 2}
        />
        <Box>
          <Typography variant={isDesktop ? "h3" : "h4"}>{name}</Typography>
          <Typography
            variant={isDesktop ? "subtitle1" : "subtitle2"}
            sx={{
              color: "text.disabled",
              fontWeight: 400,
            }}
          >
            {tagline}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          pt: 2,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            mx: 1,
            whiteSpace: "pre-wrap",
          }}
        >
          {description}
        </Typography>
      </Box>
    </>
  );
}
