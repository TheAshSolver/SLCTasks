import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_MEMBERS, GET_PENDING_MEMBERS } from "gql/queries/members";
import { GET_USER_PROFILE } from "gql/queries/users";

import Icon from "components/Icon";
import ButtonLink from "components/Link";
import MembersFilter from "components/members/MembersFilter";
import MembersTable from "components/members/MembersTable";

export const metadata = {
  title: "Manage Members",
};

export default async function ManageMembers(props) {
  const searchParams = await props.searchParams;
  // const targetName = searchParams?.name;
  const targetClub = searchParams?.club;
  const targetState = [
    ...(searchParams?.current === "true" ? ["current"] : []),
    ...(searchParams?.past === "true" ? ["past"] : []),
  ];
  const onlyCurrent = searchParams?.current === "true";
  const onlyPast = searchParams?.past === "true";

  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };

  return (
    <Container>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Manage Members
        </Typography>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Button
            component={ButtonLink}
            href="/manage/members/bulk-add"
            variant="contained"
            startIcon={<Icon variant="playlist-add" />}
          >
            Bulk Add
          </Button>
          <Button
            component={ButtonLink}
            href="/manage/members/bulk-edit"
            variant="contained"
            startIcon={<Icon variant="edit" />}
            color="warning"
          >
            Bulk Edit
          </Button>
          <Button
            component={ButtonLink}
            href="/manage/members/new"
            variant="contained"
            startIcon={<Icon variant="add" />}
            color="secondary"
          >
            New Member
          </Button>
        </Stack>
      </Stack>
      {/* only pending members */}
      {user?.role === "cc" ? <PendingMembersDataGrid /> : null}
      {/* all members */}
      <Box>
        <Box>
          {user?.role === "cc" ? (
            <>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                All Members
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                }}
              >
                <MembersFilter
                  // name={targetName}
                  // name={targetName}
                  club={targetClub}
                  state={targetState}
                  cc={true}
                />
              </Box>
            </>
          ) : null}
          {user?.role === "club" || targetClub ? (
            <>
              {user?.role !== "cc" ? (
                <>
                  <Box
                    sx={{
                      mt: 2,
                      mb: 3,
                    }}
                  >
                    <MembersFilter
                      // name={targetName}
                      // name={targetName}
                      club={targetClub}
                      state={targetState}
                      cc={false}
                    />
                  </Box>
                </>
              ) : null}
              <MembersDataGrid
                club={user?.role === "club" ? user?.uid : targetClub}
                onlyCurrent={onlyCurrent}
                onlyPast={onlyPast}
              />
            </>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
}

async function PendingMembersDataGrid() {
  const { data: { pendingMembers } = {} } =
    await getClient().query(GET_PENDING_MEMBERS);

  // TODO: convert MembersTable to a server component and fetch user profile for each row (for lazy-loading perf improvement)
  // concurrently fetch user profile for each member
  const userPromises = [];
  pendingMembers?.forEach((member) => {
    userPromises.push(
      getClient().query(GET_USER_PROFILE, {
        userInput: {
          uid: member.uid,
        },
      }),
    );
  });
  const users = await Promise.all(userPromises);
  const processedMembers = pendingMembers.map((member, index) => ({
    ...member,
    ...users[index].data.userProfile,
    ...users[index].data.userMeta,
    mid: `${member.cid}:${member.uid}`,
  }));

  return (
    <>
      {processedMembers.length > 0 ? (
        <Box
          sx={{
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            Pending Approval
          </Typography>
          <MembersTable
            members={processedMembers}
            showClub={true}
            showIcon={false}
          />
        </Box>
      ) : null}
    </>
  );
}

async function MembersDataGrid({
  club,
  onlyCurrent = false,
  onlyPast = false,
}) {
  const { data: { members } = {} } = await getClient().query(GET_MEMBERS, {
    clubInput: { cid: club },
  });

  const currentYear = (new Date().getFullYear() + 1).toString();

  // filter only the required members (current | past | both)
  const targetMembers = members?.filter((member) => {
    const latestYear = extractLatestYear(member).toString();
    const isCurrent = onlyCurrent && latestYear === currentYear;
    const isPast = onlyPast && latestYear !== currentYear;

    return (!onlyCurrent && !onlyPast) || isCurrent || isPast;
  });

  // TODO: convert MembersTable to a server component and fetch user profile for each row (for lazy-loading perf improvement)
  // concurrently fetch user profile for each member
  const userPromises = [];
  targetMembers?.forEach((member) => {
    userPromises.push(
      getClient().query(GET_USER_PROFILE, {
        userInput: {
          uid: member.uid,
        },
      }),
    );
  });
  const users = await Promise.all(userPromises);
  const processedMembers = targetMembers.map((member, index) => ({
    ...member,
    ...users[index].data.userProfile,
    ...users[index].data.userMeta,
    mid: `${member.cid}:${member.uid}`,
  }));

  return <MembersTable members={processedMembers} />;
}

// get the last year a member was in the club
// if member is still present, return current year + 1
function extractLatestYear(member) {
  return Math.max(
    ...member.roles.map((r) =>
      !r.endYear ? new Date().getFullYear() + 1 : r.endYear,
    ),
  );
}
