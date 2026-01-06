"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Button,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import Icon from "components/Icon";
import { useToast } from "components/Toast";

import { getActiveClubIds } from "actions/clubs/ids/server_action";

export default function EventsFilter({ name, club, state }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { triggerToast } = useToast();

  // fetch list of clubs
  const [clubs, setClubs] = useState([]);
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
        setClubs(res.data);
      }
    })();
  }, []);

  // track name field
  const [targetName, setTargetName] = useState(name || "");

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack
            component="form"
            direction="row"
            spacing={1}
            onSubmit={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              if (targetName === "") params.delete("name");
              else params.set("name", targetName);
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <TextField
              label="Search by name"
              autoComplete="off"
              variant="outlined"
              fullWidth
              onChange={(e) => setTargetName(e?.target?.value)}
              value={targetName}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon variant="search" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" variant="contained">
              Search
            </Button>
          </Stack>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="clubid">Filter by Club/Student Body</InputLabel>
            <Select
              labelId="clubid"
              label="Filter by Club/Student Body"
              fullWidth
              onChange={(e) => {
                e.preventDefault();
                const params = new URLSearchParams(searchParams);
                if (e?.target?.value === "") params.delete("club");
                else params.set("club", e?.target?.value);
                router.push(`${pathname}?${params.toString()}`);
              }}
              value={club || ""}
            >
              <MenuItem key="all" value="">
                All Clubs
              </MenuItem>
              {clubs
                ?.slice()
                ?.sort((a, b) => a.name.localeCompare(b.name))
                ?.map((club) => (
                  <MenuItem key={club.cid} value={club.cid}>
                    {club.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid
          size={{
            xs: "grow",
            lg: "grow",
          }}
        >
          <ToggleButtonGroup
            id="eventStatus"
            fullWidth
            value={state}
            color="primary"
            sx={{ height: "100%" }}
            onChange={(e, newState) => {
              e.preventDefault();

              const upcomingSelected = newState.includes("upcoming");
              const completedSelected = newState.includes("completed");

              const params = new URLSearchParams(searchParams);
              if (upcomingSelected && completedSelected) {
                params.delete("upcoming");
                params.delete("completed");
              } else {
                params.set("upcoming", upcomingSelected);
                params.set("completed", completedSelected);
              }

              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <ToggleButton disableRipple key="upcoming" value="upcoming">
              Upcoming
            </ToggleButton>
            <ToggleButton disableRipple key="completed" value="completed">
              Completed
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Container>
  );
}
