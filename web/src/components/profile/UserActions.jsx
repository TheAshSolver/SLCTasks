"use client";

import { useParams } from "next/navigation";

import { Button } from "@mui/material";

import Icon from "components/Icon";
import ButtonLink from "components/Link";

export function EditUser({ sx }) {
  const { id } = useParams();

  return (
    <Button
      component={ButtonLink}
      href={`/profile/${id}/edit`}
      variant="contained"
      color="warning"
      startIcon={<Icon variant="edit-outline" />}
      sx={sx}
    >
      Edit
    </Button>
  );
}
