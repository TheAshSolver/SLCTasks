"use client";

import { useState } from "react";

import { Button, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";

import { validateBillno } from "components/events/bills/BillUpload";
import Icon from "components/Icon";
import { fCurrency } from "utils/formatCurrency";

export default function EventBudget({
  editable = false,
  rows = [],
  setRows = console.log,
  setBudgetEditing = console.log,
  billViewable = false,
  billEditable = false,
}) {
  const theme = useTheme();
  const [error, setError] = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // budget item template
  const emptyBudgetItem = {
    description: null,
    amount: 0,
    advance: false,
    billno: null,
    amountUsed: null,
  };

  // data manipulation functions
  const onAdd = () => {
    const maxId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) : -1;
    const newId = maxId + 1;
    setRows([...rows, { id: newId, ...emptyBudgetItem }]);
  };
  const onUpdate = (row) => {
    row.amount = Math.max(row.amount, 0);
    row.amountUsed = row.amountUsed
      ? Math.max(row.amountUsed, 0)
      : row.amountUsed;

    if (row.billno && !validateBillno(row.billno)) {
      throw new Error("Bill number must contain only allowed characters.");
    }

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

  // Show extra fields only it amount used is > 0
  const showExtraFields = rows.some((r) => r.amountUsed > 0);

  // grid column definition
  const columns = [
    {
      field: "description",
      headerName: "Description",
      width: 200,
      flex: isMobile ? null : 4,
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
      headerName: billViewable ? "Amount" : "Proposed Amount",
      flex: isMobile ? null : 1,
      editable: editable,
      renderCell: (p) => (
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            alignItems: "center",
            px: "5px",
            py: "10px",
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
    ...(billEditable || (billViewable && showExtraFields)
      ? [
          {
            field: "billno",
            type: "string",
            headerName: "Bill No.",
            flex: isMobile ? null : 1,
            editable: billEditable,
            renderCell: (p) => (
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: "5px",
                  py: "10px",
                  justifyContent: "center",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  "&::before": { content: '"#  "', color: "gray" },
                }}
              >
                {p.value}
              </Typography>
            ),
          },
          {
            field: "amountUsed",
            type: "number",
            headerName: "Amount Used",
            flex: isMobile ? null : 1,
            editable: billEditable,
            renderCell: (p) => (
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: "5px",
                  py: "10px",
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
        ]
      : []),
    {
      field: "advance",
      type: "boolean",
      headerName: "Advance",
      width: isMobile ? 20 : 100,
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
          },
        ]
      : []),
  ];

  return (
    <>
      {editable ? (
        <Button size="small" variant="outlined" onClick={onAdd} sx={{ mb: 1 }}>
          <Icon variant="add" sx={{ mr: 1 }} />
          Add Item
        </Button>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <DataGrid
          getRowHeight={() => "auto"}
          columns={columns}
          rows={rows}
          editMode="row"
          processRowUpdate={onUpdate}
          disableRowSelectionOnClick
          onRowEditStart={() => setBudgetEditing(true)}
          onRowEditStop={() => setBudgetEditing(false)}
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
