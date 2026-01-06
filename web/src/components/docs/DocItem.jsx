"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { formatDate } from "components/docs/DocsList";
import Icon from "components/Icon";
import { getFile } from "utils/files";

const buildFileName = (file, version) => {
  return file.filename + "_v" + version.toString() + "." + file.filetype;
};

export default function DocItem({
  file,
  version,
  versionChange,
  maxVersion,
  onClose,
  open,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const fileUrl = getFile(buildFileName(file, version), true, true);

  const handleDownload = () => {
    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.download = buildFileName(file, version);

    // Append it to the body (necessary for some browsers)
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleVersionChange = (event) => {
    versionChange(event.target.value);
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
          flexDirection: isMobile ? "column" : "row", // Adjust layout for mobile
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: isMobile ? "center" : "center",
          position: "relative",
        }}
      >
        {/* Title */}
        <Box
          component="div"
          sx={{
            position: isMobile ? "static" : "absolute",
            left: isMobile ? "auto" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            textAlign: "center",
          }}
        >
          {file.title}
        </Box>

        {/* Buttons and Dropdown */}
        {isMobile ? (
          // Render buttons below the title for mobile
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
            {/* Dropdown */}
            <Box>
              <Select
                value={version}
                onChange={handleVersionChange}
                size="small"
                sx={{ minWidth: 100, width: "100%", mt: 1, py: 0.5 }}
              >
                {Array.from({ length: maxVersion }, (_, i) => {
                  const version = maxVersion - i;
                  return (
                    <MenuItem key={version} value={version}>
                      {`v${version}${
                        version === maxVersion ? " (Latest)" : ""
                      }`}
                    </MenuItem>
                  );
                })}
              </Select>
            </Box>
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
          </Box>
        ) : (
          // Desktop layout
          <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
            {/* Dropdown */}
            <Box>
              <Select
                value={version}
                onChange={handleVersionChange}
                size="small"
                sx={{ minWidth: 100 }}
              >
                {Array.from({ length: maxVersion }, (_, i) => {
                  const version = maxVersion - i;
                  return (
                    <MenuItem key={version} value={version}>
                      {`v${version}${
                        version === maxVersion ? " (Latest)" : ""
                      }`}
                    </MenuItem>
                  );
                })}
              </Select>
            </Box>
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
          justifyContent: isMobile ? "center" : "flex-start", // Center content for mobile, normal flow for desktop
          minHeight: isMobile ? "50vh" : "auto", // Make sure the height fills the screen on mobile
          paddingBottom: isMobile ? 2 : 0, // Add some padding at the bottom for mobile
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
            Your device does not support previewing this file. Please{" "}
            <a href={fileUrl} download={buildFileName(file, version)}>
              download it
            </a>{" "}
            to view.
          </Typography>
        ) : (
          <iframe
            src={fileUrl}
            style={{
              width: "100%",
              height: "75vh",
              border: "none",
            }}
            title={file.title}
          >
            <Typography variant="body1">
              Your device does not support previewing this file. Please download
              it to view.
            </Typography>
          </iframe>
        )}

        <Typography
          variant="body2"
          sx={{
            mt: 2,
            mb: 1,
            position: isMobile ? "absolute" : "static",
            bottom: isMobile ? 20 : "auto",
            left: 0,
            right: 0,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Last Modified: {formatDate(file.modifiedTime)}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
