"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Controller, useForm } from "react-hook-form";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import Icon from "components/Icon";
import MemberListItem from "components/members/MemberListItem";
import { useToast } from "components/Toast";

import { eventProgress } from "actions/events/progress/server_action";
import { rejectEventAction } from "actions/events/reject/server_action";
import { getUserByRole } from "actions/users/get/role/server_action";

function EventApproveForm({ eventid, members, clashFlag }) {
  const { triggerToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      SLC: false,
      SLO: false,
      approver: "",
    },
  });

  const watchSLC = watch("SLC");
  const [slcMembers, setSlcMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (watchSLC && slcMembers.length === 0) {
        let res = await getUserByRole("slc");

        if (res.ok) {
          setSlcMembers(res.data);
        } else {
          triggerToast({
            ...res.error,
            severity: "error",
          });
        }
      }
    };
    fetchData();
  }, [watchSLC]);

  async function handleApprove(formData) {
    setLoading(true);

    let cc_progress_budget = !formData.SLC;
    let cc_progress_room = !formData.SLO;
    let approver = formData.approver;
    let slc_members_for_email = formData.slcMembersForEmail;

    let res = await eventProgress({
      eventid: eventid,
      cc_progress_budget: cc_progress_budget,
      cc_progress_room: cc_progress_room,
      cc_approver: approver,
      slc_members_for_email: slc_members_for_email,
    });
    if (res.ok) {
      triggerToast("Event approved", "success");
      router.push(`/manage/events/${eventid}`);
    } else {
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }

    setLoading(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleApprove)}>
        <Controller
          name="SLC"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox {...field} checked={field.value} color="success" />
              }
              label="Request SLC approval"
            />
          )}
        />
        {watchSLC ? (
          <>
            <p></p>
            <Controller
              name="slcMembersForEmail"
              control={control}
              defaultValue={[]}
              rules={{ required: "Select atleast one SLC Member!" }}
              render={({ field, fieldState: { error, invalid } }) => (
                <FormControl variant="outlined" fullWidth error={invalid}>
                  <InputLabel id="approver-label">
                    SLC Members to Send Email
                  </InputLabel>
                  {slcMembers.length === 0 ? (
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
                      multiple
                      labelId="poc"
                      label="SLC Members to Send Email"
                      fullWidth
                      {...field}
                      MenuProps={{
                        style: { maxHeight: 400, marginBottom: 50 },
                      }}
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
                              label={
                                <MemberListItem uid={value} showEmail={false} />
                              }
                              sx={{ marginBottom: 1 }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {slcMembers?.slice()?.map((member) => (
                        <MenuItem
                          key={member.uid}
                          value={member.uid}
                          component="div"
                        >
                          <MemberListItem uid={member.uid} />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                  <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </>
        ) : null}
        <p></p> {/* For New line */}
        <Divider />
        <p></p> {/* For New line */}
        <Controller
          name="SLO"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox {...field} checked={field.value} color="success" />
              }
              label="Request SLO approval"
            />
          )}
        />
        <p></p> {/* For New line */}
        <Divider />
        <p></p> {/* For New line */}
        <Controller
          name="approver"
          control={control}
          rules={{ required: "Select a member!" }}
          render={({ field, fieldState: { error, invalid } }) => (
            <FormControl variant="outlined" fullWidth error={invalid}>
              <InputLabel id="approver-label">Approver</InputLabel>
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
                  labelId="poc"
                  label="Approver"
                  fullWidth
                  {...field}
                  MenuProps={{
                    style: { maxHeight: 400 },
                  }}
                >
                  {members?.slice()?.map((member) => (
                    <MenuItem
                      key={member.uid}
                      value={member.uid}
                      component="div"
                    >
                      <MemberListItem uid={member.uid} />
                    </MenuItem>
                  ))}
                </Select>
              )}
              <FormHelperText>{error?.message}</FormHelperText>
            </FormControl>
          )}
        />
        <p></p> {/* For New line */}
        <Button
          loading={loading}
          type="submit"
          size="large"
          variant="contained"
          color="success"
          startIcon={<Icon variant="done" />}
          disabled={clashFlag}
        >
          Approve
        </Button>
        <Typography
          variant="caption"
          sx={{ ml: 1, color: clashFlag ? "error.main" : "text.secondary" }}
        >
          {clashFlag
            ? "(Location of this event is clashing with some other approved event in the same time period. Please edit or reject.)"
            : "(This action cannot be undone.)"}
        </Typography>
      </form>
    </>
  );
}

function EventRejectForm({ eventid }) {
  const { triggerToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      reason: "Some logical & valid reason...",
    },
  });

  async function handleReject(formData) {
    setLoading(true);

    let res = await rejectEventAction({
      eventid: eventid,
      reason: formData.reason,
    });

    if (res.ok) {
      triggerToast("Event rejected", "success");
      router.push(`/manage/events/${eventid}`);
    } else {
      triggerToast({
        ...res.error,

        severity: "error",
      });
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(handleReject)}>
      <Controller
        name="reason"
        control={control}
        rules={{
          required: "Rejection reason is required",
          minLength: {
            value: 10,
            message: "Reason must be at least 10 characters long",
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error}>
            <TextField
              {...field}
              label="Rejection Reason"
              multiline
              rows={4}
              variant="outlined"
              error={!!error}
              helperText={error ? error.message : null}
            />
          </FormControl>
        )}
      />

      <Box sx={{ mt: 2 }}>
        <Button
          loading={loading}
          type="submit"
          size="large"
          variant="contained"
          color="error"
          startIcon={<Icon variant="close"></Icon>}
        >
          Reject
        </Button>
        <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
          (This action cannot be undone.)
        </Typography>
      </Box>
    </form>
  );
}

export default function EventActionTabs({ eventid, members, clashFlag }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Approve Event" />
        <Tab label="Reject Event" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {selectedTab === 0 ? (
          <EventApproveForm
            eventid={eventid}
            members={members}
            clashFlag={clashFlag}
          />
        ) : (
          <EventRejectForm eventid={eventid} />
        )}
      </Box>
    </Box>
  );
}
