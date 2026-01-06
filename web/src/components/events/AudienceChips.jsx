"use client";

import { Chip, Grid } from "@mui/material";

import { useMode } from "contexts/ModeContext";

import { audienceLabels } from "utils/formatEvent";

const customSortOrder = [
  "UG 1",
  "UG 2",
  "UG 3",
  "UG 4+",
  "PG",
  "Faculty",
  "Staff",
  "Internal",
];

export default function AudienceChips({ audience }) {
  const { isDark } = useMode();
  if (!audience?.length) return "—";
  return (
    <Grid container spacing={1}>
      {audienceLabels(audience)
        ?.sort(
          (a, b) =>
            customSortOrder.indexOf(a.name) - customSortOrder.indexOf(b.name),
        )
        ?.map(({ name, color }) => (
          <Grid key={name}>
            <Chip
              label={name}
              sx={{
                color: isDark ? `${color}.lighter` : `${color}.dark`,
                backgroundColor: isDark ? `${color}.dark` : `${color}.lighter`,
                fontWeight: "bold",
              }}
            />
          </Grid>
        ))}
    </Grid>
  );
}
