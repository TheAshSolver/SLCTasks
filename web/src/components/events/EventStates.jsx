"use client";

import Icon from "components/Icon";
import Tag from "components/Tag";
import { stateLabel } from "utils/formatEvent";

export function EventStatus({ status, sx }) {
  return (
    <Tag
      sx={sx}
      label={stateLabel(status?.state)?.name}
      color={stateLabel(status?.state)?.color}
      icon={<Icon external variant={stateLabel(status?.state)?.icon} />}
    />
  );
}

export function BudgetStatus({ status, budget, sx }) {
  const state = budget?.length
    ? status?.budget
      ? "approved"
      : "pending"
    : "empty";

  const hidden = status?.state === "incomplete" || status?.state === "deleted";
  if (hidden) return null;

  return (
    <Tag
      sx={sx}
      label={state === "empty" ? "No budget" : `Budget ${state}`}
      color={
        state === "empty"
          ? "info"
          : state === "approved"
            ? "success"
            : "warning"
      }
      icon={
        <Icon
          external
          variant={
            state === "empty"
              ? "ic:outline-minus"
              : state === "approved"
                ? "eva:checkmark-outline"
                : "eva:refresh-outline"
          }
        />
      }
    />
  );
}

export function VenueStatus({ status, location, sx }) {
  const state = location?.length
    ? status?.room
      ? "approved"
      : "pending"
    : "empty";

  const hidden = status?.state === "incomplete" || status?.state === "deleted";
  if (hidden) return null;

  return (
    <Tag
      sx={sx}
      label={state === "empty" ? "No venue" : `Venue ${state}`}
      color={
        state === "empty"
          ? "info"
          : state === "approved"
            ? "success"
            : "warning"
      }
      icon={
        <Icon
          external
          variant={
            state === "empty"
              ? "ic:outline-minus"
              : state === "approved"
                ? "eva:checkmark-outline"
                : "eva:refresh-outline"
          }
        />
      }
    />
  );
}
