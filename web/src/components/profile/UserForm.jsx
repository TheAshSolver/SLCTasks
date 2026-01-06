"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import { Controller, useForm } from "react-hook-form";

import { Button, Grid, TextField, Typography } from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import FileUpload from "components/FileUpload";
import { useToast } from "components/Toast";
import { uploadImageFile } from "utils/files";

import { updateUserDataAction } from "actions/users/save/server_action";

const profile_warnSizeMB = 0.5;
const profile_maxSizeMB = 5;

export default function UserForm({ defaultValues = {}, action = "log" }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  const { control, handleSubmit } = useForm({ defaultValues });
  const { triggerToast } = useToast();

  // different form submission handlers
  const submitHandlers = {
    log: console.log,
    save: async (data) => {
      const res = await updateUserDataAction(data);

      if (res.ok) {
        // show success toast & redirect to manage page
        // triggerToast({
        //   title: "Success!",
        //   messages: ["Profile saved."],
        //   severity: "success",
        // });
        router.push(`/profile/${defaultValues.uid}`);
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
        setLoading(false);
      }
    },
  };

  // transform data and mutate
  async function onSubmit(formData) {
    setLoading(true);

    const data = {
      uid: defaultValues.uid,
      phone: formData.phone,
    };

    if (formData.phone == "") data.phone = null;

    // upload image
    try {
      if (typeof formData.img === "string") {
        data.img = formData.img;
      } else if (Array.isArray(formData.img) && formData.img.length > 0) {
        data.img = await uploadImageFile(
          formData.img[0],
          `profile_${defaultValues.uid}`,
          profile_warnSizeMB,
        );
      } else {
        data.img = null;
      }
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error.message
          ? [error.message]
          : error?.messages || ["Failed to upload image"],
        severity: "error",
      });
    }

    // mutate
    await submitHandlers[action](data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid
          container
          spacing={3}
          sx={{
            alignItems: "flex-start",
          }}
          size={{
            xs: 12,
            md: 7,
            xl: 8,
          }}
        >
          <Grid container>
            <Grid
              container
              spacing={2}
              sx={{
                mt: 1,
              }}
            >
              <Grid size={6}>
                <TextField
                  fullWidth
                  disabled
                  label="First Name"
                  value={defaultValues?.firstName}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Last Name"
                  value={defaultValues?.lastName}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  disabled
                  label="Email"
                  value={defaultValues?.email}
                />
              </Grid>
              <Grid container spacing={1} size={12}>
                <Grid>
                  <TextField
                    disabled
                    label="Batch"
                    value={defaultValues?.batch?.toUpperCase()}
                  />
                </Grid>
                <Grid>
                  <TextField
                    disabled
                    label="Stream"
                    value={defaultValues?.stream?.toUpperCase()}
                  />
                </Grid>
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
                mb: defaultValues?.phone ? 2 : 1,
              }}
            >
              Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Controller
                  name="phone"
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
                            isValidPhoneNumber(value, "IN") ||
                            "Invalid Phone Number!"
                          );
                        } catch (error) {
                          return error.message;
                        }
                      },
                    },
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
              </Grid>
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
              Media
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FileUpload
                  type="image"
                  name="img"
                  label="Profile Image"
                  control={control}
                  shape="circle"
                  maxFiles={1}
                  warnSizeMB={profile_warnSizeMB}
                  maxSizeMB={profile_maxSizeMB}
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
                  type="submit"
                  size="large"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}
