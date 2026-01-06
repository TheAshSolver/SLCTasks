"use client";

import { ISOtoHuman } from "utils/formatTime";

export default function DateTime({ dt, showWeekDay = false }) {
  return ISOtoHuman(dt, showWeekDay);
}
