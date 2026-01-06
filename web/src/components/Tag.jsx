"use client";

import { Chip } from "@mui/material";

import { useMode } from "contexts/ModeContext";

export default function Tag({ label, color, icon, sx = {} }) {
  const { isDark } = useMode();

  return (
    <Chip
      variant="outlined"
      icon={icon}
      label={label}
      color={color}
      sx={{
        textTransform: "capitalize",
        borderRadius: 1,
        color: isDark ? `${color}.lighter` : `${color}.dark`,
        fontWeight: "bold",
        backgroundColor: isDark ? `${color}.dark` : `${color}.lighter`,
        ...sx,
      }}
    />
  );
}
