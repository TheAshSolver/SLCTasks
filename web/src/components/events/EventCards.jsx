import { Box, CircularProgress, Grid, Typography } from "@mui/material";

import EventCard from "components/events/EventCard";

export function EventCards({ events, loading, noEventsMessage }) {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          mt: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {events?.length ? (
        events.map((event) => (
          <Grid
            key={event._id}
            size={{
              xs: 6,
              md: 4,
              lg: 3,
            }}
          >
            <EventCard
              _id={event._id}
              name={event.name}
              datetimeperiod={event.datetimeperiod}
              poster={event.poster || event.clubbanner}
              clubid={event.clubid}
              blur={event.poster ? 0 : 0.3}
            />
          </Grid>
        ))
      ) : (
        <Typography
          variant="h4"
          sx={{
            color: "text.secondary",
            flexGrow: 1,
            textAlign: "center",
            mt: 5,
          }}
        >
          {noEventsMessage}
        </Typography>
      )}
    </Grid>
  );
}

export function LoadingIndicator() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        mt: 3,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
