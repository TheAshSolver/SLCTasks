"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Controller, useForm } from "react-hook-form";

import { Button, Grid, TextField } from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import { useToast } from "components/Toast";

import { eventBillStatus } from "actions/events/bills/bill-status/server_action";

export default function BillsStatusForm({ id = null, defaultValues = {} }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const { control, handleSubmit, setValue } = useForm({ defaultValues });
  const { triggerToast } = useToast();

  const submitHandler = async (data) => {
    setLoading(true);
    let details = {
      eventid: id,
      state: data.state,
      sloComment: data.sloComment,
    };

    let res = await eventBillStatus(details);

    if (res.ok) {
      triggerToast({
        title: "Success!",
        messages: ["Bill status updated."],
        severity: "success",
      });
      router.push("/manage/finances/");
    } else {
      triggerToast({
        ...res.error,
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Controller
            name="sloComment"
            control={control}
            rules={{
              maxLength: {
                value: 1000,
                message: "Comment must be at most 1000 characters long!",
              },
              minLength: {
                value: 2,
                message: "Comment must be at least 2 characters long!",
              },
            }}
            render={({
              field: { value, ...rest },
              fieldState: { error, invalid },
            }) => (
              <TextField
                {...rest}
                {...rest}
                label="Comment"
                autoComplete="off"
                error={invalid}
                helperText={error?.message}
                value={value || ""}
                variant="outlined"
                rows={4}
                fullWidth
                multiline
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
          <Grid size={4}>
            <Button
              size="large"
              variant="contained"
              color="error"
              fullWidth
              loading={loading}
              onClick={() => {
                setValue("state", "rejected");
                handleSubmit(submitHandler)();
              }}
            >
              Reject
            </Button>
          </Grid>
          <Grid size={4}>
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
          <Grid size={4}>
            <Button
              size="large"
              variant="contained"
              color="success"
              fullWidth
              loading={loading}
              onClick={() => {
                setValue("state", "accepted");
                handleSubmit(submitHandler)();
              }}
            >
              Accept
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}
