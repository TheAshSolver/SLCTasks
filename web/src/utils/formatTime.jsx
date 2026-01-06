"use client";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const LOCALE = "en-IN";

// get datetime components from ISO string
export function ISOtoDateTime(iso) {
  const dt = new Date(iso);

  const options = { hour12: true };
  return {
    weekday: dt.toLocaleString(LOCALE, { weekday: "short", ...options }),
    day: dt.toLocaleString(LOCALE, { day: "numeric", ...options }),
    month: dt.toLocaleString(LOCALE, { month: "short", ...options }),
    year: dt.toLocaleString(LOCALE, { year: "numeric", ...options }),
    time: dt.toLocaleString(LOCALE, { timeStyle: "short", ...options }),
  };
}

// get human readable date time from ISO string
export function ISOtoHuman(
  iso,
  weekDay = false,
  showTime = true,
  showYearAlways = false,
) {
  const dt = ISOtoDateTime(iso);
  return `${weekDay ? `${dt.weekday}, ` : ""}${dt.day} ${dt.month}${
    showYearAlways
      ? ` ${dt.year}`
      : dt.year !== String(new Date().getFullYear())
        ? ` ${dt.year}`
        : ""
  }${showTime ? `, ${dt.time.toUpperCase()}` : ""} IST`;
}

export const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  const dateString = date.toISOString().substring(0, 10); // YYYY-MM-DD
  const timeString = date.toTimeString().substring(0, 5); // HH:MM
  return { dateString, timeString };
};

export const formatDateTimeCustom = (dateString, inputFormat, outputFormat) => {
  try {
    const date = dayjs(dateString.replace(" IST", ""), inputFormat, true);
    if (!date.isValid()) {
      console.error("Invalid date parsing for:", dateString);
      return dateString; // Return original string if parsing fails
    }
    return date.format(outputFormat);
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString; // Return original string if there's an error
  }
};
