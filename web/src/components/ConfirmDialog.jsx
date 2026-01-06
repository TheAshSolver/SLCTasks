"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmProps = {},
  confirmText = "Confirm",
  cancelText = "Cancel",
  addCancel = true,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText color="text.secondary">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {addCancel ? (
          <Button onClick={onClose}>
            <Typography
              variant="button"
              sx={{
                color: "text.disabled",
              }}
            >
              {cancelText}
            </Typography>
          </Button>
        ) : null}
        <Button onClick={onConfirm} {...confirmProps}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
