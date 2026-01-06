import React from "react";

import { Box, Divider, Grid, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";

export default async function EventApprovalStatus({
  status,
  isStudentBodyEvent = false,
}) {
  // Fetch user data for approvers
  let lastEditeduser = "";
  let deletedBy = "";
  let ccApprover = "";
  let slcApprover = "";

  if (status?.lastUpdatedBy != null) {
    const client = getClient();
    const { data } = await client.query({
      query: GET_USER,
      variables: { uid: status.lastUpdatedBy },
    });
    lastEditeduser = data?.user?.name || "";
  }

  if (status?.deletedBy != null) {
    const client = await getClient();
    const { data } = await client.query({
      query: GET_USER,
      variables: { uid: status.deletedBy },
    });
    deletedBy = data?.user?.name || "";
  }

  if (status?.ccApprover != null) {
    const client = await getClient();
    const { data } = await client.query({
      query: GET_USER,
      variables: { uid: status.ccApprover },
    });
    ccApprover = data?.user?.name || "";
  }

  if (status?.slcApprover != null) {
    const client = await getClient();
    const { data } = await client.query({
      query: GET_USER,
      variables: { uid: status.slcApprover },
    });
    slcApprover = data?.user?.name || "";
  }

  // Build timeline rows based on conditions
  const timelineRows = [];

  // Always show Last Edited
  timelineRows.push([
    "Last Edited",
    status?.lastUpdatedTime == null
      ? "Information not available"
      : (status?.lastUpdatedTime.includes(":") ? "Edited on " : "") +
        status?.lastUpdatedTime,
    status?.lastUpdatedTime == null,
  ]);

  // Show Last Edited By if available
  if (status?.lastUpdatedBy != null) {
    timelineRows.push(["Last Edited By", lastEditeduser, false]);
  }

  // Add the creationTime row
  timelineRows.push([
    "Event Created",
    status?.creationTime == null
      ? "Information not available"
      : (status?.creationTime.includes(":") ? "Created on " : "") +
        status?.creationTime,
    status?.creationTime == null,
  ]);

  // Handle deleted state
  if (status?.state && status?.state == "deleted") {
    timelineRows.push([
      "Event Deletion",
      status?.deletedTime == null
        ? "Information not available"
        : (status?.deletedTime.includes(":") ? "Deleted on " : "") +
          status?.deletedTime,
      status?.deletedTime == null,
    ]);

    if (status?.deletedTime != null && status?.deletedBy != null) {
      timelineRows.push(["Event Deleted By", deletedBy, false]);
    }
  }
  // Handle non-incomplete states
  else if (status?.state && status?.state !== "incomplete") {
    timelineRows.push([
      "Event Submission",
      status?.submissionTime == null
        ? "Information not available"
        : (status?.submissionTime.includes(":") ? "Submitted on " : "") +
          status?.submissionTime,
      status?.submissionTime == null,
    ]);

    // Clubs Council Approval (only if not student body event)
    if (!isStudentBodyEvent) {
      timelineRows.push([
        "Clubs Council Approval",
        status?.ccApproverTime == null
          ? "Information not available"
          : (status?.ccApproverTime.includes(":") ? "Approved on " : "") +
            status?.ccApproverTime,
        status?.ccApproverTime == null,
      ]);
    }

    // Clubs Council Approved By
    if (status?.ccApprover != null && status?.ccApproverTime != null) {
      timelineRows.push(["Clubs Council Approved By", ccApprover, false]);
    }

    // Students Life Council Approval (only if not student body event)
    if (!isStudentBodyEvent) {
      timelineRows.push([
        "Students Life Council Approval",
        status?.slcApproverTime == null
          ? "Information not available"
          : (status?.slcApproverTime.includes(":") ? "Approved on " : "") +
            status?.slcApproverTime,
        status?.slcApproverTime == null,
      ]);
    }

    // Students Life Council Approved By
    if (status?.slcApprover != null && status?.slcApproverTime != null) {
      timelineRows.push([
        "Students Life Council Approved By",
        slcApprover,
        false,
      ]);
    }

    // Students Life Office Approval (always shown)
    timelineRows.push([
      "Students Life Office Approval",
      status?.sloApproverTime == null
        ? "Information not available"
        : (status?.sloApproverTime.includes(":") ? "Approved on " : "") +
          status?.sloApproverTime,
      status?.sloApproverTime == null,
    ]);
  }

  return (
    <>
      <Divider sx={{ borderStyle: "dashed", my: 2 }} />
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        TIMELINE{" "}
        <Typography
          component="span"
          variant="caption"
          sx={{ marginLeft: 1, color: "text.secondary" }}
        >
          (Times in IST)
        </Typography>
      </Typography>
      <Grid container direction="column" spacing={0.5}>
        {timelineRows.map(([label, value, isUnavailable], i) => (
          <Grid
            key={i}
            sx={{
              display: "grid",
              gridTemplateColumns: "3fr 0.3fr 10fr",
              borderBottom:
                i === timelineRows.length - 1 ? "none" : "1px dashed #eee",
              py: 1,
            }}
          >
            <Box sx={{ color: "#555", fontWeight: 500 }}>{label}</Box>
            <Box sx={{ color: "#555" }}>-</Box>
            <Box
              sx={{
                color: isUnavailable
                  ? "#5a5a5a"
                  : value?.includes("Not Approved")
                    ? "red"
                    : "inherit",
              }}
            >
              {value}
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
