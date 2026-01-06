import { Box, Button, Divider, Stack, Typography } from "@mui/material";

import Icon from "components/Icon";
import ButtonLink from "components/Link";

export default async function EventReportStatus(event, user) {
  if (
    !event ||
    event?.status?.state !== "approved" ||
    new Date(event?.datetimeperiod[1]) > new Date()
  ) {
    return null;
  }
  return (
    <>
      <Divider sx={{ borderStyle: "dashed", my: 2 }} />
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{
          textTransform: "uppercase",
        }}
      >
        Event Report
      </Typography>
      {!event.eventReportSubmitted ? (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          No event report submitted.
          {event?.clubid === user?.uid ? (
            <Button
              component={ButtonLink}
              href={`/manage/events/${event._id}/report/new`}
              variant="contained"
              color="primary"
              startIcon={<Icon variant="add" />}
              sx={{ mt: 2, width: "max-content" }}
            >
              Add Report
            </Button>
          ) : (
            ""
          )}
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
          }}
        >
          <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
            <Button
              component={ButtonLink}
              href={`/manage/events/${event._id}/report`}
              variant="contained"
              color="success"
              startIcon={<Icon variant="visibility-outline" />}
              sx={{ width: "max-content" }}
            >
              View Report
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
}
