import { Box, Divider, Grid } from "@mui/material";

export default function ActionPalette({
  left = [],
  right = [],
  leftProps = [],
  rightProps = [],
  downloadbtn = "",
  rightJustifyMobile = "center",
}) {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Grid
        container
        direction={{ xs: "column-reverse", md: "row" }}
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Grid
          container
          spacing={1}
          sx={{
            justifyContent: { xs: "center", md: "flex-start" },
            alignItems: "center",
            my: 0.5,
          }}
          size={{
            xs: 12,
            md: 6,
          }}
        >
          {left.map((Component, key) => (
            <Grid key={key} size="auto">
              <Component {...leftProps[key]} />
            </Grid>
          ))}
        </Grid>

        <Grid
          container
          spacing={1}
          sx={{
            justifyContent: { xs: rightJustifyMobile, md: "flex-end" },
            alignItems: "center",
            my: 0.5,
          }}
          size={{
            xs: 12,
            md: 6,
          }}
        >
          {right.map((Component, key) => (
            <Grid key={key} size="auto">
              <Component {...rightProps[key]} />
            </Grid>
          ))}
          {downloadbtn ? <Grid>{downloadbtn}</Grid> : ""}
        </Grid>
      </Grid>
      <Divider sx={{ borderStyle: "dashed", mt: 2, mb: 2 }} />
    </Box>
  );
}
