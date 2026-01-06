"use client";

import { createContext, useContext, useState } from "react";

import {
  Alert,
  AlertTitle,
  Box,
  Slide,
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ToastContext = createContext({
  open: false,
  title: "",
  messages: "",
  severity: "info",
  handleClose: () => null,
  triggerToast: () => null,
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    title: null,
    messages: null,
    severity: null,
  });
  const handleClose = () => setToast({ ...toast, open: false });

  const triggerToast = ({ title, messages, severity }) => {
    setToast({ open: true, title, messages, severity });
  };

  return (
    <ToastContext.Provider
      value={{
        ...toast,
        handleClose,
        triggerToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export default function Toast() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { open, title, messages, severity, handleClose } = useToast();

  return messages?.length ? (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: isDesktop ? "right" : "center",
      }}
      onClose={handleClose}
      autoHideDuration={8000}
      sx={{
        mb: 3,
        mr: isDesktop ? 3 : 0,
      }}
      slots={{
        transition: Slide,
      }}
    >
      <Alert variant="standard" onClose={handleClose} severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {messages?.map((line, key) => (
          <Box key={key}>{line}</Box>
        ))}
      </Alert>
    </Snackbar>
  ) : null;
}
