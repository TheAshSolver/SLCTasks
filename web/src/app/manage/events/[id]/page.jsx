import { Link } from "next/link";
import { redirect } from "next/navigation";

import {
  Box,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_ACTIVE_CLUBS } from "gql/queries/clubs";
import { GET_EVENT_BILLS_STATUS } from "gql/queries/events";
import { GET_CLASHING_EVENTS } from "gql/queries/events";
import { GET_REPORTS_SUBMISSION_STATUS } from "gql/queries/events";

import ActionPalette from "components/ActionPalette";
import EventBillStatus from "components/events/bills/EventBillStatus";
import {
  ApproveEvent,
  CopyEvent,
  DeleteEvent,
  EditEvent,
  EditFinances,
  LocationClashApproval,
  ProgressEvent,
  RequestReminder,
  SubmitEvent,
} from "components/events/EventActions";
import EventApprovalStatus from "components/events/EventApprovalStatus";
import EventBudget from "components/events/EventBudget";
import EventDetails from "components/events/EventDetails";
import EventSponsor from "components/events/EventSponsor";
import {
  BudgetStatus,
  EventStatus,
  VenueStatus,
} from "components/events/EventStates";
import { DownloadEvent } from "components/events/report/EventpdfDownloads";
import EventReportStatus from "components/events/report/EventReportStatus";
import MemberListItem from "components/members/MemberListItem";
import { getFullEvent } from "utils/fetchData";
import { locationLabel } from "utils/formatEvent";

import { getFullUser } from "actions/users/get/full/server_action";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;

  const event = await getFullEvent(id);
  return {
    title: event.name,
    description: event.description || "No description provided.",
  };
}

export default async function ManageEventID(props) {
  const params = await props.params;
  const { id } = params;
  const event = await getFullEvent(id);

  let eventBillsData = null;

  if (
    event &&
    event?.status?.state === "approved" &&
    new Date(event?.datetimeperiod[1]) < new Date() &&
    event?.budget?.length
  ) {
    const { error, data = {} } = await getClient().query(
      GET_EVENT_BILLS_STATUS,
      {
        eventid: id,
      },
    );
    if (error && error.message.includes("Event not found"))
      return redirect("/404");
    eventBillsData = data;
  }

  const {
    data: { allClubs },
  } = await getClient().query(GET_ACTIVE_CLUBS);

  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );

  const user = { ...userMeta, ...userProfile };
  let clashFlag = false;
  if (["cc", "slo"].includes(user?.role)) {
    const { data: { clashingEvents } = {} } = await getClient().query(
      GET_CLASHING_EVENTS,
      {
        eventId: id,
        filterByLocation: true,
      },
    );
    clashFlag = clashingEvents && clashingEvents.length > 0;
  }

  const billViewable =
    ["cc", "slo"].includes(user?.role) ||
    (user?.role === "club" && user?.uid === event?.clubid);

  const pocProfile = await getFullUser(event?.poc);
  if (!pocProfile) {
    return redirect("/404");
  }

  const { data: { isEventReportsSubmitted } = {} } = await getClient().query(
    GET_REPORTS_SUBMISSION_STATUS,
    {
      clubid: userMeta?.role === "club" ? userMeta.uid : null,
    },
  );

  return (
    user?.role === "club" &&
      user?.uid !== event?.clubid &&
      !event?.collabclubs.includes(user?.uid) &&
      redirect("/404"),
    (
      <Box>
        <ActionPalette
          left={[EventStatus, BudgetStatus, VenueStatus]}
          leftProps={[
            { status: event?.status },
            { status: event?.status, budget: event?.budget },
            { status: event?.status, location: event?.location },
          ]}
          right={getActions(event, clashFlag, { ...userMeta, ...userProfile })}
          rightProps={[{ isReportSubmitted: isEventReportsSubmitted }]}
          downloadbtn={
            <DownloadEvent
              event={event}
              clubs={allClubs}
              pocProfile={pocProfile}
              eventBills={eventBillsData?.eventBills || {}}
            />
          }
        />
        <EventDetails showCode event={event} />
        <Divider sx={{ borderStyle: "dashed", my: 2 }} />
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{
            textTransform: "uppercase",
          }}
        >
          Point of Contact
        </Typography>
        <CardActionArea
          component={Link}
          href={`/profile/${event?.poc}`}
          sx={{ textDecoration: "none", maxWidth: "max-content" }}
        >
          <MemberListItem uid={event?.poc} />
        </CardActionArea>
        <Box
          sx={{
            my: 3,
          }}
        />
        <Grid container spacing={6}>
          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <Grid>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  textTransform: "uppercase",
                }}
              >
                Budget
              </Typography>
              {event?.budget?.length ? (
                <EventBudget
                  rows={event?.budget?.map((b, key) => ({
                    ...b,
                    id: b?.id || key,
                  }))} // add ID to each budget item if it doesn't exist (MUI requirement)
                  editable={false}
                  billViewable={billViewable}
                />
              ) : (
                <Box
                  sx={{
                    mt: 2,
                  }}
                >
                  None requested
                </Box>
              )}
            </Grid>

            <Grid sx={{ mt: 4 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  textTransform: "uppercase",
                }}
              >
                Sponsor
              </Typography>
              {event?.sponsor?.length ? (
                <EventSponsor
                  rows={event?.sponsor?.map((b, key) => ({
                    ...b,
                    id: b?.id || key,
                  }))}
                  editable={false}
                />
              ) : (
                <Box
                  sx={{
                    mt: 2,
                  }}
                >
                  Event has no sponsors
                </Box>
              )}
            </Grid>
          </Grid>

          <Grid
            size={{
              xs: "grow",
              lg: "grow",
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                textTransform: "uppercase",
              }}
            >
              Venue
            </Typography>

            {/* show requested location details, if any */}
            {event?.location?.length ? (
              <>
                <Box
                  sx={{
                    mt: 2,
                  }}
                >
                  {event?.location?.map((venue, key) => (
                    <Chip
                      key={key}
                      label={
                        venue === "other"
                          ? event.otherLocation || "Other"
                          : locationLabel(venue)?.name || "Unknown"
                      }
                      sx={{ mr: 1, mb: 1, p: 1 }}
                    />
                  ))}
                </Box>

                {event?.locationAlternate && event?.locationAlternate.length ? (
                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Typography variant="overline">
                      Alternate Locations
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                      }}
                    >
                      {event?.locationAlternate?.map((venue, key) => (
                        <Chip
                          key={key}
                          label={
                            venue === "other"
                              ? event.otherLocationAlternate || "Other"
                              : locationLabel(venue)?.name || "Unknown"
                          }
                          sx={{ mr: 1, mb: 1, p: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                ) : null}

                <Box
                  sx={{
                    mt: 2,
                  }}
                >
                  <Typography variant="overline">Equipment</Typography>
                  <Typography variant="body2">
                    {event?.equipment || "None"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                  }}
                >
                  <Typography variant="overline">
                    Additional Information
                  </Typography>
                  <Typography variant="body2">
                    {event?.additional || "None"}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  mt: 2,
                }}
              >
                None requested
              </Box>
            )}

            <Grid
              container
              spacing={2}
              sx={{
                mt: 0.1,
              }}
            >
              <Grid size={4}>
                <Box>
                  <Typography variant="overline">Population</Typography>
                  <Typography variant="body2">
                    {event?.population || 0}
                  </Typography>
                </Box>
              </Grid>
              {event?.externalPopulation && event.externalPopulation > 0 ? (
                <Grid size={4}>
                  <Box>
                    <Typography variant="overline">
                      External Population
                    </Typography>
                    <Typography variant="body2">
                      {event?.externalPopulation || 0}
                    </Typography>
                  </Box>
                </Grid>
              ) : null}
            </Grid>
          </Grid>
        </Grid>
        {/* show Approval status */}
        {EventApprovalStatus(event?.status, event?.clubCategory != "club")}
        {/* show post event information */}
        {["cc", "club", "slo"].includes(user?.role) &&
          EventBillStatus(event, eventBillsData?.eventBills || null, user?.uid)}
        {["cc", "club", "slo"].includes(user?.role) &&
          EventReportStatus(event, user)}
      </Box>
    )
  );
}

// set conditional actions based on event datetime, current status and user role
function getActions(event, clashFlag, user) {
  const upcoming = new Date(event?.datetimeperiod[0]) >= new Date();
  /*
   * Deleted Event
   * CC/Club - copy
   * else - nothing
   */
  if (event?.status?.state === "deleted") {
    if (["club", "cc"].includes(user?.role)) return [CopyEvent];
    else return [];
  }

  /*
   * Club - incomplete event - edit, submit, delete
   * Club - upcoming event - edit, delete, copy
   * Club - past event - edit, copy
   */
  if (user?.role === "club") {
    if (user?.uid !== event?.clubid) return [CopyEvent];
    else if (event?.status?.state === "incomplete")
      return [SubmitEvent, EditEvent, DeleteEvent];
    else if (upcoming) return [EditEvent, DeleteEvent, CopyEvent];
    else return [EditEvent, CopyEvent];
  }

  /*
   * CC - pending approval - progress, edit, delete
   * CC - not incomplete event - delete, edit, copy
   * CC - incomplete event - edit
   */
  if (user?.role === "cc") {
    if (event?.status?.state === "pending_cc")
      return [ProgressEvent, EditEvent, DeleteEvent];
    else if (event?.status?.state === "pending_room")
      return [RequestReminder, EditEvent, DeleteEvent];
    else if (event?.status?.state !== "incomplete")
      return [EditEvent, DeleteEvent, CopyEvent];
    else return [EditEvent];
  }

  /*
   * SLC - upcoming event - approve
   */
  if (user?.role === "slc") {
    if (
      // upcoming &&
      event?.status?.state === "pending_budget" &&
      !event?.status?.budget
    ) {
      return [ApproveEvent];
    } else return [];
  }

  /*
   * SLO - upcoming event - approve, edit, delete
   * SLO - approved event - delete
   */
  if (user?.role === "slo") {
    if (
      // upcoming &&
      event?.status?.state === "pending_room" &&
      (event?.status?.budget || event?.clubCategory == "body") &&
      !event?.status?.room
    ) {
      if (clashFlag) return [LocationClashApproval, EditEvent, DeleteEvent];
      return [ApproveEvent, EditEvent, DeleteEvent];
    } else if (
      event?.status?.state === "approved" &&
      !upcoming &&
      event?.budget?.length
    )
      return [EditFinances, DeleteEvent];
    else return [EditEvent, DeleteEvent];
  }

  /*
   * else - nothing
   */
  return [];
}
