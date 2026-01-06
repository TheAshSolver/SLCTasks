// components/finances/FinanceHeader.jsx
"use client";

import { useState } from "react";

import { Button, Stack, Typography } from "@mui/material";

import BillPdfViewer from "components/events/bills/BillPdfViewer";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import { getFile } from "utils/files";

export default function FinanceHeader({
  id,
  eventTitle,
  filename,
  onlyButton = false,
}) {
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  const handleOpenPdfViewer = () => setPdfViewerOpen(true);
  const handleClosePdfViewer = () => setPdfViewerOpen(false);

  const fileUrl = getFile(filename, true, false);

  const ViewButton = (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<Icon variant="article" />}
      onClick={handleOpenPdfViewer}
      disabled={!filename}
    >
      <Typography variant="button" color="opposite">
        View Bill
      </Typography>
    </Button>
  );

  return (
    <>
      {!onlyButton ? (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h3" gutterBottom={false}>
            Edit Bill Status Details
          </Typography>

          <Stack direction="row" spacing={2}>
            {ViewButton}
            <Button
              variant="contained"
              color="primary"
              component={ButtonLink}
              href={`/manage/events/${id}`}
              startIcon={<Icon variant="north-west" />}
            >
              <Typography variant="button" color="opposite">
                Go to Event
              </Typography>
            </Button>
          </Stack>
        </Stack>
      ) : (
        ViewButton
      )}
      <BillPdfViewer
        eventTitle={eventTitle}
        pdfUrl={fileUrl}
        onClose={handleClosePdfViewer}
        open={pdfViewerOpen}
      />
    </>
  );
}
