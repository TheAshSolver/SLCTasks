"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import { useToast } from "components/Toast";

import { deleteClubAction } from "actions/clubs/delete/server_action";

export function EditClub({ sx }) {
  const { id } = useParams();

  return (
    <Button
      component={ButtonLink}
      href={`/manage/clubs/${id}/edit`}
      variant="contained"
      color="warning"
      startIcon={<Icon variant="edit-outline" />}
      sx={sx}
    >
      Edit
    </Button>
  );
}

export function DeleteClub({ sx }) {
  const router = useRouter();
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [dialog, setDialog] = useState(false);

  const deleteClub = async () => {
    let res = await deleteClubAction(id);

    if (res.ok) {
      // show success toast & redirect to manage page
      triggerToast({
        title: "Success!",
        messages: ["Club deleted."],
        severity: "success",
      });
      router.push("/manage/clubs");
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
        title="Are you sure you want to delete this club?"
        description="Deleting the club will mark it as deleted and hidden from the public. This action cannot be undone (for now)."
        onConfirm={deleteClub}
        onClose={() => setDialog(false)}
        confirmProps={{ color: "error" }}
        confirmText="Yes, delete it"
      />
    </>
  );
}

export function UnDeleteClub({ sx }) {
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        color="success"
        startIcon={<Icon variant="restore-page-outline" />}
        onClick={() => setDialog(true)}
        sx={sx}
      >
        Restore
      </Button>

      <ConfirmDialog
        open={dialog}
        title="Do you want to restore this club?"
        description="Please contact Tech Team for this operation. This operation is not directly available."
        onConfirm={() => setDialog(false)}
        confirmText="Understood"
        addCancel={false}
      />
    </>
  );
}
