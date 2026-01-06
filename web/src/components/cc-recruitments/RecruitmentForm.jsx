"use client";

import { useState } from "react";

import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import { Controller, useForm } from "react-hook-form";

import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import ConfirmDialog from "components/ConfirmDialog";
import { useToast } from "components/Toast";
import UserImage from "components/users/UserImage";

import { ccRecruitmentsApply } from "actions/cc-recruitments/apply/server_action";
import { saveUserPhone } from "actions/users/save/phone/server_action";

const allowedBatches = ["ug2k23", "ug2k24", "mtech2k24", "ms2k24"];

const availableTeams = [
  ["Design", "Design"],
  ["Finance", "Finance"],
  ["Logistics and Inventory", "Logistics"],
  ["Stats and Registry", "Stats"],
  ["Corporate", "Corporate"],
];

const roles = [
  {
    title: "Logistics",
    points: [
      "Handles website requests, member approvals, and event scheduling.",
      "Manages inventory, checks for calendar clashes, and coordinates room bookings and approvals.",
    ],
  },
  {
    title: "Finance",
    points: [
      "Reviews budget requests, negotiates with clubs, and approves funding.",
      "Allocates budgets during major events like college fests.",
    ],
  },
  {
    title: "Corporate",
    points: ["Secures external sponsorships in addition to what clubs bring."],
  },
  {
    title: "Design & Social Media",
    points: [
      "Creates posters, graphics, and promotional materials.",
      "Handles the Clubs Council's social media.",
    ],
  },
  {
    title: "Stats & Registry",
    points: [
      "Maintains records and ensures timely submission of event reports.",
      "Provides content for the newsletter.",
    ],
  },
];

function MemberUserInput({ user = {} }) {
  return user ? (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={4}
      sx={{
        alignItems: "center",
      }}
    >
      <UserImage
        image={user.img}
        name={user.firstName}
        gender={user.gender}
        width={80}
        height={80}
      />
      <Stack direction="column" spacing={1}>
        <Typography variant="h4">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontFamily: "monospace",
          }}
        >
          {user.email}
        </Typography>
      </Stack>
    </Stack>
  ) : (
    <Typography>Please Login to apply</Typography>
  );
}

export default function RecruitmentForm({ user = {} }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const defaultValues = {};
  const { control, handleSubmit, watch } = useForm({ defaultValues });
  const teams = watch("teams");

  const [loading, setLoading] = useState(false);
  const [submiited, setSubmitted] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const { triggerToast } = useToast();

  async function onSubmit(formData) {
    setLoading(true);
    if (!user.phone && formData.phone) {
      const phoneData = {
        uid: user.uid,
        phone: formData.phone,
      };
      let res = await saveUserPhone(phoneData);

      if (!res.ok) {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
      }
    }

    const data = {
      uid: user.uid,
      email: user.email,
      teams: formData.teams,
      whyCc: formData.whyCc,
      whyThisPosition: formData.whyThisPosition,
      ideas1: formData.ideas1,
      ideas: formData.ideas,
      goodFit: formData.goodFit,
      otherBodies: formData.otherBodies,
      designExperience: formData?.designExperience || null,
    };

    // Map the team names to their respective IDs at position 1
    data.teams = data.teams.map(
      (team) => availableTeams.find((t) => t[0] === team)[1],
    );

    let res = await ccRecruitmentsApply(data);

    if (res.ok) {
      triggerToast({
        severity: "success",
        message: "Application submitted successfully!",
      });
      setSubmitted(true);
    } else {
      triggerToast({
        severity: "error",
        message: "Failed to submit application!",
      });
    }

    setLoading(false);
  }

  return (
    <>
      {submiited ? (
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{
            mt: 6,
          }}
        >
          Thank you for your interest in applying for a Clubs Council Position.
          Your application has been successfully submitted. You will be notified
          about the next stages of the process shortly.
        </Typography>
      ) : !allowedBatches.includes(user.batch) ? (
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{
            mt: 6,
          }}
        >
          You are not eligible to apply for Clubs Council Position this year.
          <br />
          Please contact the Clubs Council for more information.
        </Typography>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid
              container
              spacing={3}
              size={{
                xs: 12,
                md: 12,
                xl: 12,
              }}
            >
              <Grid container>
                <Typography
                  variant={isDesktop ? "subtitle2" : "subtitle1"}
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  User Details
                </Typography>
                <Grid container spacing={4}>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    <MemberUserInput user={user} />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    <TextField
                      label="Roll No"
                      variant="outlined"
                      value={user.rollno || "Unknown"}
                      fullWidth
                      required
                      disabled
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    <TextField
                      label="Batch"
                      variant="outlined"
                      value={user.batch.toUpperCase() || "Unknown"}
                      fullWidth
                      required
                      disabled
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    <TextField
                      label="Stream"
                      variant="outlined"
                      value={user.stream.toUpperCase() || "Unknown"}
                      fullWidth
                      required
                      disabled
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {user?.phone ? (
                      <TextField
                        label="Phone number"
                        variant="outlined"
                        value={user.phone || "Unknown"}
                        fullWidth
                        required
                        disabled
                      />
                    ) : (
                      <Controller
                        name="phone"
                        control={control}
                        rules={{
                          validate: {
                            checkPhoneNumber: (value) => {
                              if (!value || value === "") return true;
                              try {
                                const phoneNumber = parsePhoneNumberWithError(
                                  value,
                                  {
                                    defaultCountry: "IN",
                                  },
                                );
                                return (
                                  isValidPhoneNumber(value, "IN") ||
                                  "Invalid Phone Number!"
                                );
                              } catch (error) {
                                return error.message;
                              }
                            },
                          },
                          required: "Phone number is required!",
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
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid container>
                <Typography
                  variant={isDesktop ? "subtitle2" : "subtitle1"}
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Team Specific Details
                </Typography>
                <Grid container spacing={2} direction="column">
                  {roles.map((role, index) => (
                    <Grid key={index}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                        }}
                      >
                        {role.title}
                      </Typography>
                      {role.points.map((point, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          color="textSecondary"
                        >
                          - {point}
                        </Typography>
                      ))}
                    </Grid>
                  ))}
                  <Grid
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      Note:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Initially, you will be assigned to a specific team, but
                      over time, you will gain experience in different teams to
                      develop a well-rounded understanding, ensuring that
                      everyone can work collectively and effectively
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={4}
                  sx={{
                    pt: 3,
                  }}
                >
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    <Controller
                      name="teams"
                      control={control}
                      defaultValue={[]}
                      rules={{
                        validate: {
                          checkTeams: (value) =>
                            value.length > 0 || "Select at least one team!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <FormControl fullWidth>
                          <InputLabel id="teams-label">Select Teams</InputLabel>
                          <Select
                            id="teams"
                            labelId="teams-label"
                            multiple
                            input={<OutlinedInput label="Select Teams" />}
                            error={invalid}
                            renderValue={(selected) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {selected.map((value) => (
                                  <Chip key={value} label={value} />
                                ))}
                              </Box>
                            )}
                            {...field}
                          >
                            {availableTeams
                              ?.slice()
                              ?.sort()
                              ?.map((team) => (
                                <MenuItem key={team[0]} value={team[0]}>
                                  {team[0]}
                                </MenuItem>
                              ))}
                          </Select>
                          <FormHelperText error={invalid}>
                            {error?.message}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {isDesktop ? null : (
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Why did you choose the team(s) you have chosen?
                      </Typography>
                    )}
                    <Controller
                      name="whyThisPosition"
                      control={control}
                      rules={{
                        required: "Need to provide a reason!",
                        maxLength: {
                          value: 4000,
                          message: "Must be at most 4000 characters long!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <TextField
                          {...field}
                          label={
                            isDesktop
                              ? "Why did you choose the team(s) you have chosen?"
                              : null
                          }
                          autoComplete="off"
                          error={invalid}
                          helperText={error?.message}
                          variant="outlined"
                          rows={5}
                          fullWidth
                          multiline
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid container>
                <Typography
                  variant={isDesktop ? "subtitle2" : "subtitle1"}
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Other Details
                </Typography>
                <Grid container spacing={4}>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {isDesktop ? null : (
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Why do you want to be a part of the Clubs Council? Tell
                        us about your vision and improvements you wish to make.
                      </Typography>
                    )}
                    <Controller
                      name="whyCc"
                      control={control}
                      rules={{
                        required: "Need to provide a reason!",
                        maxLength: {
                          value: 6000,
                          message: "Must be at most 6000 characters long!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <TextField
                          {...field}
                          label={
                            isDesktop
                              ? "Why do you want to be a part of the Clubs Council? Tell us about your vision and improvements you wish to make."
                              : null
                          }
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
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {isDesktop ? null : (
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Why do you believe you are a good fit for the position
                        you are applying to?
                      </Typography>
                    )}
                    <Controller
                      name="goodFit"
                      control={control}
                      rules={{
                        required: "Need to provide a reason!",
                        maxLength: {
                          value: 6000,
                          message: "Must be at most 6000 characters long!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <TextField
                          {...field}
                          label={
                            isDesktop
                              ? "Why do you believe you are a good fit for the position you are applying to?"
                              : null
                          }
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
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {isDesktop ? null : (
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Have you been a part of any student-run bodies or clubs
                        in our campus? If yes, tell us about your experience.
                      </Typography>
                    )}
                    <Controller
                      name="otherBodies"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 4000,
                          message: "Must be at most 4000 characters long!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <TextField
                          {...field}
                          label={
                            isDesktop
                              ? "Have you been a part of any student-run bodies or clubs in our campus? If yes, tell us about your experience."
                              : null
                          }
                          autoComplete="off"
                          error={invalid}
                          helperText={error?.message}
                          variant="outlined"
                          rows={5}
                          fullWidth
                          multiline
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {isDesktop ? null : (
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Did you often want to take part in an event, but
                        couldn&apos;t or didn&apos;t? What were the reasons? Why
                        do you think that happened?
                      </Typography>
                    )}
                    <Controller
                      name="ideas1"
                      control={control}
                      rules={{
                        required: "Compulsory Field!",
                        maxLength: {
                          value: 5000,
                          message: "Must be at most 5000 characters long!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <TextField
                          {...field}
                          label={
                            isDesktop
                              ? "Did you often want to take part in an event, but couldn't or didn't? What were the reasons? Why do you think that happened?."
                              : null
                          }
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
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 12,
                      xl: 12,
                    }}
                  >
                    {isDesktop ? null : (
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                          mb: 2,
                        }}
                      >
                        Tell us more about your ideas and thoughts to improve
                        campus life (wrt. club activities) at IIIT Hyderabad.
                      </Typography>
                    )}
                    <Controller
                      name="ideas"
                      control={control}
                      rules={{
                        required: "Compulsory Field!",
                        maxLength: {
                          value: 5000,
                          message: "Must be at most 5000 characters long!",
                        },
                      }}
                      render={({ field, fieldState: { error, invalid } }) => (
                        <TextField
                          {...field}
                          label={
                            isDesktop
                              ? "Tell us more about your ideas and thoughts to improve campus life (wrt. club activities) at IIIT Hyderabad."
                              : null
                          }
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
                  </Grid>
                  {teams?.includes("Design") && (
                    <Grid
                      size={{
                        xs: 12,
                        md: 12,
                        xl: 12,
                      }}
                    >
                      {isDesktop ? null : (
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{
                            textTransform: "uppercase",
                            color: "text.secondary",
                            mb: 2,
                          }}
                        >
                          Share your design experience.
                        </Typography>
                      )}
                      <Controller
                        name="designExperience"
                        control={control}
                        rules={{
                          required: "This field is required for Design Team!",
                          maxLength: {
                            value: 2000,
                            message: "Must be at most 2000 characters long!",
                          },
                        }}
                        render={({ field, fieldState: { error, invalid } }) => (
                          <TextField
                            {...field}
                            label={
                              isDesktop ? "Share your design experience." : null
                            }
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
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid container>
                <Typography
                  variant={isDesktop ? "subtitle2" : "subtitle1"}
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Final Submission
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    mb: 2,
                  }}
                >
                  &quot;By pressing the submit button, I specify that I have
                  filled the form by myself with utmost honesty, and I want to
                  apply to the Clubs Council, as mentioned in my application. I
                  am fine with sharing of my responses with any of the Clubs
                  Council team member for the process itself.&quot;
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    mb: 2,
                  }}
                >
                  <i>
                    You won&apos;t be able to edit your response after
                    submission, so have a look at it once more.
                  </i>{" "}
                  The form responses will remain anonymous, and won&apos;t be
                  shared with anyone outside of Clubs Council.
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    mb: 2,
                  }}
                >
                  <b>Selection:</b> Interested members who fill this form will
                  be called for an interview with the incumbent Clubs Council
                  team, and members will be selected in consultation with the
                  SLC Chair and the SAC Chair.
                </Typography>
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
                  Cancel
                </Button>

                <ConfirmDialog
                  open={cancelDialog}
                  title="Confirm cancellation"
                  description="Are you sure you want to cancel? Any unsaved changes will be lost."
                  onConfirm={() => location.reload()}
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
                  onClick={() =>
                    handleSubmit((data) =>
                      onSubmit(data, { shouldSubmit: true }),
                    )()
                  }
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
}
