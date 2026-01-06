import { MDXRemote } from "next-mdx-remote/rsc";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { getClient } from "gql/client";
import { GET_MEMBERS } from "gql/queries/members";

import Icon from "components/Icon";
import ButtonLink from "components/Link";
import LocalUsersGrid from "components/users/LocalUsersGrid";
import { getNginxFile } from "utils/files";

import { techTeamWords } from "constants/ccMembersFilterWords";

import Status from "./status.mdx";

const limit = 20;
const releases = [
  {
    version: "2.2",
    date: "November 2024",
    description: "Changed from Clubs Council website to Life @ IIIT-H.",
  },
  {
    version: "2.1",
    date: "May 2023",
    description: "Moved to Next.js server components.",
  },
  {
    version: "2.0",
    date: "April 2023",
    description:
      "Complete UI overhaul with Material Design and Next.js. Complete change of backend to Microservices and GraphQL.",
  },
  {
    version: "1.0",
    date: "15 August, 2023",
    description:
      "The very first version of the website using React and Monolithic backend using Django.",
  },
];

export const metadata = {
  title: "Changelog | Life @ IIIT-H",
};

export default async function Changelog(props) {
  const searchParams = await props.searchParams;
  const show_all = searchParams?.all === "true" ? true : false;

  const { data: { members } = {} } = await getClient().query(GET_MEMBERS, {
    clubInput: {
      cid: "clubs",
    },
  });

  const techMembers = members
    ?.map((member) => {
      const { roles } = member;
      const techTeamRoles = filterRoles(roles, techTeamWords);
      const newMember = { ...member, roles: techTeamRoles };
      return newMember;
    })
    ?.filter((member) => {
      return member.roles.length > 0;
    })
    ?.sort((a, b) => {
      const roleNameA = a.roles[0]?.name.toLowerCase();
      const roleNameB = b.roles[0]?.name.toLowerCase();
      if (roleNameA.includes("lead") && !roleNameB.includes("lead")) {
        return -1;
      }
      if (roleNameB.includes("lead") && !roleNameA.includes("lead")) {
        return 1;
      }
      if (roleNameA.includes("advisor") && !roleNameB.includes("advisor")) {
        return 1;
      }
      if (roleNameB.includes("advisor") && !roleNameA.includes("advisor")) {
        return -1;
      }

      return 0;
    });

  const status = await fetch(getNginxFile("json/status.json"), {
    next: { revalidate: 10 * 60 }, // 10 minutes
  });
  const logs = await fetch(getNginxFile("mdx/logs.mdx"), {
    next: { revalidate: 10 * 60 }, // 10 minutes
  });

  let logsText = await logs.text();

  return (
    <Container>
      <Typography variant="h3">Status</Typography>
      <Box
        sx={{
          "& a": {
            color: "text.link",
          },
        }}
      >
        <Status status={await status.json()} version={2.2} />
        <VersionHistory />
      </Box>
      <Stack
        direction="row"
        sx={{
          pt: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            mt: 3,
          }}
        >
          Maintainers
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="none"
          color="secondary"
          component={ButtonLink}
          href="/tech-team/members"
        >
          <Typography
            variant="button"
            sx={{
              color: "text.primary",
            }}
          >
            View all
          </Typography>
          <Icon variant="chevron-right" />
        </Button>
      </Stack>
      {techMembers?.length ? <LocalUsersGrid users={techMembers} /> : null}
      <Stack
        direction="row"
        sx={{
          pt: 2,
          mb: 2,
          mt: 3,
        }}
      >
        <Typography variant="h3">Changelog</Typography>
        {logsText.split("\n").length > limit ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {show_all ? (
                <Button
                  variant="none"
                  color="secondary"
                  component={ButtonLink}
                  href="/changelog"
                >
                  <Icon variant="chevron-left" />
                  <Typography
                    variant="button"
                    sx={{
                      color: "text.primary",
                    }}
                  >
                    View less
                  </Typography>
                </Button>
              ) : (
                <Button
                  variant="none"
                  color="secondary"
                  component={ButtonLink}
                  href="/changelog?all=true"
                >
                  <Typography
                    variant="button"
                    sx={{
                      color: "text.primary",
                    }}
                  >
                    View all
                  </Typography>
                  <Icon variant="chevron-right" />
                </Button>
              )}
            </Box>
          </>
        ) : null}
      </Stack>
      <MDXRemote
        source={
          show_all ? logsText : logsText?.split("\n").slice(0, limit).join("\n")
        }
      />
      {logsText.split("\n").length > limit ? (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2,
          }}
        >
          Showing {show_all ? logsText?.split("\n").length : limit} of{" "}
          {logsText?.split("\n").length} entries.
        </Typography>
      ) : null}
    </Container>
  );
}

const filterRoles = (roles, filterWords) => {
  let filteredRoles = roles?.filter((role) => {
    const { name, endYear } = role;
    const lowercaseName = name.toLowerCase();
    return filterWords.some(
      (word) => lowercaseName.includes(word) && endYear === null,
    );
  });
  if (filteredRoles?.length > 0)
    return roles?.filter((role) => {
      const { name, endYear } = role;
      const lowercaseName = name.toLowerCase();
      return filterWords.some((word) => lowercaseName.includes(word));
    });
  else return filteredRoles;
};

const VersionHistory = () => {
  return (
    <Accordion>
      <AccordionSummary
        aria-controls="panel1-content"
        id="panel1-header"
        style={{ marginLeft: "5px", cursor: "pointer", color: "#444" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "text.primary" }}>
            View releases/version history
          </Typography>
          <ArrowDropDownIcon
            sx={{
              marginLeft: "8px",
              color: "text.primary",
            }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails
        style={{
          marginLeft: "5px",
          borderLeft: "2px solid #eaeaea",
        }}
      >
        <List style={{ padding: 0, margin: 0 }}>
          {releases.map((release, index) => (
            <ListItem
              key={index}
              style={{
                marginBottom: index === releases.length - 1 ? 0 : "8px",
              }}
            >
              <ListItemText
                primary={<strong>{release.version}</strong>}
                secondary={`(${release.date}) - ${release.description}`}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
