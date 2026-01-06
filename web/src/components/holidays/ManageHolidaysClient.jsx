"use client";

import { useMemo, useState } from "react";

import { Container } from "@mui/material";

import HolidaysTable from "components/holidays/HolidaysTable";
import HolidaysTitleBar from "components/holidays/HolidaysToggleBar";

export default function ManageHolidaysClient({ holidays }) {
  const [showPast, setShowPast] = useState(false);
  const now = new Date();

  const filteredHolidays = useMemo(() => {
    if (!holidays) return [];
    return showPast
      ? holidays
      : holidays.filter((holiday) => new Date(holiday.date) >= now);
  }, [holidays, showPast]);

  return (
    <Container>
      <HolidaysTitleBar
        showPast={showPast}
        onToggle={() => setShowPast((value) => !value)}
      />
      <HolidaysTable holidays={filteredHolidays} showPast={showPast} />
    </Container>
  );
}
