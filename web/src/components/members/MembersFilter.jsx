"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { useToast } from "components/Toast";

import { getActiveClubIds } from "actions/clubs/ids/server_action";

export default function MembersFilter({ club, state, cc = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { triggerToast } = useToast();

  // get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  // show both current and past if no state is selected
  useEffect(() => {
    if (state.length === 0)
      router.push(
        `${pathname}?current=true&past=false${club ? `&club=${club}` : ""}`,
      );
  }, [state, club]);

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

  return (
    <Container>
      <Grid container spacing={2}>
        {cc && (
          <Grid
            size={{
              xs: 12,
              lg: club ? 8 : 12,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="clubid">Filter by club</InputLabel>
              <Select
                labelId="clubid"
                label="Filter by club"
                fullWidth
                onChange={(e) =>
                  router.push(
                    `${pathname}?${createQueryString("club", e?.target?.value)}`,
                  )
                }
                value={club || ""}
              >
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
        )}
        {club ? (
          <Grid
            size={{
              xs: "grow",
              lg: "grow",
            }}
          >
            <ToggleButtonGroup
              fullWidth
              value={state}
              color="primary"
              sx={{ height: "100%" }}
              onChange={(e) => {
                // don't do anything if all states are being unselected
                if (state.length === 1 && state.includes(e?.target?.value))
                  return;

                return router.push(
                  `${pathname}?${createQueryString(
                    e?.target?.value,
                    !state.includes(e?.target?.value),
                  )}`,
                );
              }}
            >
              <ToggleButton disableRipple key="current" value="current">
                Current Members
              </ToggleButton>
              <ToggleButton disableRipple key="past" value="past">
                Past Members
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        ) : null}
      </Grid>
    </Container>
  );
}
