"use client";

import { useEffect, useRef } from "react";

import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import stc from "string-to-color";
import tippy from "tippy.js";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useAuth } from "components/AuthProvider";

import "tippy.js/dist/tippy.css"; // Optional for styling

function eventDataTransform(event, role, uid) {
  if (!event?.status) {
    return {
      id: event._id,
      title: event.name,
      start: new Date(event.date),
      end: new Date(event.date),
      allDay: true,
      display: "background",
      backgroundColor: "#FFCCCB",
      clubid: event.clubid,
    };
  }
  if (event.status.state === "approved") {
    return {
      id: event._id,
      title: event.name,
      start: new Date(event.datetimeperiod[0]),
      end: new Date(event.datetimeperiod[1]),
      backgroundColor: stc(event.clubid),
      url: `/events/${event._id}`,
      display: "block",
      clubid: event.clubid,
    };
  } else {
    if (role == "cc" || uid == event.clubid)
      return {
        id: event._id,
        title: event.name,
        start: new Date(event.datetimeperiod[0]),
        end: new Date(event.datetimeperiod[1]),
        backgroundColor: stc(event.clubid),
        url: `/manage/events/${event._id}`,
        display: "block",
        clubid: event.clubid,
      };
    else
      return {
        id: event._id,
        title: event.name,
        start: new Date(event.datetimeperiod[0]),
        end: new Date(event.datetimeperiod[1]),
        backgroundColor: stc(event.clubid),
        display: "block",
        clubid: event.clubid,
      };
  }
}

export default function Calendar({ events, holidays, allClubs }) {
  const { user } = useAuth();
  const theme = useTheme();
  const calendarRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const eventDataTransform_withrole = (event) => {
    return eventDataTransform(event, user?.role, user?.uid);
  };

  const allEvents = (events ?? [])?.filter(
    (event) => event?.status?.state !== "deleted",
  );
  const mergedEvents = [...allEvents, ...holidays];

  const handleEventMouseEnter = (info) => {
    const { event, el } = info;
    const clubName = allClubs.find(
      (club) => club.cid === event.extendedProps.clubid,
    )?.name;
    const content = `<strong>${event.title}</strong> ${
      event.extendedProps.clubid ? "by" : ""
    } ${event.extendedProps.clubid ? clubName : "Holiday"}`;

    tippy(el, {
      content,
      allowHTML: true,
      placement: "top",
    });
  };

  useEffect(() => {
    if (calendarRef.current) {
      if (isMobile) {
        calendarRef.current.getApi().changeView("listWeek");
      } else {
        calendarRef.current.getApi().changeView("dayGridMonth");
      }
    }
  }, [isMobile]);

  return (
    <>
      <style>{`
        :root {
          --fc-border-color: ${theme.palette.background.neutral};
        }
        .fc .fc-bg-event {
          background-color: ${theme.palette.background.error}!important;
          opacity: 1 !important;
        }

        .fc-cell-shaded{
          background-color: ${theme.palette.background.neutral}!important;
        }

        .fc-list{
          border: 1px solid ${theme.palette.background.neutral}!important;
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        events={mergedEvents}
        plugins={[dayGridPlugin, listPlugin]}
        initialView={"dayGridMonth"}
        eventDataTransform={eventDataTransform_withrole}
        eventMouseEnter={handleEventMouseEnter}
        headerToolbar={{
          left: "title",
          right: "prev,next",
        }}
      />
    </>
  );
}
