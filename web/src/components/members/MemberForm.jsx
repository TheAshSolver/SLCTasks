"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Controller, useForm, useWatch } from "react-hook-form";

import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useAuth } from "components/AuthProvider";
import ConfirmDialog from "components/ConfirmDialog";
import Icon from "components/Icon";
import MemberPositions from "components/members/MemberPositions";
import { useToast } from "components/Toast";
import UserImage from "components/users/UserImage";

import { getActiveClubIds } from "actions/clubs/ids/server_action";
import { createMemberAction } from "actions/members/create/server_action";
import { editMemberAction } from "actions/members/edit/server_action";
import { getUsers } from "actions/users/get/server_action";

export default function MemberForm({ defaultValues = {}, action = "log" }) {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [userMember, setUserMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [mobileDialog, setMobileDialog] = useState(isMobile);
  const [positionEditing, setPositionEditing] = useState(false);

  const { control, setValue, handleSubmit } = useForm({ defaultValues });
  const { triggerToast } = useToast();

  // different form submission handlers
  const submitHandlers = {
    log: console.log,
    create: async (data) => {
      let res = await createMemberAction(data);

      if (res.ok) {
        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Member added."],
          severity: "success",
        });
        router.push(`/manage/members?club=${data.cid}`);
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
      let res = await editMemberAction(data);

      if (res.ok) {
        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Member edited."],
          severity: "success",
        });
        router.push(`/manage/members?club=${data.cid}`);
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
      cid: formData.cid,
      uid: formData.uid,
      poc: formData.poc,
    };

    // set club ID for member based on user role
    if (user?.role === "club") {
      data.cid = user?.uid;
    } else if (user?.role === "cc") {
      data.cid = formData.cid;
    }

    // show error toast if uid is empty
    if (!data.uid) {
      setLoading(false);
      return triggerToast({
        title: "Error!",
        messages: [
          "User has not been confirmed! Enter a valid email and click the 👍 button to confirm.",
        ],
        severity: "error",
      });
    }

    // convert roles to array of objects with only required attributes
    // remove roles items without a name (they're invalid)
    data.roles = formData.roles
      .filter((i) => i?.name)
      .map((i) => ({
        name: i.name,
        startYear: parseInt(i.startYear),
        endYear: i.endYear === "-" ? null : parseInt(i.endYear),
      }));

    // // Check if roles increases the character limit of 99
    if (data.roles.some((role) => role.name.length > 99)) {
      setLoading(false);
      return triggerToast({
        title: "Error!",
        messages: [
          "One or more roles have a name that exceeds the character limit of 99.",
        ],
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
          size={{
            xs: 12,
            md: 7,
            xl: 8,
          }}
        >
          {user?.role === "cc" ? (
            <Grid size={12}>
              <MemberClubSelect control={control} edit={action === "edit"} />
            </Grid>
          ) : null}

          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 2,
              mt: 3,
            }}
          >
            User
          </Typography>
          <Grid size={12}>
            <MemberUserInput
              control={control}
              setValue={setValue}
              user={userMember}
              setUser={setUserMember}
            />
          </Grid>

          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 2,
              mt: 3,
            }}
          >
            Positions
          </Typography>
          <Grid size={12}>
            <MemberPositionsTable
              control={control}
              positionEditing={positionEditing}
              setPositionEditing={setPositionEditing}
            />
          </Grid>
        </Grid>

        <Grid
          sx={{
            alignItems: "flex-start",
          }}
          size={{
            xs: "grow",
            md: "grow",
          }}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            Other
          </Typography>
          <Grid spacing={2}>
            <Grid size={12}>
              <MemberPOCSwitch control={control} />
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
                disabled={positionEditing || !userMember}
              >
                Save
              </Button>
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
    </form>
  );
}

// find user by email
function MemberUserInput({ control, setValue, user, setUser }) {
  const { triggerToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const uid = useWatch({
    control,
    name: "uid",
  });

  const getUser = async () => {
    let res = await getUsers(uid);

    if (res.ok) {
      // set current user
      setUser(res.data);
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    (async () => {
      // console.log("UID changed:", uid);
      if (uid) await getUser();
    })();
  }, [uid]);

  return user ? (
    <Stack
      direction="row"
      spacing={isMobile ? 2 : 4}
      sx={{
        alignItems: "center",
      }}
    >
      <UserImage
        image={user.img}
        name={user.firstName}
        gender={user.gender}
        width={isMobile ? 50 : 80}
        height={isMobile ? 50 : 80}
      />
      <Stack direction="column" spacing={1}>
        <Typography variant="h4" sx={{ wordBreak: "break-word" }}>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontFamily: "monospace",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {user.email}
        </Typography>
      </Stack>
    </Stack>
  ) : (
    <Controller
      name="userSelector"
      control={control}
      defaultValue=""
      render={({ field }) => (
        <Stack direction="row" spacing={1}>
          <TextField
            {...field}
            type="email"
            label="Email"
            autoComplete="off"
            variant="outlined"
            helperText={
              "Click the 👍 button to confirm the user and verify their email"
            }
            fullWidth
            required
          />
          <Button
            color="primary"
            variant="contained"
            onClick={() => setValue("uid", field.value?.split("@")[0])}
          >
            <Icon variant="thumb-up-outline-rounded" />
          </Button>
        </Stack>
      )}
    />
  );
}

// select club to which member belongs to
function MemberClubSelect({ control, edit }) {
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

  return (
    <Controller
      name="cid"
      control={control}
      rules={{ required: "Select a club!" }}
      render={({ field, fieldState: { error, invalid } }) => (
        <FormControl fullWidth error={invalid}>
          <InputLabel id="cid">Club *</InputLabel>
          <Select
            labelId="cid"
            label="Club/Body *"
            fullWidth
            disabled={edit}
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

// input event budget as a table
function MemberPositionsTable({
  control,
  positionEditing,
  setPositionEditing,
}) {
  // TODO: watch for uid & cid change, populate table with existing data
  // [AFTER create and edit member mutations have been merged into one]

  return (
    <Controller
      name="roles"
      control={control}
      render={({ field: { value, onChange } }) => (
        <MemberPositions
          editable
          rows={value}
          setRows={onChange}
          positionEditing={positionEditing}
          setPositionEditing={setPositionEditing}
        />
      )}
    />
  );
}

// switch for member POC status
function MemberPOCSwitch({ control }) {
  // TODO: watch for uid & cid change, populate table with existing data
  // [AFTER create and edit member mutations have been merged into one]

  return (
    <Controller
      name="poc"
      control={control}
      render={({ field }) => (
        <FormGroup row>
          <FormControlLabel
            value="left"
            control={
              <Switch color="primary" checked={field.value} {...field} />
            }
            label="Point of Contact"
            labelPlacement="left"
          />
        </FormGroup>
      )}
    />
  );
}
