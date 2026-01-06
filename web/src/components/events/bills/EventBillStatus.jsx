import { Box, Button, Divider, Grid, Stack, Typography } from "@mui/material";

import FinanceHeader from "components/events/bills/FinanceHeader";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import { billsStateLabel } from "utils/formatEvent";

export default async function EventBillStatus(event, eventBills, userid) {
  if (
    event?.status?.state !== "approved" ||
    new Date(event?.datetimeperiod[1]) > new Date() ||
    event?.budget?.length === 0
  )
    return null;

  if (!eventBills) return null;

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
        Financial Information
      </Typography>
      <Grid container spacing={2}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 5,
              lg: 3,
            }}
          >
            <Box
              sx={{
                mt: 2,
              }}
            >
              Bills Status
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 1,
              lg: 0.1,
            }}
          >
            <Box
              sx={{
                mt: 2,
              }}
            >
              -
            </Box>
          </Grid>
          <Grid size="grow">
            <Box
              sx={{
                mt: 2,
              }}
            >
              {eventBills?.state == null
                ? "Information not available"
                : billsStateLabel(eventBills?.state)?.name}
            </Box>
          </Grid>
        </Grid>

        {eventBills?.state != null ? (
          <>
            {eventBills?.state !== "not_submitted" ? (
              <>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 5,
                      lg: 3,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0,
                      }}
                    >
                      Last Updated
                    </Box>
                  </Grid>
                  <Grid
                    size={{
                      xs: 1,
                      lg: 0.1,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0,
                      }}
                    >
                      -
                    </Box>
                  </Grid>
                  <Grid size="grow">
                    <Box
                      sx={{
                        mt: 0,
                      }}
                    >
                      {eventBills?.updatedTime == null
                        ? "Information not available"
                        : eventBills?.updatedTime}
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 5,
                      lg: 3,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0,
                      }}
                    >
                      SLO Comment
                    </Box>
                  </Grid>
                  <Grid
                    size={{
                      xs: 1,
                      lg: 0.1,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0,
                      }}
                    >
                      -
                    </Box>
                  </Grid>
                  <Grid size="grow">
                    <Box
                      sx={{
                        mt: 0,
                      }}
                    >
                      {eventBills?.sloComment == null
                        ? "-"
                        : eventBills?.sloComment}
                    </Box>
                  </Grid>
                </Grid>
              </>
            ) : null}
            {(userid === event?.clubid ||
              eventBills?.state !== "not_submitted") && (
              <Stack direction="row" spacing={2} sx={{ m: 2 }}>
                {userid === event?.clubid ? (
                  eventBills?.state === "not_submitted" ? (
                    <Button
                      component={ButtonLink}
                      href={`/manage/events/${event._id}/bills`}
                      variant="contained"
                      color="primary"
                      startIcon={<Icon variant="add" />}
                    >
                      Add New Bill
                    </Button>
                  ) : eventBills?.state === "rejected" ? (
                    <Button
                      component={ButtonLink}
                      href={`/manage/events/${event._id}/bills`}
                      variant="contained"
                      color="primary"
                      startIcon={<Icon variant="edit" />}
                    >
                      Edit Bill
                    </Button>
                  ) : null
                ) : null}
                {eventBills?.state !== "not_submitted" ? (
                  <FinanceHeader
                    id={event._id}
                    eventTitle={event.name}
                    filename={eventBills?.filename}
                    onlyButton={true}
                  />
                ) : null}
              </Stack>
            )}
          </>
        ) : null}
      </Grid>
    </>
  );
}
