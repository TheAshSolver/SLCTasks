"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import { ISOtoHuman } from "utils/formatTime";

export default function EventsDialog({
  open,
  onClose,
  events = [],
  clubs = [],
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Clashing Events</DialogTitle>
      <Box
        sx={{
          overflow: "hidden",
          overflowY: "auto",
        }}
      >
        <List>
          {events.map((event) => (
            <ListItem key={event._id}>
              <ListItemText
                primary={event.name}
                secondary={
                  <>
                    <span style={{ display: "block" }}>
                      By {clubs.find((club) => club.cid === event.clubid)?.name}
                    </span>
                    <span style={{ display: "block" }}>
                      {ISOtoHuman(event.datetimeperiod[0])} to{" "}
                      {ISOtoHuman(event.datetimeperiod[1])}
                    </span>
                    <span style={{ display: "block" }}>
                      <b>Status:</b>{" "}
                      {event.status.state === "approved"
                        ? "Approved"
                        : event.status.state === "incomplete"
                          ? "Draft"
                          : "Under review"}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
