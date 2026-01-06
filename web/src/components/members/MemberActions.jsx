"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import { useToast } from "components/Toast";

import { approveMemberAction } from "actions/members/approve/server_action";
import { deleteMemberAction } from "actions/members/delete/server_action";

export function EditMember({ sx }) {
  const { id } = useParams();

  return (
    <Button
      component={ButtonLink}
      href={`/manage/members/${id}/edit`}
      variant="contained"
      color="warning"
      startIcon={<Icon variant="edit-outline" />}
      sx={sx}
    >
      Edit
    </Button>
  );
}

export function DeleteMember({ sx }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [dialog, setDialog] = useState(false);

  const deleteMember = async () => {
    let res = await deleteMemberAction({
      cid: id?.split(encodeURIComponent(":"))[0],
      uid: id?.split(encodeURIComponent(":"))[1],
      rid: null,
    });

    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Member deleted."],
        severity: "success",
      });
      router.push("/manage/members");
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
        title="Are you sure you want to delete this member?"
        description="This action cannot be undone."
        onConfirm={deleteMember}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "error" }}
        confirmText="Yes, delete it"
      />
    </>
  );
}

export function ApproveAllMember({ sx }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [dialog, setDialog] = useState(false);

  const approveMember = async () => {
    let res = await approveMemberAction({
      cid: id?.split(encodeURIComponent(":"))[0],
      uid: id?.split(encodeURIComponent(":"))[1],
      rid: null,
    });

    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Membership approved."],
        severity: "success",
      });
      router.push("/manage/members");
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "primary",
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
        Approve All Roles
      </Button>

      <ConfirmDialog
        open={dialog}
        title="Are you sure you want to approve all the roles of this member?"
        description="This action cannot be undone."
        onConfirm={approveMember}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "success" }}
        confirmText="Yes, approve them"
      />
    </>
  );
}
