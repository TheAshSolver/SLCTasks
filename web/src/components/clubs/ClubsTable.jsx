"use client";

import { useRouter } from "next/navigation";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid, GridLogicOperator } from "@mui/x-data-grid";

import ClubLogo from "components/clubs/ClubLogo";
import Tag from "components/Tag";

export default function ClubsTable({ clubs }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const columns = [
    {
      field: "img",
      headerName: "",
      flex: isMobile ? null : 1,
      valueGetter: (value, row, column, apiRef) => ({
        name: row.name,
        logo: row.logo,
      }),
      renderCell: ({ value }) => (
        <ClubLogo name={value.name} logo={value.logo} width={32} height={32} />
      ),
      display: "flex",
      disableExport: true,
      disableColumnMenu: true,
      sortable: false,
    },
    ...(isMobile
      ? []
      : [
          {
            field: "code",
            headerName: "Code",
            flex: 3,
          },
        ]),
    {
      field: "name",
      headerName: "Name",
      flex: isMobile ? null : 6,
      renderCell: (p) =>
        p.value ? (
          <Typography
            variant="body2"
            style={{
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
            {p.value}
          </Typography>
        ) : (
          p.value
        ),
      display: "flex",
    },
    ...(isDesktop
      ? [
          {
            field: "email",
            headerName: "Email",
            flex: 6,
            renderCell: ({ value }) => (
              <Box
                sx={{
                  textTransform: "lowercase",
                  fontSize: "0.9em",
                  fontFamily: "monospace",
                }}
              >
                {value}
              </Box>
            ),
            display: "flex",
          },
        ]
      : []),
    {
      field: "category",
      headerName: "Category",
      flex: isMobile ? null : 2,
      valueGetter: (value, row, column, apiRef) =>
        value === "body" ? "Student Body" : value,
      renderCell: ({ value }) => (
        <Box
          sx={{
            textTransform: "capitalize",
          }}
        >
          {value}
        </Box>
      ),
      display: "flex",
    },
    {
      field: "state",
      headerName: "State",
      align: "center",
      headerAlign: "center",
      flex: isMobile ? null : 2,
      renderCell: ({ value }) => (
        <Tag
          label={value}
          color={value === "active" ? "success" : "error"}
          sx={{ my: 2 }}
        />
      ),
      display: "flex",
    },
  ];

  if (!clubs) return null;
  return (
    <DataGrid
      autoHeight
      getRowHeight={() => (isMobile ? "auto" : null)}
      rows={clubs}
      columns={columns}
      getRowId={(r) => r.cid}
      onRowClick={(params) => router.push(`/manage/clubs/${params.row.cid}`)}
      disableRowSelectionOnClick
      initialState={{
        sorting: {
          sortModel: [{ field: "name", sort: "asc" }],
        },
        filter: {
          filterModel: {
            items: [],
            quickFilterLogicOperator: GridLogicOperator.Or,
          },
        },
        pagination: {
          paginationModel: { pageSize: 25 },
        },
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
