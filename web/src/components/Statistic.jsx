"use client";

import { Box, Card, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import Icon from "components/Icon";

export default function Statistic({
  title,
  total,
  icon,
  color = "primary",
  sx,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: "center",
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          margin: "auto",
          display: "flex",
          borderRadius: "50%",
          alignItems: "center",
          width: theme.spacing(8),
          height: theme.spacing(8),
          justifyContent: "center",
          marginBottom: theme.spacing(3),
          color: (theme) => theme.palette[color].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette[color].darker,
              0,
            )} 0%, ${alpha(theme.palette[color].darker, 0.35)} 100%)`,
        }}
      >
        <Icon variant={icon} width={24} height={24} />
      </Box>

      <Typography variant="h3">{total}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
        {title}
      </Typography>
    </Card>
  );
}
