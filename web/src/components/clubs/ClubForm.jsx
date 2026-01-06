"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Controller, useForm } from "react-hook-form";

import {
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { useMode } from "contexts/ModeContext";

import { useAuth } from "components/AuthProvider";
import ConfirmDialog from "components/ConfirmDialog";
import FileUpload from "components/FileUpload";
import Icon from "components/Icon";
import { useToast } from "components/Toast";
import { uploadImageFile } from "utils/files";
import { socialsData } from "utils/socialsData";

import { createClubAction } from "actions/clubs/create/server_action";
import { editClubAction } from "actions/clubs/edit/server_action";

const logo_maxSizeMB = 3;
const banner_maxSizeMB = 10;
const bannerSquare_maxSizeMB = 3;

const logo_warnSizeMB = 0.3;
const banner_warnSizeMB = 1;
const bannerSquare_warnSizeMB = 0.3;

export default function ClubForm({ defaultValues = {}, action = "log" }) {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  const { control, handleSubmit } = useForm({ defaultValues });
  const { triggerToast } = useToast();

  // different form submission handlers
  const submitHandlers = {
    log: console.log,
    create: async (data) => {
      let res = await createClubAction(data);

      if (res.ok) {
        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Club created."],
          severity: "success",
        });
        router.push(`/manage/clubs/${data.cid}`);
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
      let res = await editClubAction(data);

      if (res.ok) {
        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Club edited."],
          severity: "success",
        });
        router.push(`/manage/clubs/${data.cid}`);
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
      code: formData.code,
      name: formData.name,
      email: formData.email,
      category: formData.category,
      tagline: formData.tagline === "" ? null : formData.tagline,
      description: formData.description,
      socials: {
        website:
          formData.socials.website === "" ? null : formData.socials.website,
        instagram:
          formData.socials.instagram === "" ? null : formData.socials.instagram,
        facebook:
          formData.socials.facebook === "" ? null : formData.socials.facebook,
        youtube:
          formData.socials.youtube === "" ? null : formData.socials.youtube,
        twitter:
          formData.socials.twitter === "" ? null : formData.socials.twitter,
        linkedin:
          formData.socials.linkedin === "" ? null : formData.socials.linkedin,
        discord:
          formData.socials.discord === "" ? null : formData.socials.discord,
        whatsapp:
          formData.socials.whatsapp === "" ? null : formData.socials.whatsapp,
      },
    };

    // set CID based on club email
    data.cid = formData.email.split("@")[0];

    // set filenames for media
    const logo_filename = "logo_" + data.cid.replace(".", "_");
    const banner_filename = "banner_" + data.cid.replace(".", "_");
    const bannerSquare_filename = "bannerSquare_" + data.cid.replace(".", "_");

    // upload media
    try {
      if (typeof formData.logo === "string") {
        data.logo = formData.logo;
      } else if (Array.isArray(formData.logo) && formData.logo.length > 0) {
        data.logo = await uploadImageFile(
          formData.logo[0],
          logo_filename,
          logo_warnSizeMB,
        );
      } else {
        data.logo = null;
      }
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error.message
          ? [error.message]
          : error?.messages || ["Failed to upload logo"],
        severity: "error",
      });
    }

    try {
      if (typeof formData.banner === "string") {
        data.banner = formData.banner;
      } else if (Array.isArray(formData.banner) && formData.banner.length > 0) {
        data.banner = await uploadImageFile(
          formData.banner[0],
          banner_filename,
          banner_warnSizeMB,
        );
      }
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error.message
          ? [error.message]
          : error?.messages || ["Failed to upload banner"],
        severity: "error",
      });
    }

    try {
      if (typeof formData.bannerSquare === "string") {
        data.bannerSquare = formData.bannerSquare;
      } else if (
        Array.isArray(formData.bannerSquare) &&
        formData.bannerSquare.length > 0
      ) {
        data.bannerSquare = await uploadImageFile(
          formData.bannerSquare[0],
          bannerSquare_filename,
          bannerSquare_warnSizeMB,
        );
      }
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error.message
          ? [error.message]
          : error?.messages || ["Failed to upload square banner"],
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
          size={{
            xs: 12,
            md: 7,
            xl: 8,
          }}
        >
          <Grid container>
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
            <Grid container spacing={2}>
              {/* show club code input only when creating a new club */}
              {!defaultValues.cid ? (
                <Grid size={12}>
                  <ClubCodeInput control={control} />
                </Grid>
              ) : null}
              <Grid size={12}>
                <ClubNameInput
                  control={control}
                  disabled={user?.role != "cc"}
                />
              </Grid>
              <Grid size={12}>
                <ClubEmailInput
                  control={control}
                  disabled={user?.role != "cc"}
                />
              </Grid>
              <Grid size={12}>
                <ClubCategorySelect
                  control={control}
                  disabled={user?.role != "cc"}
                />
              </Grid>
              <Grid size={12}>
                <ClubTaglineInput control={control} />
              </Grid>
              <Grid size={12}>
                <ClubDescriptionInput control={control} />
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
                mb: 2,
              }}
            >
              Socials
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <ClubSocialInput name="website" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="instagram" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="facebook" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="twitter" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="linkedin" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="youtube" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="discord" control={control} />
              </Grid>
              <Grid size={12}>
                <ClubSocialInput name="whatsapp" control={control} />
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
                  name="logo"
                  label="Logo"
                  control={control}
                  maxFiles={1}
                  shape="circle"
                  maxSizeMB={logo_maxSizeMB}
                  warnSizeMB={logo_warnSizeMB}
                />
              </Grid>
              <Grid size={12}>
                <FileUpload
                  type="image"
                  name="banner"
                  label="Banner"
                  control={control}
                  maxFiles={1}
                  shape="rectangle"
                  maxSizeMB={banner_maxSizeMB}
                  warnSizeMB={banner_warnSizeMB}
                />
              </Grid>
              <Grid size={12}>
                <FileUpload
                  type="image"
                  name="bannerSquare"
                  label="Banner Square"
                  control={control}
                  maxFiles={1}
                  shape="square"
                  maxSizeMB={bannerSquare_maxSizeMB}
                  warnSizeMB={bannerSquare_warnSizeMB}
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

// custom club code input
function ClubCodeInput({ control }) {
  return (
    <Controller
      name="code"
      control={control}
      rules={{
        maxLength: {
          value: 15,
          message: "Club code must be at most 15 characters long!",
        },
      }}
      defaultValue=""
      render={({ field, fieldState: { error, invalid } }) => (
        <TextField
          {...field}
          label="Club Code"
          autoComplete="off"
          error={invalid}
          helperText={
            error?.message ||
            "A custom, short code to identify this club. NOTE: This can NOT be changed."
          }
          variant="outlined"
          fullWidth
          required
        />
      )}
    />
  );
}

// club name input
function ClubNameInput({ control, disabled }) {
  return (
    <Controller
      name="name"
      control={control}
      rules={{
        minLength: {
          value: 5,
          message: "Club name must be at least 5 characters long!",
        },
        maxLength: {
          value: 50,
          message: "Club name must be at most 50 characters long!",
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
          disabled={disabled}
          required
        />
      )}
    />
  );
}

// club email input
function ClubEmailInput({ control, disabled }) {
  return (
    <Controller
      name="email"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="email"
          label="Email"
          autoComplete="off"
          variant="outlined"
          fullWidth
          disabled={disabled}
          required
        />
      )}
    />
  );
}

// club category dropdown
function ClubCategorySelect({ control, disabled }) {
  return (
    <Controller
      name="category"
      control={control}
      rules={{ required: true }}
      render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel id="category">Category *</InputLabel>
          <Select
            labelId="category"
            label="Category *"
            fullWidth
            disabled={disabled}
            {...field}
          >
            <MenuItem value="cultural">Cultural</MenuItem>
            <MenuItem value="technical">Technical</MenuItem>
            <MenuItem value="affinity">Affinity Group</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="body">Student Body</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      )}
    />
  );
}

// club tagline input
function ClubTaglineInput({ control }) {
  return (
    <Controller
      name="tagline"
      control={control}
      rules={{
        minLength: {
          value: 2,
          message: "Club tagline must be at least 2 characters long!",
        },
        maxLength: {
          value: 200,
          message: "Club tagline must be at most 200 characters long!",
        },
      }}
      render={({ field, fieldState: { error, invalid } }) => (
        <TextField
          {...field}
          label="Tagline"
          autoComplete="off"
          error={invalid}
          helperText={error?.message}
          value={field.value || ""}
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
}

// club description input
function ClubDescriptionInput({ control }) {
  return (
    <Controller
      name="description"
      control={control}
      rules={{
        maxLength: {
          value: 1000,
          message: "Club description must be at most 1000 characters long!",
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
  );
}

// club social link input
function ClubSocialInput({ name, control }) {
  const { isDark } = useMode();

  return (
    <Controller
      name={`socials.${name}`}
      control={control}
      rules={{
        validate: (value) => {
          if (!value) return true;

          // Match regex
          if (
            socialsData[name].regex &&
            !new RegExp(socialsData[name].regex).test(value)
          )
            return `Invalid ${socialsData[name].label} URL`;

          // Check if URL contains validation string
          if (
            socialsData[name].validation &&
            !value.includes(socialsData[name].validation)
          )
            return `Invalid ${socialsData[name].label} Valdiation`;

          return true;
        },
      }}
      render={({ field, fieldState: { error, invalid } }) => (
        <TextField
          {...field}
          type="url"
          label={socialsData[name].label}
          autoComplete="off"
          variant="outlined"
          fullWidth
          error={invalid}
          helperText={error?.message}
          value={field.value || ""}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Icon
                    external
                    variant={socialsData[name].icon}
                    sx={{
                      color: isDark
                        ? socialsData[name].darkcolor
                        : socialsData[name].color,
                      marginRight: 1,
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
