"use client";

import { DataGrid, GridLogicOperator } from "@mui/x-data-grid";

import ClubBox from "components/clubs/ClubBox";

const columns = [
  {
    field: "eventName",
    headerName: "Event Name",
    // flex: 5,
    minWidth: 300,
  },
  {
    field: "clubdata",
    headerName: "Club",
    minWidth: 350,
    // flex: 5,
    valueGetter: (value, row, column, apiRef) => ({
      name: row.club,
      clubdata: row.clubdata,
    }),
    renderCell: ({ value }) => (
      <>{value.clubdata ? <ClubBox club={value.clubdata} /> : value.name}</>
    ),
    display: "flex",
    disableExport: true,
  },
  {
    field: "date",
    headerName: "Date",
    minWidth: 150,
    // flex: 6,
  },
  {
    field: "time",
    headerName: "Time",
    minWidth: 150,
    // flex: 5,
  },
  {
    field: "venue",
    headerName: "Venue",
    align: "center",
    headerAlign: "center",
    minWidth: 210,
    // flex: 5,
  },
];

export default function BuzzSchedule({ events, allClubs }) {
  if (!events) return null;

  const updatedEvents = events.map((event) => {
    let newEvent = { ...event, clubdata: null };
    newEvent.clubdata = allClubs.find((club) => club.cid === event.club);
    return newEvent;
  });

  return (
    <DataGrid
      rows={updatedEvents}
      columns={columns}
      initialState={{
        sorting: {
          sortModel: [{ field: "date", sort: "asc" }],
        },
        filter: {
          filterModel: {
            items: [],
            quickFilterLogicOperator: GridLogicOperator.Or,
          },
        },
      }}
      sx={{
        mt: 5,
        // disable cell selection style
        ".MuiDataGrid-cell:focus": {
          outline: "none",
        },
        // pointer cursor on ALL rows
        "& .MuiDataGrid-row:hover": {
          cursor: "pointer",
        },
        "& .MuiDataGrid-footerContainer": {
          display: "none",
        },
      }}
    />
  );
}
