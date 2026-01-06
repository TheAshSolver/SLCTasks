"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid, GridLogicOperator } from "@mui/x-data-grid";

import ConfirmDialog from "components/ConfirmDialog";
import Icon from "components/Icon";
import Tag from "components/Tag";
import { stateLabel } from "utils/formatEvent";
import { ISOtoHuman } from "utils/formatTime";

function FilterTextInputValue(props) {
  const { item, applyValue } = props;

  const handleFilterChange = (event) => {
    applyValue({ ...item, value: event.target.value });
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        pl: "20px",
      }}
    >
      <TextField
        label="Enter text"
        value={item.value || ""}
        onChange={handleFilterChange}
        variant="standard"
      />
    </Box>
  );
}

export default function EventsTable({
  events: initialEvents,
  query,
  clubid,
  scheduleSort = "asc",
  hideClub = false,
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Toggle state for Last 4 Months
  const [filterMonth, setFilterMonth] = useState(["pastEventsLimit"]);
  const [events, setEvents] = useState(initialEvents || []);
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    // If query is not provided, just use initialEvents
    if (!query) {
      setEvents(initialEvents || []);
      return;
    }

    // If query is provided, run it with pastEventsLimit based on toggle
    async function fetchEvents() {
      let params = {
        targetClub: clubid,
        pastEventsLimit: filterMonth.includes("pastEventsLimit") ? 4 : null,
      };
      const result = await query(params);
      setEvents(result || []);
    }
    fetchEvents();
  }, [query, clubid, filterMonth, initialEvents]);

  const columns = [
    ...(isMobile
      ? []
      : [
          {
            field: "code",
            headerName: "Event Code",
            flex: 3,
            renderCell: ({ value }) => (
              <Typography
                variant="body2"
                sx={{
                  color: "text.disabled",
                }}
              >
                {value}
              </Typography>
            ),
            display: "flex",
          },
        ]),
    {
      field: "name",
      headerName: "Name",
      flex: isMobile ? null : 5,
      renderCell: ({ value, row }) =>
        value ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {row.sponsor && row.sponsor.length > 0 ? (
              <Tooltip title="Event has sponsors" arrow>
                <Icon
                  sx={{
                    mr: 0.5,
                    flexShrink: 0,
                  }}
                  variant={"paid-rounded"}
                  color="#FFC046"
                />
              </Tooltip>
            ) : row.budget && row.budget.length > 0 ? (
              <Tooltip title="Event requires budget" arrow>
                <Icon
                  sx={{
                    mr: 0.5,
                    flexShrink: 0,
                  }}
                  variant={"paid-rounded"}
                />
              </Tooltip>
            ) : null}
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0, // Allow text to shrink
              }}
            >
              {value}
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Typography>
        ),
      display: "flex",
    },
    ...(isMobile
      ? []
      : [
          {
            field: "club",
            headerName: "Club ID",
            flex: 3,
            valueGetter: (value, row, column, apiRef) => row.clubid,
            renderCell: ({ value }) => (
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </Typography>
            ),
            display: "flex",
          },
          {
            field: "scheduled",
            headerName: "Scheduled",
            flex: 3,
            align: "center",
            headerAlign: "center",
            valueGetter: (value, row, column, apiRef) => row.datetimeperiod[0],
            valueFormatter: (value, row, column, apiRef) => ISOtoHuman(value),
            renderCell: ({ formattedValue }) => (
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {formattedValue}
              </Typography>
            ),
            display: "flex",
          },
        ]),
    {
      field: "venue",
      headerName: "Venue",
      flex: isMobile ? null : 2,
      align: "center",
      headerAlign: "center",
      disableExport: true,
      valueGetter: (value, row, column, apiRef) => ({
        requested: row.location.length > 0,
        approved: row.status.room,
      }),
      renderCell: ({ value }) => (
        <Tooltip
          title={
            !value.requested
              ? "No venue requested"
              : !value.approved
                ? "Venue requested, pending approval"
                : "Venue approved"
          }
          arrow
        >
          <Icon
            sx={{
              color: !value.requested
                ? "secondary.main"
                : !value.approved
                  ? "warning.main"
                  : "success.main",
            }}
            variant={
              !value.requested
                ? "remove-rounded"
                : !value.approved
                  ? "refresh-rounded"
                  : "check"
            }
          />
        </Tooltip>
      ),
      display: "flex",
      sortComparator: (v1, v2) => {
        return v1.requested - v2.requested || v1.approved - v2.approved;
      },
      filterable: false,
    },
    {
      field: "status",
      headerName: "Status",
      flex: isMobile ? null : 3,
      align: "center",
      headerAlign: "center",
      disableExport: true,
      valueGetter: (value, row, column, apiRef) => ({
        state: row.status.state,
        start: row.datetimeperiod[0],
        end: row.datetimeperiod[1],
      }),
      renderCell: ({ value }) => {
        // change state to 'completed' if it has been approved and is in the past
        if (value.state === "approved" && new Date(value.start) < new Date()) {
          if (new Date(value.end) < new Date()) value.state = "completed";
          else value.state = "ongoing";
        }

        return (
          <Tag
            label={stateLabel(value.state).shortName}
            color={stateLabel(value.state).color}
            sx={{
              my: 2,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        );
      },
      sortComparator: (v1, v2) => {
        return v1.state.localeCompare(v2.state);
      },
      // Custom filter
      filterOperators: [
        {
          label: "contains",
          value: "contains",
          InputComponent: FilterTextInputValue,
          InputComponentProps: { type: "text" },
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) {
              return null;
            }
            return (value) => {
              const curr_state =
                value.state === "approved"
                  ? new Date(value.start) < new Date()
                    ? new Date(value.end) < new Date()
                      ? "completed approved"
                      : "ongoing approved"
                    : "approved"
                  : stateLabel(value.state).shortName.toLowerCase();

              return curr_state.includes(filterItem.value.toLowerCase());
            };
          },
        },
        {
          label: "does not contain",
          value: "does not contain",
          InputComponent: FilterTextInputValue,
          InputComponentProps: { type: "number" },
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) {
              return null;
            }
            return (value) => {
              const curr_state =
                value.state === "approved"
                  ? new Date(value.start) < new Date()
                    ? new Date(value.end) < new Date()
                      ? "completed approved"
                      : "ongoing approved"
                    : "approved"
                  : stateLabel(value.state).shortName.toLowerCase();

              return !curr_state.includes(filterItem.value.toLowerCase());
            };
          },
        },
      ],
    },
  ];

  return (
    <Grid>
      {
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            mt: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              mb: 0,
            }}
          >
            {query ? "All Events" : "Pending Events"}
          </Typography>
          {query && (
            <FormControlLabel
              control={
                <Switch
                  checked={filterMonth.includes("pastEventsLimit")}
                  onChange={(e) => {
                    // Only show dialog when switching from ON to OFF
                    if (
                      filterMonth.includes("pastEventsLimit") &&
                      !e.target.checked
                    ) {
                      setDialog(true);
                    } else {
                      setFilterMonth(
                        e.target.checked ? ["pastEventsLimit"] : [],
                      );
                    }
                  }}
                  color="primary"
                />
              }
              label="Last 4 Months"
              sx={{ marginLeft: 1 }}
            />
          )}
          <ConfirmDialog
            open={dialog}
            title="Are you sure you want to fetch all events?"
            description="Fetching all events from the start will take a lot of time."
            onConfirm={() => {
              setFilterMonth([]);
              setDialog(false);
            }}
            onClose={() => setDialog(false)}
            confirmProps={{ color: "error" }}
            confirmText="Yes, Fetch them"
          />
        </Box>
      }

      <div style={{ display: "flex", flexDirection: "column" }}>
        <DataGrid
          getRowHeight={() => (isMobile ? "auto" : null)}
          rows={events}
          columns={
            hideClub ? columns.filter((c) => c.field !== "club") : columns
          }
          getRowId={(r) => r._id}
          onRowClick={(params) =>
            router.push(`/manage/events/${params.row._id}`)
          }
          disableRowSelectionOnClick
          initialState={{
            sorting: {
              sortModel: [{ field: "scheduled", sort: scheduleSort }],
            },
            filter: {
              filterModel: {
                items: [],
                quickFilterLogicOperator: GridLogicOperator.Or,
              },
            },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          showToolbar
          sx={{
            // disable cell selection style
            ".MuiDataGrid-cell:focus": {
              outline: "none",
            },
            // pointer cursor on ALL rows
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </div>
    </Grid>
  );
}
