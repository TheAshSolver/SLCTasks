"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Typography } from "@mui/material";
import { DataGrid, GridLogicOperator } from "@mui/x-data-grid";

import { ISOtoHuman } from "utils/formatTime";

export default function HolidaysTable({ holidays, showPast = false }) {
  const router = useRouter();
  const [sortModel, setSortModel] = useState([
    { field: "date", sort: showPast ? "desc" : "asc" },
  ]);

  useEffect(() => {
    setSortModel([
      {
        field: "date",
        sort: showPast ? "desc" : "asc",
      },
    ]);
  }, [showPast]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 5,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
            msWordBreak: "break-all",
            wordBreak: "break-all",
            msHyphens: "auto",
            MozHyphens: "auto",
            WebkitHyphens: "auto",
            hyphens: "auto",
          }}
        >
          {params.value}
        </Typography>
      ),
      display: "flex",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 3,
      renderCell: (params) => (
        <Typography variant="body2">
          {ISOtoHuman(params.value, true, false)}
        </Typography>
      ),
      display: "flex",
    },
  ];

  if (!holidays) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <DataGrid
        rows={holidays}
        columns={columns}
        getRowId={(r) => r._id}
        onRowClick={(params) =>
          router.push(`/manage/holidays/${params.row._id}`)
        }
        disableRowSelectionOnClick
        sortModel={sortModel}
        onSortModelChange={(newModel) => setSortModel(newModel)}
        initialState={{
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
          ".MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
      />
    </div>
  );
}
