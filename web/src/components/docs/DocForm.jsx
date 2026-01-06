"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Controller, useForm } from "react-hook-form";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import FileUpload from "components/FileUpload";
import Icon from "components/Icon";
import { useToast } from "components/Toast";
import { uploadPDFFile } from "utils/files";

import { createStorageFile } from "actions/storagefiles/create/server_action";
import { deleteStorageFile } from "actions/storagefiles/delete/server_action";
import { updateStorageFile } from "actions/storagefiles/update/server_action";

const maxFileSizeMB = 20;

export default function DocForm({ editFile = null, newFile = true }) {
  const [loading, setLoading] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      title: editFile?.title || "",
      file: null,
    },
  });

  const { triggerToast } = useToast();
  const router = useRouter();
  const fileDropzone = watch("file");

  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  async function handleDeleteConfirm() {
    try {
      if (!editFile) {
        throw new Error("File not found to delete");
      }
      const res = await deleteStorageFile(editFile._id);
      if (!res.ok) {
        throw res.error;
      }
      triggerToast({
        title: "Success!",
        messages: ["Document deleted."],
        severity: "success",
      });
      router.push(`/docs`);
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error.message
          ? [error.message]
          : error?.messages || ["Failed to delete document"],
        severity: "error",
      });
    } finally {
      closeDeleteDialog();
    }
  }

  async function onSubmit(data) {
    setLoading(true);

    try {
      // check all fields
      if (!data.title || !data.file) {
        throw new Error(
          "Please fill all the required Fields before submitting.",
        );
      }

      const filename = await uploadPDFFile(
        data.file[0],
        true,
        data.title +
          "_v" +
          (newFile ? 1 : handleVersionNumbering(editFile)).toString(),
        maxFileSizeMB,
      );
      if (!filename) {
        throw new Error("File upload failed, check Title and File validity");
      }

      // Extract out file extension from filename
      const fileType = filename.split(".").pop();
      const fileName = filename
        .split(".")
        .slice(0, -1)
        .join(".")
        .replace(/_v\d+$/, "");

      if (newFile) {
        // create doc
        const res = await createStorageFile({
          title: data.title,
          filename: fileName,
          filetype: fileType,
        });
        if (!res.ok) {
          throw res.error;
        }
      } else {
        const newVersion = handleVersionNumbering(editFile);
        // update existing doc
        const res = await updateStorageFile(editFile._id, newVersion);
        if (!res.ok) {
          throw new Error("Updating file to database failed!");
        }
      }

      triggerToast({
        title: "Success!",
        messages: ["Document saved."],
        severity: "success",
      });
      router.push(`/docs`);
    } catch (error) {
      triggerToast({
        title: "Error",
        messages: error?.message
          ? [error.message]
          : error?.messages || ["Failed to save document"],
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitButton = () => {
    if (newFile) {
      handleSubmit((data) => onSubmit(data))();
    } else {
      setSubmitDialogOpen(true);
    }
  };

  const generateSubmitDescription = () => {
    if (newFile) return null;

    const latestVersion = editFile?.latestVersion || 1;
    const newVersion = handleVersionNumbering(editFile);

    if (latestVersion === newVersion)
      return `This will overwrite the existing v${latestVersion} file (as last-updated in <24 hours). Are you sure you want to proceed?`;
    else return `This will create a new version v${newVersion} of the file.`;
  };

  return (
    <>
      <Grid
        container
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" sx={{ p: 2 }}>
          Upload File
        </Typography>
        {!newFile ? (
          <Button
            variant="contained"
            align="right"
            sx={{ minWidth: 100, minHeight: 50, m: 3 }}
            color="error"
            onClick={openDeleteDialog}
            startIcon={<Icon variant="delete" />}
          >
            Delete
          </Button>
        ) : null}
      </Grid>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid
            sx={{
              m: 1,
            }}
            size={12}
          >
            <Controller
              name="title"
              control={control}
              rules={{
                required: "Title is required",
              }}
              render={({ field, fieldState: { error, invalid } }) => (
                <TextField
                  {...field}
                  label="Title"
                  variant="outlined"
                  fullWidth
                  error={invalid}
                  helperText={error?.message}
                  disabled={!newFile}
                  required
                />
              )}
            />
          </Grid>
          <Grid
            sx={{
              alignItems: "center",
              m: 1,
            }}
            size={12}
          >
            <FileUpload
              name="file"
              label="File Upload"
              type="document"
              control={control}
              maxFiles={1}
              maxSizeMB={maxFileSizeMB}
            />
          </Grid>
          <Grid size={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                loading={loading}
                // type="submit"
                onClick={handleSubmitButton}
                variant="contained"
                color="primary"
                disabled={loading || !fileDropzone}
              >
                Save
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      <ConfirmDialog
        open={submitDialogOpen}
        title="Confirm submission"
        description={generateSubmitDescription()}
        onConfirm={() => handleSubmit((data) => onSubmit(data))()}
        onClose={() => setSubmitDialogOpen(false)}
        confirmProps={{ color: "primary" }}
        confirmText="Proceed"
      />
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this file? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const handleVersionNumbering = (oldFile) => {
  const latestVersion = oldFile.latestVersion;

  // Parse the modified time (IST) and convert it to UTC
  const modifiedTimeIST = oldFile.modifiedTime.replace(" ", "T") + "+05:30";
  const modifiedDate = new Date(modifiedTimeIST);

  if (isNaN(modifiedDate)) {
    throw new Error("Invalid date format for modifiedTime");
  }

  // Get the current UTC time
  const currentDate = new Date();

  // Calculate the difference in hours
  const diffInHours = Math.abs(currentDate - modifiedDate) / 36e5;

  // Return the version number based on the time difference
  if (diffInHours < 24) {
    return latestVersion;
  } else {
    return latestVersion + 1;
  }
};
