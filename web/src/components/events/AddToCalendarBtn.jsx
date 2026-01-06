"use client";

import { AddToCalendarButton } from "add-to-calendar-button-react";

import { useMode } from "contexts/ModeContext";

import { locationLabel } from "utils/formatEvent";
import { formatDateTime } from "utils/formatTime";

export default function AddToCalendarBtn({ event }) {
  const { isDark } = useMode();

  const startDateTime = formatDateTime(event.datetimeperiod[0]);
  const endDateTime = formatDateTime(event.datetimeperiod[1]);

  return (
    <AddToCalendarButton
      name={event.name}
      description={event.description || " "}
      options={["Google", "Microsoft365", "Apple", "iCal"]}
      location={
        ["offline", "hybrid"].includes(event.mode)
          ? event.location.length > 0
            ? event.location
                .map((l) =>
                  l === "other"
                    ? event.otherLocation || "Other"
                    : locationLabel(l).name,
                )
                .join(", ")
            : event.mode.charAt(0).toUpperCase() + event.mode.slice(1)
          : "Online"
      }
      iCalFileName={event?.name || "event"}
      startDate={startDateTime.dateString}
      endDate={endDateTime.dateString}
      startTime={startDateTime.timeString}
      endTime={endDateTime.timeString}
      hideBranding={true}
      hideBackground={true}
      forceOverlay={true}
      hideCheckmark={true}
      size={2}
      // pastDateHandling="hide"
      timeZone="Asia/Calcutta"
      lightMode={isDark ? "dark" : "light"}
      buttonStyle="3d"
      trigger="hover"
    />
  );
}
