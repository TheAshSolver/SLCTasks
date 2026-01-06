"use client";

import { useRouter } from "next/navigation";

import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "name",
    headerName: "Name",
    flex: 5,
    headerAlign: "center",
    align: "center",
    valueGetter: (value, row, column, apiRef) =>
      row.firstName + " " + row.lastName,
    renderCell: ({ value }) => <Typography variant="body2">{value}</Typography>,
    display: "flex",
  },
  {
    field: "rollno",
    headerName: "Roll No",
    flex: 3,
  },
  {
    field: "batch",
    headerName: "Batch",
    flex: 3,
    valueGetter: (value, row, column, apiRef) => row.batch.toUpperCase(),
  },
  {
    field: "stream",
    headerName: "Stream",
    flex: 3,
    valueGetter: (value, row, column, apiRef) => row.stream.toUpperCase(),
  },
];

export default function CCRecruitmentsTable({ data, year }) {
  const router = useRouter();

  const handleRowClick = (params) => {
    router.push(`/cc-recruitments/all/${params.row.uid}?year=${year}`);
  };

  return (
    <DataGrid
      autoHeight
      rows={data}
      columns={columns}
      getRowId={(row) => row.uid}
      pageSize={10}
      disableRowSelectionOnClick
      onRowClick={handleRowClick}
      initialState={{
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
  );
}
