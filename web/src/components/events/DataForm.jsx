"use client";

import { useEffect, useState } from "react";

import dayjs from "dayjs";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

import { useAuth } from "components/AuthProvider";
import ConfirmDialog from "components/ConfirmDialog";
import { useToast } from "components/Toast";

import { getAllClubIds } from "actions/clubs/all-ids/server_action";
import { eventsDataDownload } from "actions/events/data/server_action";

const allowed_roles = ["cc", "club", "slo", "slc"];
const admin_roles = ["cc", "slo", "slc"];
const disabledFields = ["code", "name", "clubid", "datetimeperiod.0", "status"]; // Fields that should be disabled and selected

function DataClubSelect({
  control,
  disabled = true,
  loading = false,
  clubs = [],
}) {
  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : clubs.length > 0 ? (
        <Controller
          name="clubid"
          control={control}
          rules={{ required: "Select a club/body!" }}
          render={({ field, fieldState: { error, invalid } }) => (
            <FormControl fullWidth error={invalid}>
              <InputLabel id="clubid-label">Club/Body</InputLabel>
              <Select
                labelId="clubid-label"
                label="Club/Body"
                fullWidth
                disabled={disabled}
                {...field}
              >
                <MenuItem value="allclubs">All Clubs/Bodies</MenuItem>
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
      ) : (
        <Typography
          variant="body1"
          sx={{
            fontSize: 18,
            padding: 1.7,
            color: "#919EAB",
            width: "100%",
            border: "1px solid rgba(99, 115, 129, 0.5)",
            borderRadius: "8px",
          }}
        >
          No clubs available
        </Typography>
      )}
    </>
  );
}

function EventDatetimeInput({ control, user }) {
  const startDateInput = useWatch({
    control,
    name: "datetimeperiod.0",
  });
  return (
    <Grid
      container
      direction="row"
      spacing={1}
      sx={{
        pt: 1,
      }}
      size={12}
    >
      <Grid size={6}>
        <Controller
          name="datetimeperiod.0"
          control={control}
          rules={{
            required: "Start date is required!",
            validate: {
              maxDateCheck: (value) =>
                dayjs(value) < dayjs(new Date()) ||
                admin_roles.includes(user?.role) ||
                "Start Date must be before today!",
            },
          }}
          render={({
            field: { value, ...rest },
            fieldState: { error, invalid },
          }) => (
            <DatePicker
              label="From Date"
              slotProps={{
                textField: {
                  error: invalid,
                  helperText: error?.message,
                },
              }}
              maxDate={
                admin_roles.includes(user?.role)
                  ? null
                  : dayjs(new Date()).subtract(1, "day")
              }
              disableFuture={admin_roles.includes(user?.role) ? false : true}
              sx={{ width: "100%" }}
              value={value instanceof Date ? dayjs(value) : value}
              {...rest}
            />
          )}
        />
      </Grid>
      <Grid size={6}>
        <Controller
          name="datetimeperiod.1"
          control={control}
          rules={{
            required: "End date is required!",
            validate: {
              checkDate: (value) =>
                dayjs(value) > dayjs(startDateInput) ||
                admin_roles.includes(user?.role) ||
                "End Date must be after Start Date!",
              maxDateCheck: (value) =>
                dayjs(value) <= dayjs(new Date()) ||
                admin_roles.includes(user?.role) ||
                "End Date must be till today!",
            },
          }}
          render={({
            field: { value, ...rest },
            fieldState: { error, invalid },
          }) => (
            <DatePicker
              label="To Date"
              disabled={!startDateInput}
              minDate={startDateInput && dayjs(startDateInput).add(1, "day")}
              disableFuture={admin_roles.includes(user?.role) ? false : true}
              slotProps={{
                textField: {
                  error: error || invalid,
                  helperText: error?.message,
                },
              }}
              sx={{ width: "100%" }}
              value={value instanceof Date ? dayjs(value) : value}
              {...rest}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

export default function DataForm({ defaultValues = {}, action = "log" }) {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      clubid: "",
      datetimeperiod: [null, null],
      fields: disabledFields, // Ensure disabled fields are selected by default
      status: "approved",
      ...defaultValues,
    },
  });
  const [loading, setLoading] = useState(false);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [cancelDialog, setCancelDialog] = useState(false);
  const status = watch("status");

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllClubIds();
        if (!res.ok) {
          throw new Error(res.error.messages);
        }
        setClubs(res.data);
        setClubsLoading(false);
      } catch (error) {
        triggerToast({
          title: "Unable to fetch clubs",
          messages: [error.message],
          severity: "error",
        });
      }
    })();
  }, []);

  const submitHandlers = {
    log: console.log,
    create: async (data) => {
      let res = await eventsDataDownload(data);

      if (res.ok) {
        try {
          const csvContent = res.data.downloadEventsData.csvFile;

          if (csvContent) {
            const csvBlob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            const csvFileName = `events_data_${dayjs(new Date()).format(
              "YYYY-MM-DD",
            )}.csv`;
            const downloadLink = document.createElement("a");
            const url = URL.createObjectURL(csvBlob);

            downloadLink.href = url;
            downloadLink.download = csvFileName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
          } else {
            console.error("No CSV content received");
          }
        } catch (error) {
          console.error("Failed to parse JSON response");
          triggerToast(error, "error");
        }
      } else {
        console.error("Failed to fetch CSV file");
        triggerToast({
          title: "Failed to fetch CSV file",
          messages: [res.error?.messages || "Unknown error"],
          severity: "error",
        });
      }
    },
  };

  async function onSubmit(formData) {
    setLoading(true);
    const data = {
      clubid: admin_roles.includes(user?.role) ? formData.clubid : user?.uid,
      dateperiod: formData.datetimeperiod.map((date) =>
        dayjs(date).format("YYYY-MM-DD"),
      ),
      fields: formData.fields,
      status: formData.status || "approved",
    };
    submitHandlers[action](data);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        Download Events Data
      </Typography>
      <Grid
        container
        spacing={3}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Grid size={12}>
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            {admin_roles.includes(user?.role)
              ? "Select Club/Student Body"
              : "Selected Club/Student Body"}
          </Typography>
          <Grid size={12}>
            {admin_roles.includes(user?.role) ? (
              <DataClubSelect
                control={control}
                disabled={!admin_roles.includes(user?.role)}
                loading={clubsLoading}
                clubs={clubs}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontSize: 18,
                  padding: 1.7,
                  color: "#919EAB",
                  width: "100%",
                  border: "1px solid rgba(99, 115, 129, 0.5)",
                  borderRadius: "8px",
                }}
              >
                {clubs.find((club) => club.cid === user?.uid)?.name ||
                  user?.uid}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid size={12}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            Date Range
          </Typography>
          <EventDatetimeInput control={control} user={user} />
        </Grid>
        {admin_roles.includes(user?.role) ? (
          <Grid size={12}>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: "uppercase",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Events to Include
            </Typography>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="status">Status</InputLabel>
                  <Select labelId="status" label="Status" fullWidth {...field}>
                    <MenuItem value="all">All Events</MenuItem>
                    <MenuItem value="approved">Only Approved Events</MenuItem>
                    <MenuItem value="pending">Only Pending Events</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        ) : null}
        <Grid size={12}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            Fields to Include
          </Typography>
          <Controller
            name="fields"
            control={control}
            rules={{ required: "Select at least one field!" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl component="fieldset" fullWidth error={error}>
                <FormGroup row>
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      ml: 1,
                    }}
                  >
                    {[
                      { fieldValue: "code", fieldName: "Event Code" },
                      { fieldValue: "name", fieldName: "Event Name" },
                      { fieldValue: "clubid", fieldName: "Club" },
                      {
                        fieldValue: "datetimeperiod.0",
                        fieldName: "Start Date",
                      },
                      { fieldValue: "datetimeperiod.1", fieldName: "End Date" },
                      { fieldValue: "description", fieldName: "Description" },
                      { fieldValue: "audience", fieldName: "Audience" },
                      { fieldValue: "population", fieldName: "Audience Count" },
                      { fieldValue: "mode", fieldName: "Mode" },
                      { fieldValue: "location", fieldName: "Venue" },
                      { fieldValue: "equipment", fieldName: "Equipment" },
                      { fieldValue: "budget", fieldName: "Budget" },
                      { fieldValue: "poster", fieldName: "Poster URL" },

                      ...(status != "approved"
                        ? [
                            {
                              fieldValue: "equipment",
                              fieldName: "Equipment",
                            },
                            {
                              fieldValue: "additional",
                              fieldName: "Additional Requests",
                            },
                            { fieldValue: "status", fieldName: "Status" },
                          ]
                        : [
                            {
                              fieldValue: "event_report_submitted",
                              fieldName: "Event Report Submitted",
                            },
                          ]),
                    ].map(({ fieldValue, fieldName }) => (
                      <Grid
                        key={fieldValue}
                        size={{
                          lg: 2,
                          md: 3,
                          sm: 4,
                          xs: 6,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              value={fieldValue}
                              checked={field.value.includes(fieldValue)}
                              disabled={disabledFields.includes(fieldValue)}
                              onChange={(event) => {
                                const newValue = [...field.value];
                                if (event.target.checked) {
                                  newValue.push(event.target.value);
                                } else {
                                  const index = newValue.indexOf(
                                    event.target.value,
                                  );
                                  if (index > -1) {
                                    newValue.splice(index, 1);
                                  }
                                }
                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={fieldName}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
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
            color="secondary"
            fullWidth
            disabled={loading}
            onClick={() => setCancelDialog(true)}
          >
            Reset
          </Button>

          <ConfirmDialog
            open={cancelDialog}
            title="Confirm resetting"
            description="Are you sure you want to reset? All the selections will be lost."
            onConfirm={() => {
              reset();
              setCancelDialog(false);
            }}
            onClose={() => setCancelDialog(false)}
            confirmProps={{ color: "primary" }}
            confirmText="Yes, discard my changes"
          />
        </Grid>
        <Grid size={6}>
          {allowed_roles.includes(user?.role) && (
            <Button
              loading={loading}
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              fullWidth
            >
              Download CSV
            </Button>
          )}
        </Grid>
      </Grid>
    </form>
  );
}
