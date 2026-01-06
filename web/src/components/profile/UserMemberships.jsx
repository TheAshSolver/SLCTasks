"use client";

import { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";

import { useToast } from "components/Toast";

import { getActiveClubIds } from "actions/clubs/ids/server_action";

const colors = {
  cultural: "#FFE0B2", // Light Orange
  technical: "#E3F2FD", // Light Blue
  affinity: "#F3E5F5", // Light Purple
  admin: "#FFCDD2", // Light Red
  body: "#ddf5ddff", // Light Green
  other: "#F5F5F5", // Light Gray
};
const colorsDarkTheme = {
  cultural: "#DF8700", // Dark Orange
  technical: "#1565C0", // Dark Blue
  affinity: "#6A1B9A", // Dark Purple
  admin: "#C62828", // Dark Red
  body: "#388E3C", // Dark Green
  other: "#424242", // Dark Gray
};
const displayNames = {
  cultural: "Cultural Club",
  technical: "Technical Club",
  affinity: "Affinity Group",
  admin: "Admin",
  body: "Student Body",
  other: "Other",
};

export default function UserMemberships({ rows = [] }) {
  const { triggerToast } = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const legendColors = isDark ? colorsDarkTheme : colors;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [clubs, setClubs] = useState([]);

  // Get categories that are actually present in the user's club memberships
  const getActiveCategoriesFromUserClubs = () => {
    const categories = new Set();
    rows.forEach((row) => {
      const club = clubs[row.cid];
      if (club?.category) {
        categories.add(club.category);
      }
    });
    return Array.from(categories).sort();
  };

  useEffect(() => {
    (async () => {
      let res = await getActiveClubIds();
      if (!res.ok) {
        triggerToast({
          title: "Unable to fetch clubs",
          messages: res.error.messages,
          severity: "error",
        });
      } else {
        const clubsData = res.data.reduce((acc, { cid, name, category }) => {
          acc[cid] = { name, category };
          return acc;
        }, {});

        setClubs(clubsData);
      }
    })();
  }, []);

  const columns = [
    {
      field: "name",
      headerName: "Role",
      flex: isMobile ? null : 7,
      renderCell: (p) => {
        return (
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
        );
      },
      display: "flex",
    },
    {
      field: "cid",
      headerName: "Club/Student Body",
      flex: isMobile ? null : 5,
      renderCell: (p) => {
        const club = clubs[p.value];
        const backgroundColor = club?.category
          ? legendColors[club.category]
          : "transparent";

        return (
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
              backgroundColor,
              padding: "4px 8px",
              borderRadius: "4px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {club?.name || "Unknown Club"}
          </Typography>
        );
      },
      display: "flex",
    },
    {
      field: "startYear",
      headerName: "Start Year",
      headerAlign: "center",
      align: "center",
      flex: isMobile ? null : 3,
    },
    {
      field: "endYear",
      headerName: "End Year",
      headerAlign: "center",
      align: "center",
      valueGetter: (value, row, column, apiRef) => row.endYear || "-",
      flex: isMobile ? null : 3,
    },
  ];

  return (
    <>
      {rows?.length ? (
        <>
          <DataGrid
            autoHeight
            getRowHeight={() => (isMobile ? "auto" : null)}
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            getRowId={(row) => row.rid}
            initialState={{
              sorting: {
                sortModel: [{ field: "endYear", sort: "desc" }],
              },
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              // disable cell selection style
              ".MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />

          {/* Category Legend */}
          {getActiveCategoriesFromUserClubs().length > 0 && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                {getActiveCategoriesFromUserClubs().map((category) => (
                  <Box
                    key={category}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: legendColors[category],
                        borderRadius: "20px",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                        fontWeight: 400,
                      }}
                    >
                      {displayNames[category] || category}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </>
      ) : (
        "No Memberships Found!"
      )}
    </>
  );
}
