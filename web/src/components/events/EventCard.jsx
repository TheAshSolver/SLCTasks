"use client";

import dynamic from "next/dynamic";

import { Box, Card, CardActionArea, Stack, Typography } from "@mui/material";

import EventPoster from "components/events/EventPoster";
import ButtonLink from "components/Link";

const DateTime = dynamic(() => import("components/DateTime"), { ssr: false });

export default function EventCard({
  _id,
  name,
  datetimeperiod,
  poster,
  blur = 0,
}) {
  return (
    <Card>
      <CardActionArea component={ButtonLink} href={`/events/${_id}`}>
        <Box sx={{ pt: "100%", position: "relative" }}>
          {poster ? (
            <EventPoster
              name={name}
              poster={poster}
              width={600}
              height={600}
              style={{
                filter: `blur(${blur}em)`,
              }}
            />
          ) : null}
        </Box>

        <Stack spacing={1} sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontSize: 16,
            }}
          >
            {name}
          </Typography>
          <Typography variant="caption" noWrap>
            <DateTime dt={datetimeperiod?.[0]} showWeekDay={true} />
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
