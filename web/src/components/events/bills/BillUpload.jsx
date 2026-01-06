"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Controller, useForm } from "react-hook-form";

import { Box, Button, Grid, Typography } from "@mui/material";

import ConfirmDialog from "components/ConfirmDialog";
import FileUpload from "components/FileUpload";
import { useToast } from "components/Toast";
import { uploadPDFFile } from "utils/files";

import { eventBillUpload } from "actions/events/bills/bill-upload/server_action";

import EventBudget from "../EventBudget";

const maxFileSizeMB = 20;

export const validateBillno = (value) => {
  if (!value) return true; // Allow empty values
  return /^[A-Z0-9 _,\-#()/;]+$/.test(value);
};

export default function BillUpload(params) {
  const { eventid, eventCode, budgetRows } = params;
  const [loading, setLoading] = useState(false);
  const [budgetEditing, setBudgetEditing] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      file: null,
      budget: budgetRows,
    },
  });

  const { triggerToast } = useToast();
  const router = useRouter();
  const fileDropzone = watch("file");

  async function onSubmit(data) {
    setLoading(true);

    try {
      // check all fields
      if (!data.file || !data.budget) {
        throw new Error("Please upload a file before proceeding.");
      }
      // convert budget data values to required format
      const budget = data.budget.map((i) => ({
        description: i.description,
        amount: i.amount,
        advance: i.advance,
        billno: i.billno,
        amountUsed: i.amountUsed,
      }));

      const filename = await uploadPDFFile(
        data.file[0],
        false,
        eventCode + "_bill",
        maxFileSizeMB,
      );
      if (!filename) {
        throw new Error("File upload failed, check Title and File validity");
      }

      // send pdf to backend
      const res = await eventBillUpload({
        eventid: eventid,
        filename: filename,
        budget: budget,
      });
      if (!res.ok) {
        throw res.error;
      }

      triggerToast({
        title: "Success!",
        messages: ["Bill saved."],
        severity: "success",
      });
      router.push(`/manage/events/${eventid}`);
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
    setSubmitDialogOpen(true);
  };

  return (
    <>
      <Grid
        container
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      ></Grid>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
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
            <Typography
              variant="h4"
              sx={{
                mt: 3,
              }}
            >
              Breakdown and bill details
            </Typography>
            <Box
              sx={{
                m: 1,
              }}
            >
              <Controller
                name="budget"
                control={control}
                rules={{
                  validate: {
                    validBillNumbers: (value) => {
                      const invalidItems = value.filter(
                        (item) => item.billno && !validateBillno(item.billno),
                      );
                      return (
                        invalidItems.length === 0 ||
                        "All bill numbers must contain only capital letters and digits"
                      );
                    },
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <EventBudget
                    editable={false}
                    rows={value}
                    setRows={onChange}
                    billViewable={true}
                    billEditable={true}
                    setBudgetEditing={setBudgetEditing}
                  />
                )}
              />
            </Box>
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
                disabled={loading || !fileDropzone || budgetEditing}
              >
                Save
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      <Typography
        variant="h4"
        sx={{
          mt: 3,
        }}
      >
        Instructions
      </Typography>
      <Typography variant="body1">
        <ul>
          <li>
            <strong>File Upload:</strong> Upload the bill/s in PDF format. Merge
            all bills into one PDF.
          </li>
          <li>
            <strong>Breakdown and bill details:</strong> Fill in the
            budget/amount used and bill details for each budget entry.
          </li>
          <li>
            <strong>Bill Number:</strong> You are only allowed to enter capital
            alphabets, digits and certain symbols - _,\-#()/;. In case of
            multiple bills for a budget item, separate them by commas.
          </li>
          <li>
            <strong>Save:</strong> Click on save to submit the bill. Once
            submitted, you won&apos;t be able to edit the bill until SLO rejects
            it.
          </li>
        </ul>
      </Typography>
      <ConfirmDialog
        open={submitDialogOpen}
        title="Confirm submission"
        description={
          "Are you sure you want to submit the bill? You won't be able to edit the bill after submission, until SLO processes it."
        }
        onConfirm={() => handleSubmit((data) => onSubmit(data))()}
        onClose={() => setSubmitDialogOpen(false)}
        confirmProps={{ color: "primary" }}
        confirmText="Proceed"
      />
    </>
  );
}
