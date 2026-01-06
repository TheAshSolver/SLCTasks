"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Icon from "components/Icon";

export default function BillPdfViewer({ eventTitle, pdfUrl, onClose, open }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDownload = () => {
    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = `${eventTitle}_bill.pdf`;

    // Append it to the body (necessary for some browsers)
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <Dialog
      open={open}
      fullScreen={isMobile}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: isMobile ? "center" : "center",
          position: "relative",
        }}
      >
        {eventTitle} - Bill
        {/* Buttons */}
        {isMobile ? ( // Mobile layout
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mt: 2,
              mb: 2,
              width: "100%",
            }}
          >
            {/* Download Button */}
            <Button
              variant="contained"
              startIcon={<Icon variant="download" />}
              onClick={handleDownload}
              size="small"
              sx={{ width: "100%", py: 1.5 }}
            >
              Download
            </Button>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 8,
              }}
            >
              <Icon variant="close" />
            </IconButton>
          </Box> // Desktop layout
        ) : (
          <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
            {/* Download Button */}
            <Button
              variant="contained"
              startIcon={<Icon variant="download" />}
              onClick={handleDownload}
              size="small"
            >
              Download
            </Button>

            <IconButton onClick={onClose} size="small">
              <Icon variant="close" />
            </IconButton>
          </Box>
        )}
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: isMobile ? "center" : "flex-start",
          minHeight: isMobile ? "50vh" : "auto",
          paddingBottom: isMobile ? 2 : 0,
        }}
      >
        {isMobile ? (
          <Typography
            variant="body1"
            sx={{
              mb: 5,
              textAlign: "center",
            }}
          >
            Your device does not support previewing this file. Please download
            it to view.
          </Typography>
        ) : (
          <iframe
            src={pdfUrl}
            style={{
              width: "100%",
              height: "75vh",
              border: "none",
            }}
            title={eventTitle}
          >
            <Typography variant="body1">
              Your device does not support previewing this file. Please download
              it to view.
            </Typography>
          </iframe>
        )}
      </DialogContent>
    </Dialog>
  );
}
