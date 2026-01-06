"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";

import { Box, Button, Grid, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import ConfirmDialog from "components/ConfirmDialog";
import { useToast } from "components/Toast";

import { createHolidays } from "actions/holidays/create/server_action";
import { deleteHolidays } from "actions/holidays/delete/server_action";
import { editHolidays } from "actions/holidays/edit/server_action";

export default function HolidayForm({
  id = null,
  defaultValues = {},
  action = "log",
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues,
  });
  const { triggerToast } = useToast();

  const submitHandlers = {
    log: console.log,
    create: async (data) => {
      let details = {
        name: data.name,
        date: dayjs(data.date).format("YYYY-MM-DD"),
        // description: data.description,
        description: null,
      };

      const res = await createHolidays(details);

      if (res.ok) {
        // else show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Holiday created."],
          severity: "success",
        });
        router.push("/manage/holidays/");
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
        setLoading(false);
      }
    },
    edit: async (data) => {
      let details = {
        name: data.name,
        date: dayjs(data.date).format("YYYY-MM-DD"),
        // description: data.description,
        description: null,
      };
      const res = await editHolidays(id, details);

      if (res.ok) {
        // else show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Holiday updated."],
          severity: "success",
        });
        router.push("/manage/holidays/");
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
        setLoading(false);
      }
    },
    delete: async () => {
      let res = await deleteHolidays(id);

      if (res.ok) {
        // else show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Holiday deleted."],
          severity: "success",
        });
        router.push("/manage/holidays/");
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
        setLoading(false);
        setDeleteDialog(false);
      }
    },
  };

  const onSubmit = handleSubmit(submitHandlers[action]);

  return (
    <Box>
      {/* Add delete button on right side */}
      {id ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={() => setDeleteDialog(true)}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>

          <ConfirmDialog
            open={deleteDialog}
            onClose={() => setDeleteDialog(false)}
            onConfirm={submitHandlers.delete}
            title="Confirm deletion"
            description="Are you sure you want to delete this holiday?"
            confirmProps={{ color: "error" }}
            confirmText="Yes, delete"
          />
        </Box>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Controller
              name="name"
              control={control}
              rules={{
                minLength: {
                  value: 5,
                  message: "Holiday name must be at least 5 characters long!",
                },
                maxLength: {
                  value: 500,
                  message: "Holiday name must be at most 500 characters long!",
                },
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
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required!" }}
              render={({
                field: { value, ...rest },
                fieldState: { error, invalid },
              }) => (
                <DatePicker
                  slotProps={{
                    textField: {
                      error: invalid,
                      helperText: error?.message,
                    },
                  }}
                  format="DD/MM/YYYY"
                  label="Date *"
                  renderTimeView={renderTimeViewClock}
                  sx={{ width: "100%" }}
                  required
                  value={dayjs(value)}
                  {...rest}
                />
              )}
            />
          </Grid>
          {/* <Grid xs={12}>
          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: {
                value: 4000,
                message:
                  "Holiday description must be at most 4000 characters long!",
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
              />
            )}
          />
        </Grid> */}
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
                onClose={() => setCancelDialog(false)}
                onConfirm={() => router.back()}
                title="Confirm cancellation"
                description="Are you sure you want to cancel? All unsaved changes will be lost."
                confirmProps={{ color: "primary" }}
                confirmText="Yes, discard my changes"
              />
            </Grid>
            <Grid size={6}>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                fullWidth
                loading={loading}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
