"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button, Tooltip } from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import { useToast } from "components/Toast";

import { deleteEventAction } from "actions/events/delete/server_action";
import { eventProgress } from "actions/events/progress/server_action";
import { eventReminder } from "actions/events/reminder/server_action";

export function EditEvent({ sx }) {
  const { id } = useParams();

  return (
    <Button
      component={ButtonLink}
      href={`/manage/events/${id}/edit`}
      variant="contained"
      color="warning"
      startIcon={<Icon variant="edit-outline" />}
      sx={sx}
    >
      Edit
    </Button>
  );
}

export function EditFinances({ sx }) {
  const { id } = useParams();

  return (
    <Button
      component={ButtonLink}
      href={`/manage/finances/${id}`}
      variant="contained"
      color="warning"
      startIcon={<Icon variant="edit-outline" />}
      sx={sx}
    >
      Edit Bills Status
    </Button>
  );
}

export function CopyEvent({ sx }) {
  const { id } = useParams();

  return (
    <Button
      component={ButtonLink}
      href={`/manage/events/${id}/copy`}
      variant="contained"
      color="grey"
      startIcon={<Icon variant="content-copy-outline" />}
      sx={sx}
    >
      Copy Event
    </Button>
  );
}

export function DeleteEvent({ sx }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [dialog, setDialog] = useState(false);

  const deleteEvent = async () => {
    let res = await deleteEventAction(id);

    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Event deleted."],
        severity: "success",
      });
      router.push("/manage/events");
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        startIcon={<Icon variant="delete-forever-outline" />}
        onClick={() => setDialog(true)}
        sx={sx}
      >
        Delete
      </Button>

      <ConfirmDialog
        open={dialog}
        title="Are you sure you want to delete this event?"
        description="Deleting the event will mark it as deleted and hidden from the public. This action cannot be undone."
        onConfirm={deleteEvent}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "error" }}
        confirmText="Yes, delete it"
      />
    </>
  );
}

export function SubmitEvent({ sx, isReportSubmitted = true }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();

  const tooltipText = !isReportSubmitted
    ? "You haven't submitted the previous event report"
    : "";

  const submitEvent = async () => {
    let res = await eventProgress({
      eventid: id,
    });

    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Event submitted."],
        severity: "success",
      });
      router.refresh();
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }
  };

  return (
    <Tooltip title={tooltipText} disableHoverListener={!tooltipText}>
      <span>
        <Button
          variant="contained"
          color="info"
          startIcon={<Icon variant="thumb-up-outline-rounded" />}
          onClick={submitEvent}
          disabled={!isReportSubmitted}
          sx={sx}
        >
          Submit
        </Button>
      </span>
    </Tooltip>
  );
}

export function ApproveEvent({ sx }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [dialog, setDialog] = useState(false);

  const approveEvent = async () => {
    // console.log("requested approvals:", SLC, SLO);
    let res = await eventProgress({
      eventid: id,
    });
    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Event approved."],
        severity: "success",
      });
      router.refresh();
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        startIcon={<Icon variant="done" />}
        onClick={() => setDialog(true)}
        sx={sx}
      >
        Approve
      </Button>

      <ConfirmDialog
        open={dialog}
        title="Are you sure you want to approve this event?"
        description="This action cannot be undone."
        onConfirm={approveEvent}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "success" }}
        confirmText="Yes, approve it"
      />
    </>
  );
}
export function LocationClashApproval({ sx }) {
  const [dialog, setDialog] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        color="warning"
        startIcon={<Icon variant="done" />}
        onClick={() => setDialog(true)}
        sx={sx}
      >
        Approve
      </Button>

      <ConfirmDialog
        open={dialog}
        title="Location Clash Detected"
        description="The location selected for this event is clashing with another booking. Please change the location before approval."
        onConfirm={() => setDialog(false)}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "warning" }}
        confirmText="Close"
      />
    </>
  );
}
export function ProgressEvent({ sx }) {
  const { id } = useParams();
  return (
    <Button
      component={ButtonLink}
      href={`/manage/events/${id}/approve_cc`}
      variant="contained"
      color="secondary"
      startIcon={<Icon variant="add" />}
      sx={sx}
    >
      Progress
    </Button>
  );
}

export function RequestReminder({ sx }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [dialog, setDialog] = useState(false);

  const remindEvent = async () => {
    // console.log("requested approvals:", SLC, SLO);
    let res = await eventReminder({
      eventid: id,
    });
    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Reminder Sent!."],
        severity: "success",
      });
      router.refresh();
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }

    setDialog(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Icon variant="add" />}
        onClick={() => setDialog(true)}
        sx={sx}
      >
        Send Reminder
      </Button>

      <ConfirmDialog
        open={dialog}
        title="Do you really want to send a reminder to SLO?"
        description="Avoid sending multiple reminders in a short period. This action cannot be undone."
        onConfirm={remindEvent}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "success" }}
        confirmText="Yes"
      />
    </>
  );
}
