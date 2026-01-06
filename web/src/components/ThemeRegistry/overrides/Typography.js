"use client";

export default function Typography(theme) {
  return {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: theme.spacing(1),
        },
      },
    },
  };
}
