"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import dayjs, { isDayjs } from "dayjs";
import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DateTimePicker } from "@mui/x-date-pickers";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import { useAuth } from "components/AuthProvider";
import ConfirmDialog from "components/ConfirmDialog";
import MemberListItem from "components/members/MemberListItem";
import { useToast } from "components/Toast";

import { getActiveClubIds } from "actions/clubs/ids/server_action";
import { createEventReportAction } from "actions/events/report/create/server_action";
import { editEventReportAction } from "actions/events/report/edit/server_action";
import { currentMembersAction } from "actions/members/current/server_action";
import { getFullUser } from "actions/users/get/full/server_action";
import { saveUserPhone } from "actions/users/save/phone/server_action";

const PrizesType = {
  win_certificates: "win_certificates",
  participation_certificates: "participation_certificates",
  cash_prizes: "cash_prizes",
  vouchers: "vouchers",
  medals: "medals",
  others: "others",
};
const admin_roles = ["cc", "slo"];

export default function EventReportForm({
  id = null,
  defaultValues = {},
  defaultReportValues = {},
  action = "log",
}) {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [hasPhone, setHasPhone] = useState(true);

  const { triggerToast } = useToast();

  useEffect(() => {
    const fetchClubs = async () => {
      const res = await getActiveClubIds();
      if (res.ok) {
        setClubs(res.data);
      } else {
        triggerToast({
          title: "Unable to fetch clubs",
          messages: res.error.messages,
          severity: "error",
        });
      }
    };
    fetchClubs();
  }, []);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      ...defaultValues,
      ...defaultReportValues,
    },
  });

  const prizesInput = watch("prizes");

  const submitHandlers = {
    log: console.log,
    create: async (data) => {
      setLoading(true);
      let res = await createEventReportAction(data);

      if (res.ok) {
        triggerToast({
          title: "Success!",
          messages: [
            "Event Report Created Successfully. You can edit it within 2 days of submission.",
          ],
          severity: "success",
        });
        router.push(`/manage/events/${id}/report`);
      } else {
        triggerToast({
          ...res.error,
          severity: "error",
        });
      }
      setLoading(false);
    },
    edit: async (data) => {
      setLoading(true);
      let res = await editEventReportAction(data);

      if (res.ok) {
        triggerToast({
          title: "Success!",
          messages: ["Event Report Successfully Updated."],
          severity: "success",
        });
        router.push(`/manage/events/${id}/report`);
      } else {
        triggerToast({
          ...res.error,
          severity: "error",
        });
      }
      setLoading(false);
    },
    phone: async (data) => {
      let res = await saveUserPhone(data);

      if (!res.ok) {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });

        return false;
      }

      return true;
    },
  };

  async function onSubmit(formData) {
    setLoading(true);
    try {
      const reportData = {
        eventid: id,
        summary: formData.eventSummary,
        attendance: parseInt(formData.actualAttendance, 0),
        externalAttendance: parseInt(formData.actualExternalAttendance, null),
        prizes: formData.prizes || [],
        prizesBreakdown: formData.prizesBreakdown || "N/A",
        winners: formData.winnersDetails || "N/A",
        photosLink: formData.mediaLink,
        feedbackCc: formData.feedback || "N/A",
        feedbackCollege: formData.feedback || "N/A",
        submittedBy: formData.submittedBy,
        submittedTime: new Date().toISOString(),
      };
      if (!hasPhone && formData.submittedBy_phone) {
        const phoneData = {
          uid: formData.submittedBy,
          phone: formData.submittedBy_phone,
        };
        let phoneReturn = submitHandlers["phone"](phoneData);
        if (!phoneReturn) {
          setLoading(false);
          return;
        }
      }
      await submitHandlers[action](reportData);
    } catch (error) {
      triggerToast({
        title: "Submission Failed",
        messages: [error.message],
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
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
          spacing={3}
          size={{
            xs: 12,
            md: 7,
            xl: 8,
          }}
        >
          <Grid container>
            <Grid
              container
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  textTransform: "uppercase",
                  color: "text.secondary",
                  mb: 2,
                }}
              >
                Details
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Name"
                value={defaultValues?.name}
                disabled
                fullWidth
              />
            </Grid>
            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                    xl: 6,
                  }}
                >
                  <DateTimePicker
                    label="Starts Date"
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                    sx={{ width: "100%" }}
                    value={
                      defaultValues?.datetimeperiod[0] instanceof Date &&
                      !isDayjs(defaultValues?.datetimeperiod[0])
                        ? dayjs(defaultValues?.datetimeperiod[0])
                        : defaultValues?.datetimeperiod[0]
                    }
                    disabled
                    format="DD/MM/YYYY hh:mm A"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                    xl: 6,
                  }}
                >
                  <DateTimePicker
                    label="End Date"
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                    sx={{ width: "100%" }}
                    value={
                      defaultValues?.datetimeperiod[1] instanceof Date &&
                      !isDayjs(defaultValues?.datetimeperiod[1])
                        ? dayjs(defaultValues?.datetimeperiod[1])
                        : defaultValues?.datetimeperiod[1]
                    }
                    disabled
                    format="DD/MM/YYYY hh:mm A"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <FormControl fullWidth disabled>
                <InputLabel>Organized By</InputLabel>
                <Select
                  value={[
                    defaultValues?.clubid,
                    ...(defaultValues?.collabclubs || []),
                  ].filter(Boolean)} // Ensure the value is an array
                  multiple
                  renderValue={(selected) => {
                    return (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {selected
                          .map(
                            (clubId) =>
                              clubs.find((club) => club.cid === clubId)?.name,
                          )
                          .filter(Boolean)
                          .map((clubName) => (
                            <Chip key={clubName} label={clubName} />
                          )) || "N/A"}
                      </Box>
                    );
                  }}
                ></Select>
              </FormControl>
            </Grid>
            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <Controller
                name="eventSummary"
                control={control}
                defaultValue={defaultReportValues?.summary}
                rules={{
                  required: "Summary of the Event is required!",
                  maxLength: {
                    value: 5000,
                    message:
                      "Event description must be at most 5000 characters long!",
                  },
                }}
                render={({ field, fieldState: { error, invalid } }) => (
                  <TextField
                    {...field}
                    label="Summary of the Event*"
                    multiline
                    rows={7}
                    fullWidth
                    autoComplete="off"
                    error={invalid}
                    helperText={error?.message}
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <Controller
                name="mediaLink"
                control={control}
                defaultValue={defaultReportValues?.photosLink}
                rules={{
                  required: "Photos/Videos Link is required!",
                  pattern: {
                    value:
                      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                    message: "Invalid link format. Please enter a valid link.",
                  },
                }}
                render={({ field, fieldState: { error, invalid } }) => (
                  <TextField
                    {...field}
                    label="Photos/Videos Link*"
                    type="url"
                    fullWidth
                    error={invalid}
                    helperText={error?.message}
                    autoComplete="off"
                  />
                )}
              />
            </Grid>
            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <SubmittedBy
                control={control}
                cid={user?.role === "club" ? user?.uid : defaultValues?.clubid}
                hasPhone={hasPhone}
                setHasPhone={setHasPhone}
              />
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
            <Grid
              container
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  textTransform: "uppercase",
                  color: "text.secondary",
                  mb: 2,
                }}
              >
                Attendance
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Expected Participation"
                value={defaultValues?.population}
                disabled
                fullWidth
              />
            </Grid>
            <Grid
              sx={{
                mt: 2,
                mb: 3,
              }}
              size={12}
            >
              <Controller
                name="actualAttendance"
                control={control}
                rules={{ required: "Actual Attendance is required!" }}
                defaultValue={defaultReportValues?.attendance}
                render={({ field, fieldState: { error, invalid } }) => (
                  <TextField
                    {...field}
                    label="Actual Attendance*"
                    type="number"
                    fullWidth
                    error={invalid}
                    helperText={error?.message}
                    autoComplete="off"
                  />
                )}
              />
            </Grid>
            {defaultValues?.externalPopulation ? (
              <>
                <Grid size={12}>
                  <TextField
                    label="Expected External Participation"
                    value={defaultValues?.population}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid
                  sx={{
                    mt: 2,
                  }}
                  size={12}
                >
                  <Controller
                    name="actualExternalAttendance"
                    control={control}
                    rules={{
                      required: "Actual External Attendance is required!",
                    }}
                    defaultValue={defaultReportValues?.externalAttendance}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <TextField
                        {...field}
                        label="Actual External Attendance*"
                        type="number"
                        fullWidth
                        error={invalid}
                        helperText={error?.message}
                        autoComplete="off"
                      />
                    )}
                  />
                </Grid>
              </>
            ) : null}

            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <Controller
                name="prizes"
                control={control}
                defaultValue={[]}
                render={({ field, fieldState: { error, invalid } }) => (
                  <FormControl fullWidth error={invalid}>
                    <InputLabel>Prizes (if any)</InputLabel>
                    <Select
                      multiple
                      label="Prizes (if any)"
                      renderValue={(selected) => (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value?.replace(/_/g, " ").toUpperCase()}
                            />
                          ))}
                        </Box>
                      )}
                      {...field}
                    >
                      {Object.values(PrizesType).map((prize) => (
                        <MenuItem key={prize} value={prize}>
                          {prize.replace(/_/g, " ").toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            {prizesInput?.length != 0 && (
              <>
                <Grid
                  sx={{
                    mt: 2,
                  }}
                  size={12}
                >
                  <Controller
                    name="prizesBreakdown"
                    control={control}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <TextField
                        {...field}
                        label="Prizes breakdown (if any)"
                        multiline
                        rows={3}
                        fullWidth
                        autoComplete="off"
                        error={invalid}
                        helperText={error?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid
                  sx={{
                    mt: 2,
                  }}
                  size={12}
                >
                  <Controller
                    name="winnersDetails"
                    control={control}
                    defaultValue={defaultReportValues?.winners}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <TextField
                        {...field}
                        label="Winners details (if any)"
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
            )}
            <Grid
              sx={{
                mt: 2,
              }}
              size={12}
            >
              <Controller
                name="feedback"
                control={control}
                defaultValue={defaultReportValues?.feedbackCc}
                render={({ field, fieldState: { error, invalid } }) => (
                  <TextField
                    {...field}
                    label="Feedback for CC/College (if any)"
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
                <Button
                  loading={loading}
                  size="large"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleSubmit((data) => onSubmit(data))()}
                >
                  Save & Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

function SubmittedBy({
  control,
  cid,
  hasPhone,
  setHasPhone,
  disabled = false,
}) {
  const { triggerToast } = useToast();
  const submittedBy = useWatch({
    control,
    name: "submittedBy",
  });

  // fetch list of current members
  const [members, setMembers] = useState([]);
  useEffect(() => {
    (async () => {
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
    })();
  }, [cid]);

  // fetch phone number of selected member
  useEffect(() => {
    if (submittedBy) {
      (async () => {
        let res = await getFullUser(submittedBy);
        if (!res.ok) {
          triggerToast({
            title: "Unable to fetch phone number",
            messages: res.error.messages,
            severity: "error",
          });
        } else {
          if (res.data?.phone) setHasPhone(true);
          else setHasPhone(false);
        }
      })();
    }
  }, [submittedBy]);

  return (
    <>
      <Controller
        name="submittedBy"
        disabled={disabled}
        control={control}
        rules={{ required: "Select a member!" }}
        render={({ field, fieldState: { error, invalid } }) => (
          <FormControl fullWidth error={invalid}>
            <InputLabel id="submittedBy">Submitted By *</InputLabel>
            {members.length === 0 ? (
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
            ) : (
              <Select
                labelId="submittedBy"
                label="Submitted By *"
                fullWidth
                {...field}
                MenuProps={{
                  style: { maxHeight: 400 },
                }}
              >
                {members?.slice()?.map((member) => (
                  <MenuItem key={member._id} value={member.uid} component="div">
                    <MemberListItem uid={member.uid} />
                  </MenuItem>
                ))}
              </Select>
            )}
            <FormHelperText>{error?.message}</FormHelperText>
          </FormControl>
        )}
      />
      {disabled || members.length === 0 || !submittedBy || hasPhone ? null : (
        <Box
          sx={{
            mt: 2,
          }}
        >
          <Controller
            name="submittedBy_phone"
            defaultValue={""}
            control={control}
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
              required: "submitting Member Phone number is required!",
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
