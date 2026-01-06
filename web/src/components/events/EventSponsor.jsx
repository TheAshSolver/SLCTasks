"use client";

import { useState } from "react";

import { Button, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";

import Icon from "components/Icon";
import { fCurrency } from "utils/formatCurrency";

export default function EventSponsor({
  editable = false,
  rows = [],
  setRows = console.log,
  setSponsorEditing = console.log,
}) {
  const theme = useTheme();
  const [error, setError] = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // budget item template
  const emptySponsorItem = {
    name: null,
    comment: null,
    amount: 0,
    previouslySponsored: false,
  };

  // data manipulation functions
  const onAdd = () => {
    const maxId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) : -1;
    const newId = maxId + 1;
    setRows([...rows, { id: newId, ...emptySponsorItem }]);
  };
  const onUpdate = (row) => {
    row.amount = Math.max(row.amount, 0);

    const newRows = rows.map((r) => {
      if (r.id === row.id) return row;
      return r;
    });
    setRows(newRows);
    setError("");
    return row;
  };
  const onDelete = (row) => {
    setRows(rows.filter((r) => r.id !== row.id));
  };

  // grid column definition
  const columns = [
    {
      field: "name",
      headerName: "Sponsor Name",
      width: 200,
      flex: isMobile ? null : 1.5,
      editable: editable,
      renderCell: (p) => {
        return p.value ? (
          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              msHyphens: "auto",
              MozHyphens: "auto",
              WebkitHyphens: "auto",
              hyphens: "auto",
              px: "10px",
              py: "10px",
            }}
          >
            {p.value}
          </Typography>
        ) : (
          <Typography
            sx={{
              color: "text.secondary",
              color: "text.secondary",
              px: "10px",
              py: "10px",
            }}
          >
            <i>Double click to edit</i>
          </Typography>
        );
      },
      display: "flex",
    },
    {
      field: "comment",
      headerName: "Comments",
      width: 200,
      flex: isMobile ? null : 1.75,
      editable: editable,
      renderCell: (p) => {
        return p.value ? (
          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              msHyphens: "auto",
              MozHyphens: "auto",
              WebkitHyphens: "auto",
              hyphens: "auto",
              px: "10px",
              py: "10px",
            }}
          >
            {p.value}
          </Typography>
        ) : (
          <Typography
            sx={{
              color: "text.secondary",
              color: "text.secondary",
              px: "10px",
              py: "10px",
            }}
          >
            <i>Double click to edit</i>
          </Typography>
        );
      },
      display: "flex",
    },
    {
      field: "amount",
      type: "number",
      headerName: "Amount",
      flex: isMobile ? null : 1,
      editable: editable,
      renderCell: (p) => (
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {fCurrency(p.value)}
        </Typography>
      ),
      display: "flex",
    },
    {
      field: "previouslySponsored",
      type: "boolean",
      headerName: "Previously Sponsored?",
      width: isMobile ? 20 : 200,
      editable: editable,
      headerAlign: "center",
      align: "center",
      renderCell: (p) => (
        <Icon
          external
          color={!!p.value ? "success.main" : "error.main"}
          variant={!!p.value ? "eva:checkmark-outline" : "eva:close-outline"}
        />
      ),
      display: "flex",
    },
    ...(editable
      ? [
          {
            field: "action",
            align: "center",
            headerName: "",
            width: isMobile ? 20 : 50,
            renderCell: (p) => (
              <IconButton onClick={() => onDelete(p)} size="small">
                <Icon
                  color="error.main"
                  variant="delete-forever-outline"
                  sx={{ height: 16, width: 16 }}
                />
              </IconButton>
            ),
            display: "flex",
            disableColumnMenu: true,
            sortable: false,
            disableExport: true,
            disableColumnMenu: true,
            sortable: false,
            disableExport: true,
          },
        ]
      : []),
  ];

  return (
    <>
      {editable ? (
        <Button size="small" variant="outlined" onClick={onAdd} sx={{ mb: 1 }}>
          <Icon variant="add" sx={{ mr: 1 }} />
          <Icon variant="add" sx={{ mr: 1 }} />
          Add Item
        </Button>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <DataGrid
          autoHeight
          getRowHeight={() => "auto"}
          columns={columns}
          rows={rows}
          editMode="row"
          processRowUpdate={onUpdate}
          disableRowSelectionOnClick
          onRowEditStart={() => setSponsorEditing(true)}
          onRowEditStop={() => setSponsorEditing(false)}
          onProcessRowUpdateError={(error) => {
            console.error("Row update error:", error);
            setError(error.message);
          }}
          pageSizeOptions={[5, 10, 15]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          sx={{
            // disable cell selection style
            ".MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </div>

      <Typography variant="caption" color="error">
        {error}
      </Typography>
    </>
  );
}
