"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import dayjs, { isDayjs } from "dayjs";
import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import { Controller, useController, useForm, useWatch } from "react-hook-form";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import { DateTimePicker } from "@mui/x-date-pickers";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import { useAuth } from "components/AuthProvider";
import ConfirmDialog from "components/ConfirmDialog";
import EventBudget from "components/events/EventBudget";
import EventsDialog from "components/events/EventsDialog";
import EventSponsor from "components/events/EventSponsor";
import FileUpload from "components/FileUpload";
import MemberListItem from "components/members/MemberListItem";
import { useToast } from "components/Toast";
import { uploadImageFile } from "utils/files";
import { locationLabel } from "utils/formatEvent";

import { getActiveClubIds } from "actions/clubs/ids/server_action";
import { createEventAction } from "actions/events/create/server_action";
import { editEventAction } from "actions/events/edit/server_action";
import { eventProgress } from "actions/events/progress/server_action";
import { eventsVenues } from "actions/events/venues/server_action";
import { currentMembersAction } from "actions/members/current/server_action";
import { getFullUser } from "actions/users/get/full/server_action";
import { saveUserPhone } from "actions/users/save/phone/server_action";
import { audienceMap } from "constants/events";

const admin_roles = ["cc", "slo"];
const clubsAddPastEvents = true; // whether clubs can add past events - only for special cases (default: false)

const poster_maxSizeMB = 10;
const poster_warnSizeMB = 1;

export default function EventForm({
  id = null,
  defaultValues = {},
  action = "log",
  existingEvents = [],
  isReportSubmitted = true,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [mobileDialog, setMobileDialog] = useState(isMobile);
  const [budgetEditing, setBudgetEditing] = useState(false);
  const [sponsorEditing, setSponsorEditing] = useState(false);
  const [hasPhone, setHasPhone] = useState(true);
  const [reportConfirmOpen, setReportConfirmOpen] = useState(false);

  const { triggerToast } = useToast();
  // fetch list of clubs
  const [clubs, setClubs] = useState([]);
  useEffect(() => {
    (async () => {
      let res = await getActiveClubIds();
      if (!res.ok) {
        triggerToast({
          title: "Unable to fetch clubs",
          messages: res.error.messages,
          severity: "error",
        });
      } else {
        setClubs(res.data);
      }
    })();
  }, []);

  const { control, handleSubmit, watch, setValue } = useForm({
    mode: "onChange",
    defaultValues,
  });
  const collabEvent = watch("collabEvent");
  const haveSponsor = watch("haveSponsor");

  // different form submission handlers
  const submitHandlers = {
    log: console.log,
    create: async (data, opts) => {
      let res = await createEventAction(data);

      if (res.ok) {
        // also submit event if requested
        if (opts?.shouldSubmit) {
          let submit_res = await eventProgress({
            eventid: res.data._id,
          });

          if (submit_res.ok) {
            triggerToast({
              title: "Success!",
              messages: ["Event created and submitted for approval."],
              severity: "success",
            });
            router.push("/manage/events");
          } else {
            // show error toast
            triggerToast({
              ...submit_res.error,
              severity: "error",
            });
            setLoading(false);
          }

          return;
        }

        // else show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages:
            user?.role === "cc"
              ? ["Event created."]
              : ["Event created & saved as draft."],
          severity: "success",
        });
        router.push(`/manage/events/${res.data._id}`);
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
        setLoading(false);
      }
    },
    edit: async (data, opts) => {
      let res = await editEventAction(data, id);

      if (res.ok) {
        // also submit event if requested
        if (opts?.shouldSubmit) {
          let submit_res = await eventProgress({
            eventid: res.data._id,
          });

          if (submit_res.ok) {
            triggerToast({
              title: "Success!",
              messages: ["Event edited and submitted for approval."],
              severity: "success",
            });
            router.push("/manage/events");
          } else {
            // show error toast
            triggerToast({
              ...submit_res.error,
              severity: "error",
            });
            setLoading(false);
          }

          return;
        }

        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Event edited."],
          severity: "success",
        });
        router.push(`/manage/events/${res.data._id}`);
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
        setLoading(false);
      }
    },
    phone: async (data) => {
      let res = await saveUserPhone(data);

      if (!res.ok) {
        // show error toast
        triggerToast({
          ...res.error,
          title: "Form Error",
          severity: "error",
        });

        return false;
      }

      return true;
    },
  };

  async function onSubmit(formData, opts) {
    setLoading(true);

    let location = formData.mode === "online" ? null : formData.location;
    let otherLocation = null;
    if (
      Array.isArray(formData.location) &&
      formData.location.includes("other")
    ) {
      otherLocation = formData.otherLocation;
    }

    let locationAlternate =
      formData.mode === "online" ? null : formData.locationAlternate;
    let otherLocationAlternate = null;
    if (
      Array.isArray(formData.locationAlternate) &&
      formData.locationAlternate.includes("other")
    ) {
      otherLocationAlternate = formData.otherLocationAlternate;
    }

    const data = {
      name: formData.name,
      description: formData.description,
      audience: formData.audience,
      mode: formData.mode,
      link: formData.link,
      location,
      otherLocation,
      locationAlternate,
      otherLocationAlternate,
      population: parseInt(formData.population),
      externalPopulation: parseInt(formData.externalPopulation),
      additional: formData.additional,
      equipment: formData.equipment,
      poc: formData.poc,
    };

    data.collabclubs = collabEvent ? formData.collabclubs : [];
    data.collabclubs = data.collabclubs.filter(
      (cid) => cid && cid !== data.clubid,
    );

    // set club ID for event based on user role
    if (user?.role === "club") {
      data.clubid = user?.uid;
    } else if (admin_roles.includes(user?.role)) {
      data.clubid = formData.clubid;
    }

    // upload poster
    const poster_filename = ("poster_" + data.name + "_" + data.clubid).replace(
      ".",
      "_",
    );
    try {
      if (typeof formData.poster === "string") {
        data.poster = formData.poster;
      } else if (Array.isArray(formData.poster) && formData.poster.length > 0) {
        data.poster = await uploadImageFile(
          formData.poster[0],
          poster_filename,
          poster_warnSizeMB,
        );
      } else {
        data.poster = null;
      }
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error.message
          ? [error.message]
          : error?.messages || ["Failed to upload poster"],
        severity: "error",
      });
    }

    // convert dates to ISO strings
    data.datetimeperiod = formData.datetimeperiod.map((d) =>
      new Date(d).toISOString(),
    );

    // convert budget to array of objects with only required attributes
    // remove budget items without a description (they're invalid)
    data.budget = formData.budget
      .filter((i) => i?.description)
      .filter((i) => i?.amount > 0)
      .map((i) => ({
        description: i.description,
        amount: i.amount,
        advance: i.advance,
      }));

    // Check if description increases the character limit
    if (data.budget.some((i) => i.description.length > 250)) {
      triggerToast({
        title: "Character Limit Exceeded!",
        messages: ["Please keep budget description below 250 characters"],
        severity: "error",
      });
      setLoading(false);
      return;
    }

    data.sponsor = formData.sponsor
      .filter((i) => i?.name)
      .filter((i) => i?.amount >= 0)
      .map((i) => ({
        name: i.name,
        comment: i.comment,
        amount: i.amount,
        previouslySponsored: i.previouslySponsored,
      }));

    // Check if description increases the character limit
    if (data.sponsor.some((i) => i.comment?.length > 200)) {
      triggerToast({
        title: "Character Limit Exceeded!",
        messages: ["Please keep sponsor comment below 200 characters"],
        severity: "error",
      });
      setLoading(false);
      return;
    }

    // TODO: fix event link field
    data.link = null;

    // set POC phone number
    if (!hasPhone && formData.poc_phone) {
      const phoneData = {
        uid: formData.poc,
        phone: formData.poc_phone,
      };
      let phoneReturn = await submitHandlers["phone"](phoneData);
      if (!phoneReturn) {
        setLoading(false);
        return;
      }
    }

    const isSubmit = opts?.shouldSubmit === true;

    if (isSubmit && user?.role === "club" && isReportSubmitted === false) {
      setReportConfirmOpen(true);
      setLoading(false);
      return;
    }

    // mutate
    submitHandlers[action](data, opts);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid
        container
        spacing={4}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Grid
          container
          spacing={2}
          size={{
            xs: 12,
            md: 7,
            xl: 8,
          }}
        >
          <Grid container>
            <Grid
              container
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  textTransform: "uppercase",
                  color: "text.secondary",
                  alignSelf: "center",
                  mb: 0,
                }}
              >
                Details
              </Typography>
              <FormControlLabel
                control={
                  <Controller
                    name="collabEvent"
                    control={control}
                    defaultValue={
                      defaultValues.collabclubs &&
                      defaultValues.collabclubs.length
                        ? true
                        : false
                    }
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        disabled={
                          !admin_roles.includes(user?.role) &&
                          defaultValues?.status?.state != undefined &&
                          defaultValues?.status?.state != "incomplete"
                        }
                        onChange={(e) => field.onChange(e?.target.checked)}
                        inputProps={{ "aria-label": "controlled" }}
                        sx={{ margin: "auto" }}
                      />
                    )}
                  />
                }
                label="Collaboration Event"
              />
            </Grid>
            <Grid container spacing={2}>
              {admin_roles.includes(user?.role) ? (
                <Grid size={12}>
                  <EventClubSelect
                    control={control}
                    disabled={
                      user?.role != "cc" &&
                      defaultValues?.status?.state != undefined &&
                      defaultValues?.status?.state != "incomplete"
                    }
                    clubs={clubs}
                  />
                </Grid>
              ) : null}
              {collabEvent ? (
                <Grid size={12}>
                  <EventCollabClubSelect
                    control={control}
                    disabled={
                      !admin_roles.includes(user?.role) &&
                      defaultValues?.status?.state != undefined &&
                      defaultValues?.status?.state != "incomplete"
                    }
                    defaultValue={defaultValues.collabclubs}
                    clubs={clubs}
                  />
                </Grid>
              ) : null}
              <Grid size={12}>
                <EventNameInput
                  control={control}
                  disabled={
                    !admin_roles.includes(user?.role) &&
                    defaultValues?.status?.state != undefined &&
                    defaultValues?.status?.state != "incomplete"
                  }
                />
              </Grid>
              <Grid size={12}>
                <EventDatetimeInput
                  control={control}
                  setValue={setValue}
                  disabled={
                    !admin_roles.includes(user?.role) &&
                    defaultValues?.status?.state != undefined &&
                    defaultValues?.status?.state != "incomplete"
                  }
                  role={user?.role}
                  existingEvents={existingEvents}
                  clubs={clubs}
                />
              </Grid>
              <Grid size={12}>
                <EventAudienceSelect control={control} />
              </Grid>
              <Grid size={12}>
                <EventDescriptionInput control={control} />
              </Grid>
              {user?.role === "club" ? (
                <Grid size={12}>
                  <EventPOC
                    control={control}
                    cid={user?.uid}
                    hasPhone={hasPhone}
                    setHasPhone={setHasPhone}
                    disabled={
                      defaultValues?.status?.state == "approved" &&
                      defaultValues?.datetimeperiod[0] &&
                      new Date(defaultValues?.datetimeperiod[0]) < new Date()
                    }
                  />
                </Grid>
              ) : user?.role === "cc" ? (
                <Grid size={12}>
                  <EventPOC
                    control={control}
                    cid={watch("clubid")}
                    hasPhone={hasPhone}
                    setHasPhone={setHasPhone}
                  />
                </Grid>
              ) : null}
              {/*
              <Grid xs={12}>
                <EventLinkInput control={control} />
              </Grid>
              */}
            </Grid>
          </Grid>
          <Grid sx={{ width: "100%" }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                color: "text.secondary",
                mb: 2,
              }}
            >
              Budget
            </Typography>
            <EventBudgetTable
              control={control}
              disabled={
                !admin_roles.includes(user?.role) &&
                defaultValues?.status?.state != undefined &&
                defaultValues?.status?.state != "incomplete"
              }
              setBudgetEditing={setBudgetEditing}
            />
          </Grid>
          <Grid sx={{ width: "100%" }}>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Controller
                    name="haveSponsor"
                    control={control}
                    defaultValue={
                      defaultValues?.sponsor &&
                      defaultValues?.sponsor?.length > 0
                    }
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e?.target?.checked)}
                        disabled={
                          !admin_roles.includes(user?.role) &&
                          defaultValues?.status?.state != undefined &&
                          defaultValues?.status?.state != "incomplete"
                        }
                        sx={{ m: 2 }}
                      />
                    )}
                  />
                }
                label="Does event have any Sponsors?"
              />
            </Grid>
            <Grid size={12}>
              {haveSponsor ? (
                <EventSponsorTable
                  control={control}
                  disabled={
                    !admin_roles.includes(user?.role) &&
                    defaultValues?.status?.state != undefined &&
                    defaultValues?.status?.state != "incomplete"
                  }
                  setSponsorEditing={setSponsorEditing}
                />
              ) : null}
            </Grid>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={3}
          sx={{
            alignItems: "flex-start",
          }}
          size={{
            xs: "grow",
            md: "grow",
          }}
        >
          <Grid container>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Venue
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <EventVenueInput
                  control={control}
                  defaultValues={defaultValues}
                  disabled={
                    !admin_roles.includes(user?.role) &&
                    defaultValues?.status?.state != undefined &&
                    defaultValues?.status?.state != "incomplete"
                  }
                  eventid={defaultValues?._id}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid container>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Media
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FileUpload
                  type="image"
                  name="poster"
                  label="Poster"
                  control={control}
                  maxFiles={1}
                  maxSizeMB={poster_maxSizeMB}
                  shape="square"
                  warnSizeMB={poster_warnSizeMB}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            spacing={1}
            sx={{
              pt: 3,
            }}
            size={12}
          >
            <Grid size={6}>
              <Button
                size="large"
                variant="outlined"
                color="primary"
                fullWidth
                disabled={loading}
                onClick={() => setCancelDialog(true)}
              >
                Cancel
              </Button>

              <ConfirmDialog
                open={cancelDialog}
                title="Confirm cancellation"
                description="Are you sure you want to cancel? Any unsaved changes will be lost."
                onConfirm={() => router.back()}
                onClose={() => setCancelDialog(false)}
                confirmProps={{ color: "primary" }}
                confirmText="Yes, discard my changes"
              />
            </Grid>
            <Grid size={6}>
              <SubmitButton
                mode="draft"
                loading={loading}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                defaultValues={defaultValues}
                user={user}
                disabled={budgetEditing || sponsorEditing}
                admin_roles={admin_roles}
              />
            </Grid>
            <Grid size={12}>
              <SubmitButton
                mode="submit"
                loading={loading}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                defaultValues={defaultValues}
                user={user}
                disabled={budgetEditing || sponsorEditing}
                admin_roles={admin_roles}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={mobileDialog}
        title="Mobile View"
        description="This form is not optimized for mobile view. Please use a desktop device for better experience."
        onConfirm={() => router.back()}
        onClose={() => setMobileDialog(false)}
        confirmProps={{ color: "primary" }}
        confirmText="Go Back"
        cancelText="Continue"
      />
      <ConfirmDialog
        open={reportConfirmOpen}
        title="Previous report not submitted"
        description="You haven't submitted the previous event report. Do you want to save this event as a draft instead?"
        confirmText="Save as Draft"
        cancelText="Cancel"
        confirmProps={{ color: "primary" }}
        onConfirm={() => {
          setReportConfirmOpen(false);

          // save as draft
          handleSubmit((data) => onSubmit(data))();
        }}
        onClose={() => {
          setReportConfirmOpen(false);
        }}
      />
    </form>
  );
}

function SubmitButton({
  mode = "draft", // "draft" or "submit"
  loading,
  handleSubmit,
  onSubmit,
  defaultValues = {},
  user = {},
  disabled = true,
  admin_roles = [],
}) {
  const privileged =
    admin_roles.includes(user?.role) ||
    (user?.role === "club" &&
      defaultValues?.status?.state !== undefined &&
      defaultValues?.status?.state !== "incomplete");

  // hide "Save & Submit" for privileged users (matches original logic)
  if (mode === "submit" && privileged) return null;

  const tooltipText = disabled
    ? "Cannot save while editing budget or sponsor details"
    : "";

  const label =
    mode === "submit" ? "Save & Submit" : privileged ? "Save" : "Save as draft";

  const variant =
    mode === "submit" ? "contained" : privileged ? "contained" : "outlined";

  return (
    <Tooltip title={tooltipText} disableHoverListener={!tooltipText}>
      <span>
        <Button
          loading={loading}
          type={mode === "draft" ? "submit" : undefined}
          onClick={
            mode === "submit"
              ? () =>
                  handleSubmit((data) =>
                    onSubmit(data, { shouldSubmit: true }),
                  )()
              : undefined
          }
          size="large"
          variant={variant}
          color="primary"
          fullWidth
          disabled={disabled}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
}

// select club to which event belongs to
function EventClubSelect({ control, disabled = true, clubs = [] }) {
  return (
    <Controller
      name="clubid"
      control={control}
      rules={{ required: "Select a club!" }}
      render={({ field, fieldState: { error, invalid } }) => (
        <FormControl fullWidth error={invalid}>
          <InputLabel id="clubid">Club *</InputLabel>
          <Select
            labelId="clubid"
            label="clubid *"
            fullWidth
            disabled={disabled}
            {...field}
          >
            {clubs
              ?.slice()
              ?.sort((a, b) => a.name.localeCompare(b.name))
              ?.map((club) => (
                <MenuItem key={club.cid} value={club.cid}>
                  {club.name}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

function EventCollabClubSelect({
  control,
  defaultValue,
  disabled = true,
  clubs = [],
}) {
  const selectedClub = useWatch({
    control,
    name: "clubid",
  });
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name="collabclubs"
      control={control}
      defaultValue={defaultValue}
      rules={{ required: "Select at least one collaborating club!" }}
      render={({ field, fieldState: { error, invalid } }) => (
        <FormControl fullWidth error={invalid}>
          <InputLabel id="collabclubs">Collaborating Clubs *</InputLabel>
          <Select
            labelId="collabclubs"
            label="Collaborating Clubs *"
            fullWidth
            multiple
            disabled={disabled}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            input={<OutlinedInput label="Collaborating Clubs *" />}
            value={field.value || []}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.filter(Boolean).map((value) => (
                  <Chip
                    key={value}
                    label={clubs.find((club) => club.cid === value)?.name}
                  />
                ))}
              </Box>
            )}
            {...field}
          >
            {/* Close button positioned in the top right corner */}
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{
                position: "sticky",
                top: 8,
                right: 8,
                zIndex: 1,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(4px)",
                "&:hover": {
                  background: "rgba(230, 230, 230, 0.7)",
                },
                float: "right", // Ensures it stays to the right
              }}
            >
              <CloseIcon />
            </IconButton>

            {clubs
              ?.slice()
              ?.sort((a, b) => a.name.localeCompare(b.name))
              ?.filter((club) => club.cid !== selectedClub)
              ?.map((club) => (
                <MenuItem key={club.cid} value={club.cid}>
                  {club.name}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

// event name input
function EventNameInput({ control, disabled = true }) {
  return (
    <Controller
      name="name"
      control={control}
      rules={{
        minLength: {
          value: 5,
          message: "Event name must be at least 5 characters long!",
        },
        maxLength: {
          value: 150,
          message: "Event name must be at most 150 characters long!",
        },
        required: "Event name is required!",
      }}
      render={({ field, fieldState: { error, invalid } }) => (
        <TextField
          {...field}
          label="Name"
          autoComplete="off"
          error={invalid}
          helperText={error?.message}
          variant="outlined"
          fullWidth
          required
          disabled={disabled}
          onBlur={(e) => {
            field.onChange(e?.target?.value.trim());
          }}
        />
      )}
    />
  );
}

function filterEvents(events, startTime, endTime) {
  let filteredEvents = events.filter((event) => {
    const eventStart = new Date(event.datetimeperiod[0]);
    const eventEnd = new Date(event.datetimeperiod[1]);

    return (
      (startTime >= eventStart && startTime < eventEnd) ||
      (endTime > eventStart && endTime <= eventEnd) ||
      (startTime <= eventStart && endTime >= eventEnd)
    );
  });

  if (filteredEvents.length) return filteredEvents;
  return null;
}

// event datetime range input
function EventDatetimeInput({
  control,
  setValue,
  disabled = true,
  role = "public",
  existingEvents = [],
  clubs = [],
}) {
  const [startDateInput, endDateInput] = useWatch({
    control,
    name: ["datetimeperiod.0", "datetimeperiod.1"],
  });
  const [error, setError] = useState(null);
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);

  const errorMessage = useMemo(() => {
    switch (error) {
      case "minDate": {
        return "An event can not end before it starts!";
      }
      case "invalidDate": {
        return "Invalid date!";
      }
      default: {
        return "";
      }
    }
  }, [error]);

  useEffect(() => {
    if (
      startDateInput &&
      endDateInput &&
      dayjs(startDateInput).isAfter(dayjs(endDateInput))
    )
      setValue("datetimeperiod.1", null);
  }, [startDateInput]);

  const resetLocations = () => {
    setValue("location", []);
    setValue("locationAlternate", []);
  };

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          md: 6,
          xl: 4,
        }}
      >
        <Controller
          name="datetimeperiod.0"
          control={control}
          rules={{
            required: "Start date is required!",
            validate: {
              minDateCheck: (value) =>
                clubsAddPastEvents ||
                admin_roles.includes(role) ||
                disabled ||
                dayjs(value) >= dayjs(new Date()) ||
                "Start Date must not be in past!",
            },
          }}
          render={({
            field: { value, onChange, ...rest },
            fieldState: { error, invalid },
          }) => (
            <DateTimePicker
              label="Starts *"
              slotProps={{
                textField: {
                  error: invalid,
                  helperText: error?.message,
                },
              }}
              disablePast={!(clubsAddPastEvents || admin_roles.includes(role))}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              sx={{ width: "100%" }}
              value={
                value instanceof Date && !isDayjs(value) ? dayjs(value) : value
              }
              onChange={(newValue) => {
                onChange(newValue);
                resetLocations();
              }}
              disabled={disabled}
              format="DD/MM/YYYY hh:mm A"
              {...rest}
            />
          )}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
          xl: 4,
        }}
      >
        <Controller
          name="datetimeperiod.1"
          control={control}
          rules={{
            required: "End date is required!",
            validate: {
              checkDate: (value) => {
                return (
                  dayjs(value) >= dayjs(startDateInput) ||
                  "Event must end after it starts!"
                );
              },
            },
          }}
          render={({
            field: { value, onChange, ...rest },
            fieldState: { error, invalid },
          }) => (
            <DateTimePicker
              label="Ends *"
              minDateTime={
                startDateInput
                  ? (startDateInput instanceof Date && !isDayjs(startDateInput)
                      ? dayjs(startDateInput)
                      : startDateInput
                    ).add(1, "minute")
                  : null
              }
              disablePast={!(clubsAddPastEvents || admin_roles.includes(role))}
              onError={(error) => setError(error)}
              slotProps={{
                textField: {
                  error: errorMessage || invalid,
                  helperText: errorMessage || error?.message,
                },
              }}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              sx={{ width: "100%" }}
              value={
                value instanceof Date && !isDayjs(value) ? dayjs(value) : value
              }
              onChange={(newValue) => {
                onChange(newValue);
                resetLocations();
              }}
              disabled={!startDateInput || disabled}
              format="DD/MM/YYYY hh:mm A"
              {...rest}
            />
          )}
        />
      </Grid>
      {startDateInput && endDateInput ? (
        <>
          {existingEvents?.length ? (
            filterEvents(existingEvents, startDateInput, endDateInput) ? (
              <Grid
                size={{
                  xs: 8,
                  xl: 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<InfoIcon />}
                    onClick={() => setEventsDialogOpen(true)}
                  >
                    Clashing Events
                  </Button>
                </Box>

                <EventsDialog
                  open={eventsDialogOpen}
                  onClose={() => setEventsDialogOpen(false)}
                  events={filterEvents(
                    existingEvents,
                    startDateInput,
                    endDateInput,
                  )}
                  clubs={clubs}
                />
              </Grid>
            ) : null
          ) : null}
        </>
      ) : null}
    </Grid>
  );
}

// event audience selector
function EventAudienceSelect({ control }) {
  const { field } = useController({
    name: "audience",
    control,
  });

  const handleChange = (event, newValue) => {
    if (field.value.includes("internal")) {
      const index = newValue.indexOf("internal");
      if (index > -1) newValue.splice(index, 1);
      field.onChange(newValue);
    } else if (
      !field.value.includes("internal") &&
      newValue.includes("internal")
    ) {
      field.onChange(["internal"]);
    } else {
      field.onChange(newValue);
    }
  };
  return (
    <Box>
      <InputLabel shrink>Audience</InputLabel>
      <ToggleButtonGroup
        {...field}
        color="primary"
        onChange={(u, v) => handleChange(u, v)}
        sx={{ display: "flex", flexWrap: "wrap" }}
      >
        {Object.keys(audienceMap).map((key) => (
          <ToggleButton disableRipple key={key} value={key}>
            {audienceMap[key]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

// event description input
function EventDescriptionInput({ control }) {
  return (
    <Controller
      name="description"
      control={control}
      rules={{
        maxLength: {
          value: 4000,
          message: "Event description must be at most 4000 characters long!",
        },
      }}
      render={({ field, fieldState: { error, invalid } }) => (
        <TextField
          {...field}
          label="Description"
          autoComplete="off"
          error={invalid}
          helperText={error?.message}
          variant="outlined"
          rows={8}
          fullWidth
          multiline
          onBlur={(e) => {
            field.onChange(
              e?.target?.value.replace(/^[\s\n\t]+|[\s\n\t]+$/g, ""),
            );
          }}
        />
      )}
    />
  );
}

// // event link input
// function EventLinkInput({ control }) {
//   return (
//     <Controller
//       name="link"
//       control={control}
//       rules={{}}
//       render={({ field, fieldState: { error, invalid } }) => (
//         <TextField
//           {...field}
//           label="Link"
//           autoComplete="off"
//           error={invalid}
//           helperText={
//             error?.message ||
//             "Link to event page or registration form (if applicable)"
//           }
//           variant="outlined"
//           fullWidth
//         />
//       )}
//     />
//   );
// }

// conditional event venue selector
function EventVenueInput({
  control,
  defaultValues,
  disabled = true,
  eventid = null,
}) {
  const [
    modeInput,
    locationInput,
    startDateInput,
    endDateInput,
    externalAllowed,
  ] = useWatch({
    control,
    name: [
      "mode",
      "location",
      "datetimeperiod.0",
      "datetimeperiod.1",
      "externalAllowed",
    ],
  });

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Controller
          name="mode"
          control={control}
          render={({ field }) => (
            <Box>
              <InputLabel shrink>Mode</InputLabel>
              <ToggleButtonGroup
                {...field}
                exclusive
                color="primary"
                disabled={disabled}
              >
                <ToggleButton disableRipple key={0} value="online">
                  Online
                </ToggleButton>
                <ToggleButton disableRipple key={1} value="hybrid">
                  Hybrid
                </ToggleButton>
                <ToggleButton disableRipple key={2} value="offline">
                  Offline
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        />
      </Grid>
      {/* show venue selector if event is hybrid or offline*/}
      <Grid size={12}>
        {["hybrid", "offline"].includes(modeInput) ? (
          // show venue selector if start and end dates are set
          startDateInput && endDateInput ? (
            <EventLocationInput
              control={control}
              startDateInput={startDateInput}
              endDateInput={endDateInput}
              disabled={disabled}
              eventid={eventid}
            />
          ) : (
            <FormHelperText>
              Enter start and end dates to get available venues
            </FormHelperText>
          )
        ) : null}
      </Grid>
      <Grid size={12}>
        <Controller
          name="population"
          control={control}
          rules={{
            required: "Participation count is required.",
            min: {
              value: 1,
              message: "Expected participation count must be at least 1.",
            },
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <TextField
              type="number"
              label="Expected Participation*"
              error={invalid}
              helperText={error?.message}
              autoComplete="off"
              variant="outlined"
              fullWidth
              disabled={false}
              {...field}
              slotProps={{
                input: {
                  inputProps: { min: 1 },
                },
              }}
            />
          )}
        />
      </Grid>
      <FormControlLabel
        control={
          <Controller
            name="externalAllowed"
            control={control}
            defaultValue={
              defaultValues.externalPopulation &&
              defaultValues.externalPopulation > 0
            }
            render={({ field }) => (
              <Switch
                checked={field.value || false}
                onChange={(e) => field.onChange(e?.target?.checked)}
                sx={{ m: 1 }}
              />
            )}
          />
        }
        label="External Participants (Non-IIIT)"
      />
      {externalAllowed ? (
        <Grid size={12}>
          <Controller
            name="externalPopulation"
            control={control}
            rules={{
              required: "External participation count is required if enabled.",
              min: {
                value: 1,
                message:
                  "External participation count must be at least 1 if enabled.",
              },
              validate: (value, formValues) => {
                const population = formValues.population;
                const externalPopulationValue = Number(value);
                const populationValue = Number(population);

                if (externalPopulationValue > populationValue) {
                  return "External participation count must be less than total participants.";
                }
                return true;
              },
            }}
            defaultValue={defaultValues.externalPopulation || 0}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                type="number"
                label="Expected External Participation*"
                error={invalid}
                helperText={error?.message}
                autoComplete="off"
                variant="outlined"
                fullWidth
                disabled={false}
                {...field}
                slotProps={{
                  input: {
                    inputProps: { min: 1 },
                  },
                }}
              />
            )}
          />
        </Grid>
      ) : null}
      {/* show location details input if venue is requested */}
      {locationInput?.length ? (
        <>
          <Grid size={12}>
            <Controller
              name="equipment"
              control={control}
              rules={{
                maxLength: {
                  value: 800,
                  message:
                    "Equipment field must be at most 800 characters long!",
                },
              }}
              render={({ field, fieldState: { error, invalid } }) => (
                <TextField
                  {...field}
                  label="Equipment Required (if any)"
                  autoComplete="off"
                  error={invalid}
                  helperText={error?.message}
                  variant="outlined"
                  rows={4}
                  fullWidth
                  multiline
                  disabled={false}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name="additional"
              control={control}
              rules={{
                maxLength: {
                  value: 800,
                  message:
                    "Additional field must be at most 800 characters long!",
                },
              }}
              render={({ field, fieldState: { error, invalid } }) => (
                <TextField
                  {...field}
                  label="Additional Requests (if any)"
                  autoComplete="off"
                  error={invalid}
                  helperText={error?.message}
                  variant="outlined"
                  rows={4}
                  fullWidth
                  multiline
                  disabled={false}
                />
              )}
            />
          </Grid>
        </>
      ) : null}
    </Grid>
  );
}

// select location from available rooms
function EventLocationInput({
  control,
  startDateInput,
  endDateInput,
  disabled = true,
  eventid = null,
}) {
  const { triggerToast } = useToast();
  const [locationInput, locationAlternateInput] = useWatch({
    control,
    name: ["location", "locationAlternate"],
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  useEffect(() => {
    if (!(startDateInput && endDateInput)) return;

    if (new Date(startDateInput) > new Date(endDateInput)) {
      setAvailableRooms([]);
      return;
    }

    (async () => {
      let res = await eventsVenues({
        startDate: new Date(startDateInput).toISOString(),
        endDate: new Date(endDateInput).toISOString(),
        eventid: eventid,
      });
      if (!res.ok) {
        triggerToast({
          title: "Unable to fetch available rooms",
          messages: res.error.messages,
          severity: "error",
        });
      } else {
        let rooms = res.data || [];
        if (!rooms.some((r) => r.location === "other")) {
          rooms.push({ location: "other", available: true });
        } else {
          rooms = rooms.map((r) =>
            r.location === "other" ? { ...r, available: true } : r,
          );
        }
        setAvailableRooms(rooms);
      }
    })();
  }, [startDateInput, endDateInput]);

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Controller
          name="location"
          control={control}
          defaultValue={[]}
          rules={{ required: "Select at least one location!" }}
          render={({ field, fieldState: { error, invalid } }) => (
            <FormControl fullWidth error={invalid}>
              <InputLabel id="locationSelect">Location *</InputLabel>
              <Select
                multiple
                id="location"
                labelId="locationSelect"
                disabled={
                  !(startDateInput && endDateInput) ||
                  disabled ||
                  !availableRooms?.length
                }
                input={<OutlinedInput label="Location *" />}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {selected.map((value) => (
                      <Chip key={value} label={locationLabel(value)?.name} />
                    ))}
                  </Box>
                )}
                {...field}
              >
                {availableRooms
                  ?.slice()
                  ?.sort()
                  ?.map((location) => (
                    <MenuItem
                      key={location?.location}
                      value={location?.location}
                      disabled={
                        location?.location !== "other" &&
                        (locationAlternateInput?.includes(location?.location) ||
                          !location?.available)
                      }
                    >
                      {locationLabel(location?.location)?.name}
                      {location?.location !== "other" &&
                        locationAlternateInput?.includes(
                          location?.location,
                        ) && (
                          <span style={{ marginLeft: "8px", color: "#999" }}>
                            (already selected)
                          </span>
                        )}
                      {!location?.available && (
                        <span style={{ marginLeft: "8px", color: "#f00" }}>
                          (not available)
                        </span>
                      )}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText>{error?.message}</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>
      {Array.isArray(locationInput) && locationInput.includes("other") && (
        <Grid size={12}>
          <Controller
            name="otherLocation"
            control={control}
            rules={{
              validate: (value) =>
                locationInput.includes("other") && !value
                  ? "Please specify the 'other' location."
                  : true,
            }}
            defaultValue=""
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                label="Other Location"
                variant="outlined"
                value={field.value ?? ""}
                fullWidth
                error={invalid}
                helperText={error?.message}
                required
                disabled={disabled}
              />
            )}
          />
        </Grid>
      )}
      <Grid size={12}>
        <Controller
          name="locationAlternate"
          control={control}
          defaultValue={[]}
          render={({ field, fieldState: { error, invalid } }) => (
            <FormControl fullWidth error={invalid}>
              <InputLabel id="locationAlternateSelect">
                Alternate Location
              </InputLabel>
              <Select
                multiple
                id="locationAlternate"
                labelId="locationAlternateSelect"
                disabled={
                  !(startDateInput && endDateInput) ||
                  disabled ||
                  !availableRooms?.length
                }
                input={<OutlinedInput label="Alternate Location" />}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {selected.map((value) => (
                      <Chip key={value} label={locationLabel(value)?.name} />
                    ))}
                  </Box>
                )}
                {...field}
              >
                {availableRooms
                  ?.slice()
                  ?.sort()
                  ?.map((location) => (
                    <MenuItem
                      key={location?.location}
                      value={location?.location}
                      disabled={
                        location?.location !== "other" &&
                        (locationInput?.includes(location?.location) ||
                          !location?.available)
                      }
                    >
                      {locationLabel(location?.location)?.name}
                      {location?.location !== "other" &&
                        locationInput?.includes(location?.location) && (
                          <span style={{ marginLeft: "8px", color: "#999" }}>
                            (selected as main)
                          </span>
                        )}
                      {!location?.available && (
                        <span style={{ marginLeft: "8px", color: "#f00" }}>
                          (not available)
                        </span>
                      )}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText>{error?.message}</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>
      {Array.isArray(locationAlternateInput) &&
        locationAlternateInput.includes("other") && (
          <Grid size={12}>
            <Controller
              name="otherLocationAlternate"
              control={control}
              rules={{
                validate: (value) =>
                  locationAlternateInput.includes("other") && !value
                    ? "Please specify the 'other' alternate location."
                    : true,
              }}
              defaultValue=""
              render={({ field, fieldState: { error, invalid } }) => (
                <TextField
                  {...field}
                  label="Other Alternate Location"
                  variant="outlined"
                  value={field.value ?? ""}
                  fullWidth
                  error={invalid}
                  helperText={error?.message}
                  required
                  disabled={disabled}
                />
              )}
            />
          </Grid>
        )}
    </Grid>
  );
}

// input event budget as a table
function EventBudgetTable({
  control,
  disabled = true,
  setBudgetEditing = null,
}) {
  return (
    <Controller
      name="budget"
      control={control}
      render={({ field: { value, onChange } }) => (
        <EventBudget
          editable={!disabled}
          rows={value}
          setRows={onChange}
          setBudgetEditing={setBudgetEditing}
        />
      )}
    />
  );
}

function EventSponsorTable({
  control,
  disabled = true,
  setSponsorEditing = null,
}) {
  return (
    <Controller
      name="sponsor"
      control={control}
      render={({ field: { value, onChange } }) => (
        <EventSponsor
          editable={!disabled}
          rows={value}
          setRows={onChange}
          setSponsorEditing={setSponsorEditing}
        />
      )}
    />
  );
}

// input event POC
function EventPOC({ control, cid, hasPhone, setHasPhone, disabled = false }) {
  const { triggerToast } = useToast();
  const poc = useWatch({
    control,
    name: "poc",
  });

  // fetch list of current members
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      let res = await currentMembersAction({ cid });
      if (!res.ok) {
        triggerToast({
          title: "Unable to fetch members",
          messages: res.error.messages,
          severity: "error",
        });
      } else {
        setMembers(res.data);
      }
      setLoading(false);
    })();
  }, [cid]);

  // fetch phone number of selected member
  useEffect(() => {
    if (poc) {
      (async () => {
        let res = await getFullUser(poc);
        if (!res.ok) {
          triggerToast({
            title: "Unable to fetch phone number",
            messages: res.error.messages,
            severity: "error",
          });
        } else {
          // console.log(res.data);
          if (res.data?.phone) setHasPhone(true);
          else setHasPhone(false);
        }
      })();
    }
  }, [poc]);

  return (
    <>
      <Controller
        name="poc"
        disabled={disabled}
        control={control}
        rules={{ required: "Select a member!" }}
        render={({ field, fieldState: { error, invalid } }) => (
          <FormControl fullWidth error={invalid}>
            {!cid || cid == "" ? (
              <TextField
                disabled
                value="Select a club to choose POC"
                variant="outlined"
                fullWidth
              />
            ) : loading ? (
              <Box
                sx={{
                  py: 25,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Fade in>
                  <CircularProgress color="primary" />
                </Fade>
              </Box>
            ) : members.length === 0 ? (
              <TextField
                disabled
                value="No approved current members found. Please add members to the club/body or wait for approval."
                variant="outlined"
                fullWidth
              />
            ) : (
              <>
                <InputLabel id="poc">Point of Contact *</InputLabel>
                <Select
                  labelId="poc"
                  label="Point of Contact *"
                  fullWidth
                  {...field}
                  MenuProps={{
                    style: { maxHeight: 400 },
                  }}
                >
                  {members?.slice()?.map((member) => (
                    <MenuItem
                      key={member._id}
                      value={member.uid}
                      component="div"
                    >
                      <MemberListItem uid={member.uid} />
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
            <FormHelperText>{error?.message}</FormHelperText>
          </FormControl>
        )}
      />
      {disabled || members.length === 0 || !poc || hasPhone ? null : (
        <Box
          sx={{
            mt: 2,
          }}
        >
          <Controller
            name="poc_phone"
            control={control}
            defaultValue=""
            rules={{
              validate: {
                checkPhoneNumber: (value) => {
                  if (!value || value === "") return true;
                  try {
                    const phoneNumber = parsePhoneNumberWithError(value, {
                      defaultCountry: "IN",
                    });
                    return (
                      isValidPhoneNumber(value, "IN") || "Invalid Phone Number!"
                    );
                  } catch (error) {
                    return error.message;
                  }
                },
              },
              required: "POC Phone number is required!",
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                error={invalid}
                helperText={error?.message}
                label="Phone Number"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Box>
      )}
    </>
  );
}
