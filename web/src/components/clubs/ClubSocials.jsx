"use client";

import { useEffect, useState } from "react";

import { Box, Button } from "@mui/material";

import { useMode } from "contexts/ModeContext";

import Icon from "components/Icon";
import ButtonLink from "components/Link";
import { socialsData } from "utils/socialsData";

export default function ClubSocials({ socials = {}, email = null }) {
  const [processedSocials, setProcessedSocials] = useState({});
  const { isDark } = useMode();

  useEffect(() => {
    const processed = {};
    Object.keys(socialsData)
      ?.filter((k) => socials[k])
      ?.forEach((k) => {
        var content = socials[k];
        if (content.endsWith("/")) content = content.slice(0, -1); // remove trailing slash
        content = content.split("/").slice(-1)[0]; // get only the relevant part of the URL
        content = content.split("?")[0]; // remove querystring
        if (content !== "") processed[k] = content; // only add if not empty

        // exceptions (because the URL is not the username)
        if (k == "website") processed[k] = "Website";
        if (k == "discord") processed[k] = "Discord";
        if (k == "youtube") processed[k] = "YouTube";
        if (k == "whatsapp") processed[k] = "WhatsApp";
      });
    setProcessedSocials(processed);
  }, [socials]);

  return (
    <Box>
      {email ? (
        <Button
          component={ButtonLink}
          href={`mailto:${email}`}
          target="_blank"
          rel="noreferrer"
          sx={{
            mx: 0.2,
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          <Icon external variant={"mdi:email"} sx={{ mr: 1 }} />
          {email}
        </Button>
      ) : null}
      {Object.keys(socialsData)
        ?.filter((k) => socials[k])
        ?.map((item, index) => (
          <Button
            component={ButtonLink}
            href={socials[item]}
            target="_blank"
            rel="noreferrer"
            key={index}
            sx={{
              mx: 0.5,
              textTransform: "none",
              color: isDark
                ? socialsData[item].darkcolor
                : socialsData[item].color,
            }}
          >
            <Icon external variant={socialsData[item].icon} sx={{ mr: 1 }} />
            {processedSocials[item]}
          </Button>
        ))}
    </Box>
  );
}
