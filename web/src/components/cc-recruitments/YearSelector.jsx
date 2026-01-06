"use client";

import { useRouter } from "next/navigation";

import { FormControl, MenuItem, Select } from "@mui/material";

export default function YearSelector({ currentYear, selectedYear }) {
  const router = useRouter();

  const handleChange = (event) => {
    router.push(`?year=${event.target.value}`);
  };

  return (
    <FormControl size="small">
      <Select value={selectedYear} onChange={handleChange}>
        {Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i).map(
          (yr) => (
            <MenuItem key={yr} value={yr}>
              {yr}
            </MenuItem>
          ),
        )}
      </Select>
    </FormControl>
  );
}
